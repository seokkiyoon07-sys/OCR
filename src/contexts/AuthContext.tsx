'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface AuthContextValue {
  userId: string | null;
  displayName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasMounted: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// SNarGPT API - nginx 프록시를 통해 same-origin으로 접근
// ocr.snargpt.ai/snargpt-api/* → snargpt.ai/api/*
const SNARGPT_API_BASE = '/snargpt-api';

// 로컬 스토리지 키 (캐시용)
const AUTH_CACHE_KEY = 'snar-ocr-auth-cache';

interface AuthCache {
  userId: string;
  displayName: string | null;
  timestamp: number;
}

// 캐시 유효 시간 (5분)
const CACHE_TTL = 5 * 60 * 1000;

const getAuthCache = (): AuthCache | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    const cache: AuthCache = JSON.parse(raw);
    // 캐시가 만료되었으면 무시
    if (Date.now() - cache.timestamp > CACHE_TTL) {
      localStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    }
    return cache;
  } catch {
    return null;
  }
};

const setAuthCache = (userId: string, displayName: string | null) => {
  if (typeof window === 'undefined') return;
  const cache: AuthCache = { userId, displayName, timestamp: Date.now() };
  localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
};

const clearAuthCache = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_CACHE_KEY);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SNarGPT 백엔드에서 인증 상태 확인 (쿠키 기반)
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // SNarGPT의 /api/auth/me 엔드포인트로 인증 확인 (nginx 프록시 경로)
      // same-origin이므로 쿠키가 자동으로 전송됨
      const response = await fetch(`${SNARGPT_API_BASE}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data?.user;
        if (user?.id || user?.username) {
          const uid = user.username || user.id;
          const name = user.displayName || user.nickname || user.name || null;
          setUserId(uid);
          setDisplayName(name);
          setAuthCache(uid, name);
        } else {
          setUserId(null);
          setDisplayName(null);
          clearAuthCache();
        }
      } else if (response.status === 401) {
        // 인증되지 않음
        setUserId(null);
        setDisplayName(null);
        clearAuthCache();
      } else {
        // 기타 에러 - 캐시가 있으면 사용
        const cache = getAuthCache();
        if (cache) {
          setUserId(cache.userId);
          setDisplayName(cache.displayName);
        } else {
          setUserId(null);
          setDisplayName(null);
        }
      }
    } catch (err) {
      // 네트워크 에러 - 캐시가 있으면 사용
      const cache = getAuthCache();
      if (cache) {
        setUserId(cache.userId);
        setDisplayName(cache.displayName);
      } else {
        setUserId(null);
        setDisplayName(null);
      }
      console.warn('Auth check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      // SNarGPT 로그아웃 호출 (쿠키 삭제)
      await fetch(`${SNARGPT_API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // 로그아웃 실패해도 로컬 상태는 초기화
    }
    setUserId(null);
    setDisplayName(null);
    setError(null);
    clearAuthCache();
  }, []);

  // 마운트 시 인증 상태 확인
  useEffect(() => {
    setHasMounted(true);
    
    // 먼저 캐시에서 로드 (빠른 초기화)
    const cache = getAuthCache();
    if (cache) {
      setUserId(cache.userId);
      setDisplayName(cache.displayName);
    }
    
    // 서버에서 인증 상태 확인
    checkAuth();
  }, [checkAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      userId,
      displayName,
      isAuthenticated: Boolean(userId),
      isLoading,
      hasMounted,
      error,
      checkAuth,
      logout,
    }),
    [userId, displayName, isLoading, hasMounted, error, checkAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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
  isAuthenticated: boolean;
  isLoading: boolean;
  hasMounted: boolean; // Added to track client-side mount state
  error: string | null;
  login: (userId: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  bypassAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_STORAGE_KEY = 'snar-auth';
const rawApiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  '';
const API_BASE = rawApiBase ? rawApiBase.replace(/\/+$/, '') : '';
const FALLBACK_API_PORT = (process.env.NEXT_PUBLIC_API_PORT || '8000').replace(/^:/, '');

const computeBrowserApiBase = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  const { protocol, hostname } = window.location;
  if (!hostname) {
    return '';
  }
  const portSegment = FALLBACK_API_PORT ? `:${FALLBACK_API_PORT}` : '';
  return `${protocol}//${hostname}${portSegment}`;
};

const shouldUseBrowserBase = () => {
  if (!API_BASE) {
    return true;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  const hostname = window.location.hostname;
  if (!hostname) {
    return false;
  }
  return (
    hostname !== 'localhost' &&
    hostname !== '127.0.0.1' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)/.test(API_BASE)
  );
};

export const resolveApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = shouldUseBrowserBase() ? computeBrowserApiBase() : API_BASE;
  return base ? `${base}${normalizedPath}` : normalizedPath;
};

const getStoredUserId = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.userId === 'string' && parsed.userId.trim()) {
      return parsed.userId;
    }
  } catch {
    // Ignore malformed storage data
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize as null to avoid hydration mismatch (localStorage not available on server)
  const [userId, setUserId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read localStorage only after client-side mount to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
    const storedUserId = getStoredUserId();
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    // Resync storage in case it changes outside React (e.g. manual clear)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY) {
        setUserId(getStoredUserId());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const persistUserId = useCallback((value: string | null) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (value && value.trim()) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId: value }));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (loginId: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: loginId, password }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = (payload && payload.detail) || '로그인에 실패했습니다.';
          setError(message);
          return { ok: false as const, message };
        }

        const authenticatedId = (payload && payload.userId) || loginId;
        setUserId(authenticatedId);
        persistUserId(authenticatedId);
        return { ok: true as const, message: payload && payload.message };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '네트워크 오류가 발생했습니다.';
        setError(message);
        return { ok: false as const, message };
      } finally {
        setIsLoading(false);
      }
    },
    [persistUserId],
  );

  const bypassAuth = useCallback(() => {
    const developerId = 'developer';
    setUserId(developerId);
    persistUserId(developerId);
    setError(null);
  }, [persistUserId]);

  const logout = useCallback(() => {
    setUserId(null);
    setError(null);
    persistUserId(null);
  }, [persistUserId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      userId,
      isAuthenticated: Boolean(userId),
      isLoading,
      hasMounted,
      error,
      login,
      bypassAuth,
      logout,
    }),
    [userId, isLoading, hasMounted, error, login, bypassAuth, logout],
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

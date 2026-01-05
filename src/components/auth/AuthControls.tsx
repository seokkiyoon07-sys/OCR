'use client';

import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// SNarGPT 로그인 페이지 URL
const SNARGPT_LOGIN_URL = 'https://snargpt.ai/signin';

export default function AuthControls() {
  const { isAuthenticated, userId, logout, hasMounted } = useAuth();

  // SNarGPT 로그인 페이지로 리다이렉트 (현재 URL을 redirect 파라미터로 전달)
  const handleLogin = () => {
    const currentUrl = window.location.href;
    const loginUrl = `${SNARGPT_LOGIN_URL}?redirect=${encodeURIComponent(currentUrl)}`;
    window.location.href = loginUrl;
  };

  // Render consistent UI on server and client before hydration completes
  // This prevents hydration mismatch between server (always shows login) and client
  if (!hasMounted) {
    return (
      <button
        className="px-3 py-2 text-sm rounded-xl bg-black text-white hover:bg-neutral-800"
        type="button"
        disabled
      >
        로그인
      </button>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm text-neutral-700">
            <User size={16} />
            {userId}
          </span>
          <button
            className="px-3 py-2 text-sm rounded-xl bg-black text-white hover:bg-neutral-800"
            type="button"
            onClick={logout}
          >
            로그아웃
          </button>
        </div>
      ) : (
        <button
          className="px-3 py-2 text-sm rounded-xl bg-black text-white hover:bg-neutral-800"
          type="button"
          onClick={handleLogin}
        >
          로그인
        </button>
      )}
    </>
  );
}


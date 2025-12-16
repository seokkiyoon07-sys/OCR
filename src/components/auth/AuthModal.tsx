'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, isLoading, error } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setUserId('');
      setPassword('');
      setLocalError(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUserId = userId.trim();
    if (!trimmedUserId || !password) {
      setLocalError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    const result = await login(trimmedUserId, password);
    if (result.ok) {
      onClose();
    } else {
      setLocalError(result.message || '로그인에 실패했습니다.');
    }
  };

  const displayError = localError || error;

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-20 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">로그인</h3>
            <button
              className="px-2 py-1 text-sm rounded-lg hover:bg-neutral-100"
              type="button"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="아이디"
            type="text"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            autoComplete="username"
          />
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          {displayError && (
            <p className="text-sm text-red-500 text-center">{displayError}</p>
          )}
          <button
            className="w-full px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:opacity-60"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
          <p className="text-sm text-center text-neutral-600">
            계정이 없으신가요?{' '}
            <span className="text-black font-medium cursor-pointer hover:underline">
              회원가입
            </span>
          </p>
        </form>
      </div>
    </div>
  );

  // 포탈을 사용해 document.body에 렌더링하여 항상 뷰포트 중앙에 표시되도록 함
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}


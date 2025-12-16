'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import AuthModal from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthControls() {
  const { isAuthenticated, userId, logout, hasMounted } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
          onClick={openModal}
        >
          로그인
        </button>
      )}
      <AuthModal open={isModalOpen && !isAuthenticated} onClose={closeModal} />
    </>
  );
}


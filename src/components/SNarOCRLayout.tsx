'use client';

import { useSNarOCRNavigation } from '@/hooks/useSNarOCRNavigation';
import { Home, Upload, BarChart3, CreditCard, HelpCircle, User } from 'lucide-react';
import AuthControls from '@/components/auth/AuthControls';

interface SNarOCRLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export default function SNarOCRLayout({ children, currentPage = 'landing' }: SNarOCRLayoutProps) {
  const { navigateTo } = useSNarOCRNavigation();

  const handleGoto = (page: string) => {
    navigateTo(page);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-black"></div>
            <div className="flex flex-col">
              <div className="text-lg font-semibold">SNar OCR 채점기</div>
              <div className="text-xs text-blue-600 font-medium">by SN독학기숙학원</div>
            </div>
            <span className="hidden rounded-full border px-2 py-0.5 text-xs text-neutral-600 md:inline-block">Beta</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 text-sm rounded-lg hover:bg-neutral-100"
              onClick={() => handleGoto('pricing')}
            >
              요금제
            </button>
            <button
              className="px-3 py-2 text-sm rounded-lg hover:bg-neutral-100"
              onClick={() => handleGoto('faq')}
            >
              문의
            </button>
            <AuthControls />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:block">
          <nav className="space-y-1">
            <button
              className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                currentPage === 'landing' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
              onClick={() => handleGoto('landing')}
            >
              <Home size={16} />
              홈
            </button>
            <button
              className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                currentPage === 'upload' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
              onClick={() => handleGoto('upload')}
            >
              <Upload size={16} />
              채점 업로드
            </button>
            <button
              className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                currentPage === 'results' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
              onClick={() => handleGoto('results')}
            >
              <BarChart3 size={16} />
              학원별 채점결과 다운로드
            </button>
            <button
              className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                currentPage === 'individual-results' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
              onClick={() => handleGoto('individual-results')}
            >
              <User size={16} />
              개인별 채점 결과
            </button>
            <button
              className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                currentPage === 'pricing' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
              onClick={() => handleGoto('pricing')}
            >
              <CreditCard size={16} />
              요금제
            </button>
            <button
              className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                currentPage === 'faq' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
              onClick={() => handleGoto('faq')}
            >
              <HelpCircle size={16} />
              FAQ
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="space-y-6">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-black"></div>
              <span className="text-sm font-medium text-neutral-700">SNarOCR 채점기</span>
              <span className="text-xs text-neutral-500">- powered by</span>
              <span className="text-sm font-semibold text-blue-600">SN독학기숙학원</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span>© 2025 SN독학기숙학원</span>
              <span>•</span>
              <span>AI 기반 수능 채점 솔루션</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

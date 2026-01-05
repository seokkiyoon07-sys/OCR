'use client';

import { useSNarOCRNavigation } from '@/hooks/useSNarOCRNavigation';
import { Home, Upload, BarChart3, CreditCard, HelpCircle, User, Users, ClipboardList } from 'lucide-react';
import AuthControls from '@/components/auth/AuthControls';
import HTMLComment from '@/components/HTMLComment';
import { useAuth } from '@/contexts/AuthContext';

interface SNarOCRLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export default function SNarOCRLayout({ children, currentPage = 'landing' }: SNarOCRLayoutProps) {
  const { navigateTo } = useSNarOCRNavigation();
  const { isAuthenticated } = useAuth();

  const handleGoto = (page: string) => {
    navigateTo(page);
  };

  return (
    <div className="min-h-screen bg-neutral-50" data-debug="SNarOCRLayout-ROOT">
      <HTMLComment text="DEBUG: SNarOCRLayout ROOT START" />
      
      <HTMLComment text="DEBUG: HEADER START" />
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur" data-debug="HEADER">
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
      <HTMLComment text="DEBUG: HEADER END" />

      <HTMLComment text="DEBUG: BODY GRID START" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[260px_1fr]" data-debug="BODY-GRID">
        <HTMLComment text="DEBUG: SIDEBAR START" />
        <aside className="hidden md:block" data-debug="SIDEBAR">
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
            {/* 채점결과 메뉴 - 로그인 시에만 표시 */}
            {isAuthenticated && (
              <>
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
                  성적표 발급
                </button>
              </>
            )}
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

            {/* 관리자 메뉴 - 로그인 시에만 표시 */}
            {isAuthenticated && (
              <>
                <div className="my-3 border-t border-neutral-200"></div>
                <div className="px-3 py-1 text-xs font-medium text-neutral-400 uppercase">관리자</div>

                <button
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                    currentPage === 'admin-students' ? 'bg-black text-white' : 'hover:bg-neutral-100'
                  }`}
                  onClick={() => handleGoto('admin-students')}
                >
                  <Users size={16} />
                  학생 관리
                </button>
                <button
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                    currentPage === 'admin-exams' ? 'bg-black text-white' : 'hover:bg-neutral-100'
                  }`}
                  onClick={() => handleGoto('admin-exams')}
                >
                  <ClipboardList size={16} />
                  시험 관리
                </button>
              </>
            )}
          </nav>
        </aside>
        <HTMLComment text="DEBUG: SIDEBAR END" />

        <HTMLComment text="DEBUG: MAIN CONTENT START" />
        <main className="space-y-6" data-debug="MAIN-CONTENT">
          {children}
        </main>
        <HTMLComment text="DEBUG: MAIN CONTENT END" />
      </div>
      <HTMLComment text="DEBUG: BODY GRID END" />

      <HTMLComment text="DEBUG: FOOTER START" />
      <footer className="border-t bg-white" data-debug="FOOTER">
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
      <HTMLComment text="DEBUG: FOOTER END" />
      
      <HTMLComment text="DEBUG: SNarOCRLayout ROOT END" />
    </div>
  );
}

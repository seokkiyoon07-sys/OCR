'use client';

import { useState } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import AdminView from '@/components/results/AdminView';
import AllStudentsView from '@/components/results/AllStudentsView';
import StudentView from '@/components/results/StudentView';
import { useAuth } from '@/contexts/AuthContext';
import { Lock } from 'lucide-react';

type Tab = 'GENERAL' | 'INDIVIDUAL_ADMIN';

export default function SNarOCRResults() {
  const { userId, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
  const [studentInfo, setStudentInfo] = useState<{ name: string; phoneNumber: string } | null>(null);

  const handleStudentSearch = (student: { name: string; phoneNumber: string }) => {
    setStudentInfo(student);
  };

  const resetStudentView = () => {
    setStudentInfo(null);
  };

  // Auth check
  if (authLoading) {
    return (
      <SNarOCRLayout currentPage="results">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </SNarOCRLayout>
    );
  }

  if (!userId) {
    return (
      <SNarOCRLayout currentPage="results">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500">
          <Lock size={48} className="mb-4 text-neutral-300" />
          <p className="text-lg font-medium">로그인이 필요합니다</p>
          <p className="text-sm mt-2">
            채점 결과를 확인하려면 로그인해주세요.
          </p>
          <a 
            href="https://snargpt.ai" 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            로그인하기
          </a>
        </div>
      </SNarOCRLayout>
    );
  }

  return (
    <SNarOCRLayout currentPage="results">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex p-1 bg-neutral-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('GENERAL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'GENERAL'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
              }`}
          >
            채점결과
          </button>
          <button
            onClick={() => {
              setActiveTab('INDIVIDUAL_ADMIN');
              setStudentInfo(null); // Reset selection when switching tabs to be safe
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'INDIVIDUAL_ADMIN'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
              }`}
          >
            개인별 채점결과 (관리자용)
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[600px]">
          {activeTab === 'GENERAL' ? (
            <AdminView />
          ) : (
            studentInfo ? (
              <StudentView
                studentName={studentInfo.name}
                phoneNumber={studentInfo.phoneNumber}
                onLogout={resetStudentView}
              />
            ) : (
              <AllStudentsView onSelectStudent={handleStudentSearch} />
            )
          )}
        </div>
      </div>
    </SNarOCRLayout>
  );
}

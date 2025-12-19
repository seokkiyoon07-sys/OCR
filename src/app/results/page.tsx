'use client';

import { useState } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import AdminView from '@/components/results/AdminView';
import AllStudentsView from '@/components/results/AllStudentsView';
import StudentView from '@/components/results/StudentView';

type Tab = 'GENERAL' | 'INDIVIDUAL_ADMIN';

export default function SNarOCRResults() {
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
  const [studentInfo, setStudentInfo] = useState<{ name: string; phoneNumber: string } | null>(null);

  const handleStudentSearch = (student: { name: string; phoneNumber: string }) => {
    setStudentInfo(student);
  };

  const resetStudentView = () => {
    setStudentInfo(null);
  };

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

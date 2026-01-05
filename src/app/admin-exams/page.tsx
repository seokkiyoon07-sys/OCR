'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { Select } from '@/components/ui/Select';
import { Plus, RefreshCw, Loader2, Lock } from 'lucide-react';
import { ExamModal, ExamsTable, Exam, ExamFromAPI } from '@/components/admin-exams';
import { useAuth } from '@/contexts/AuthContext';

// Use /api proxy path to avoid CSP issues
const API_BASE = '/api';

// 현재 연도
const currentYear = new Date().getFullYear();

export default function AdminExamsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'grades'>('questions');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // DB에서 가용 연도 목록 가져오기
  const fetchAvailableYears = useCallback(async () => {
    // 인증되지 않은 경우 데이터를 가져오지 않음
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${API_BASE}/exams/years`);
      if (response.ok) {
        const data = await response.json();
        setAvailableYears(data.years || []);
      }
    } catch (err) {
      console.error('Failed to fetch available years:', err);
    }
  }, [isAuthenticated]);

  // DB에서 시험 목록 가져오기
  const fetchExams = useCallback(async () => {
    // 인증되지 않은 경우 데이터를 가져오지 않음
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/exams/admin/list`;
      if (selectedYear && selectedYear !== 'all') {
        url += `?year=${selectedYear}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // API 응답을 Exam 인터페이스로 변환
      const mappedExams: Exam[] = (data.exams || []).map((e: ExamFromAPI) => ({
        id: e.id,
        name: e.name,
        examType: e.providerName?.includes('모의고사') || e.providerName?.includes('모평') ? '모의고사' : '일반시험',
        subject: e.subjectName || e.subjectCode || '미지정',
        subjectCode: e.subjectCode,
        providerName: e.providerName,
        examYear: e.examYear,
        examMonth: e.examMonth,
        examCode: e.examCode,
        gradeLevel: e.gradeLevel,
        date: e.examYear && e.examMonth ? `${e.examYear}-${String(e.examMonth).padStart(2, '0')}-01` : '',
        totalQuestions: e.totalQuestions,
        studentCount: e.studentCount,
        questions: [],
        gradeCutoffs: [],
        createdAt: e.createdAt,
      }));
      
      setExams(mappedExams);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setError(err instanceof Error ? err.message : '시험 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, isAuthenticated]);

  useEffect(() => {
    fetchAvailableYears();
  }, [fetchAvailableYears]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // 시험 상세 정답 조회
  const fetchExamQuestions = useCallback(async (exam: Exam) => {
    if (!exam.examCode && !exam.subjectCode) return;
    
    try {
      const payload = {
        metadata: {
          providerName: exam.providerName || null,
          examYear: exam.examYear || null,
          examMonth: exam.examMonth || null,
          examCode: exam.examCode || null,
          gradeLevel: exam.gradeLevel || null,
          subjectCode: exam.subjectCode || exam.subject,
          subjectName: exam.subject,
        }
      };
      
      const response = await fetch(`${API_BASE}/exams/answer-keys/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          // 정답 데이터를 exam에 업데이트 (metadata 포함)
          setExams(prevExams => prevExams.map(e => 
            e.id === exam.id 
              ? {
                  ...e,
                  questions: data.questions.map((q: { 
                    number: number; 
                    correctChoice?: number; 
                    correctText?: string; 
                    points?: number;
                    metadata?: { electiveSubject?: string } | null;
                  }) => ({
                    questionNumber: q.number,
                    correctAnswer: q.correctChoice?.toString() || q.correctText || '',
                    points: q.points || 2,
                    metadata: q.metadata || null,
                  }))
                }
              : e
          ));
        }
      }
    } catch (err) {
      console.error('Failed to fetch exam questions:', err);
    }
  }, []);

  // 시험 확장 시 정답 조회
  const handleExpandExam = useCallback((id: string | null) => {
    setExpandedExam(id);
    if (id) {
      const exam = exams.find(e => e.id === id);
      if (exam && exam.questions.length === 0) {
        fetchExamQuestions(exam);
      }
    }
  }, [exams, fetchExamQuestions]);

  // 연도 옵션 생성 (DB에서 가져온 연도 + 기본 연도)
  const yearOptions = useMemo(() => {
    const allYears = new Set([...availableYears, currentYear, currentYear - 1]);
    const sortedYears = Array.from(allYears).sort((a, b) => b - a);
    return [
      { value: 'all', label: '전체 연도' },
      ...sortedYears.map(y => ({ value: String(y), label: `${y}년` })),
    ];
  }, [availableYears]);

  const handleDelete = async (id: string) => {
    const examToDelete = exams.find(e => e.id === id);
    if (!examToDelete) return;

    // Confirm deletion
    const confirmMessage = `"${examToDelete.name}" 시험을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Delete exam from database using DELETE /api/exams/{exam_id}
    try {
      const response = await fetch(`${API_BASE}/exams/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `삭제 실패: HTTP ${response.status}`);
      }

      // Update local state after successful deletion
      setExams(exams.filter(e => e.id !== id));
      if (expandedExam === id) {
        setExpandedExam(null);
      }
    } catch (err) {
      console.error('Failed to delete exam:', err);
      alert(err instanceof Error ? err.message : '시험 삭제에 실패했습니다.');
    }
  };

  const handleSaveExam = async () => {
    // Refresh the list from DB after save
    setEditingExam(null);
    setIsAddModalOpen(false);
    await fetchExams();
    await fetchAvailableYears();
  };

  return (
    <SNarOCRLayout currentPage="admin-exams">
      {/* 로그인 필요 메시지 */}
      {!authLoading && !isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-md">
            <Lock size={48} className="mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">로그인이 필요합니다</h2>
            <p className="text-sm text-neutral-600 mb-4">
              시험 관리 페이지는 로그인한 사용자만 접근할 수 있습니다.<br />
              우측 상단의 로그인 버튼을 클릭하여 로그인해 주세요.
            </p>
          </div>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">시험 관리</h1>
              <p className="text-sm text-neutral-500 mt-1">
                DB에 저장된 시험 정답지 목록입니다.
                {!loading && !error && <span className="text-blue-600 ml-1">({exams.length}개)</span>}
              </p>
            </div>
            {/* 연도 필터 - Radix Select */}
            <Select
              value={selectedYear}
              onValueChange={(value) => {
                setSelectedYear(value);
                setExpandedExam(null);
              }}
              options={yearOptions}
              placeholder="연도 선택"
              aria-label="연도 필터"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchExams}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              새로고침
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              시험 추가
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">오류 발생</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchExams}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{exams.length}</div>
            <div className="text-sm text-neutral-500">등록된 시험</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{new Set(exams.map(e => e.subject)).size}</div>
            <div className="text-sm text-neutral-500">과목 수</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{exams.reduce((acc, e) => acc + (e.totalQuestions || 0), 0)}</div>
            <div className="text-sm text-neutral-500">총 문제 수</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{exams.reduce((acc, e) => acc + (e.studentCount || 0), 0)}</div>
            <div className="text-sm text-neutral-500">총 응시자</div>
          </div>
        </div>

        {/* Exams Table */}
        <ExamsTable
          exams={exams}
          loading={loading}
          expandedExam={expandedExam}
          activeTab={activeTab}
          onExpand={handleExpandExam}
          onTabChange={setActiveTab}
          onEdit={setEditingExam}
          onDelete={handleDelete}
        />

        {/* Add/Edit Modal */}
        {(isAddModalOpen || editingExam) && (
          <ExamModal
            exam={editingExam}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingExam(null);
            }}
            onSave={handleSaveExam}
          />
        )}
      </div>
      )}
    </SNarOCRLayout>
  );
}

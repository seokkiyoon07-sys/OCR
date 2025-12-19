'use client';

import { useState } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';

interface GradeCutoff {
  grade: number;
  minScore: number;
  standardScore: number;
}

interface ExamQuestion {
  questionNumber: number;
  correctAnswer: string;
  points: number;
}

interface Exam {
  id: string;
  name: string;
  examType: '모의고사' | '일반시험';
  subject: string;
  date: string;
  totalQuestions: number;
  questions: ExamQuestion[];
  gradeCutoffs: GradeCutoff[];
}

// Mock data
const mockExams: Exam[] = [
  {
    id: '1',
    name: '2025학년도 수능 국어',
    examType: '모의고사',
    subject: '국어',
    date: '2024-11-14',
    totalQuestions: 45,
    questions: Array.from({ length: 45 }, (_, i) => ({
      questionNumber: i + 1,
      correctAnswer: ['1', '2', '3', '4', '5'][Math.floor(Math.random() * 5)],
      points: i < 35 ? 2 : 3,
    })),
    gradeCutoffs: [
      { grade: 1, minScore: 92, standardScore: 131 },
      { grade: 2, minScore: 85, standardScore: 124 },
      { grade: 3, minScore: 77, standardScore: 116 },
      { grade: 4, minScore: 65, standardScore: 105 },
      { grade: 5, minScore: 52, standardScore: 93 },
      { grade: 6, minScore: 37, standardScore: 80 },
      { grade: 7, minScore: 25, standardScore: 68 },
      { grade: 8, minScore: 14, standardScore: 56 },
      { grade: 9, minScore: 0, standardScore: 44 },
    ],
  },
  {
    id: '2',
    name: '2025학년도 수능 수학',
    examType: '모의고사',
    subject: '수학',
    date: '2024-11-14',
    totalQuestions: 30,
    questions: Array.from({ length: 30 }, (_, i) => ({
      questionNumber: i + 1,
      correctAnswer: i >= 22 ? String(Math.floor(Math.random() * 900) + 100) : ['1', '2', '3', '4', '5'][Math.floor(Math.random() * 5)],
      points: i < 21 ? 2 : i < 28 ? 3 : 4,
    })),
    gradeCutoffs: [
      { grade: 1, minScore: 90, standardScore: 134 },
      { grade: 2, minScore: 80, standardScore: 127 },
      { grade: 3, minScore: 70, standardScore: 120 },
      { grade: 4, minScore: 55, standardScore: 108 },
      { grade: 5, minScore: 40, standardScore: 95 },
      { grade: 6, minScore: 28, standardScore: 82 },
      { grade: 7, minScore: 18, standardScore: 70 },
      { grade: 8, minScore: 10, standardScore: 58 },
      { grade: 9, minScore: 0, standardScore: 46 },
    ],
  },
  {
    id: '3',
    name: '2025학년도 수능 영어',
    examType: '모의고사',
    subject: '영어',
    date: '2024-11-14',
    totalQuestions: 45,
    questions: Array.from({ length: 45 }, (_, i) => ({
      questionNumber: i + 1,
      correctAnswer: ['1', '2', '3', '4', '5'][Math.floor(Math.random() * 5)],
      points: 2,
    })),
    gradeCutoffs: [
      { grade: 1, minScore: 90, standardScore: 100 },
      { grade: 2, minScore: 80, standardScore: 95 },
      { grade: 3, minScore: 70, standardScore: 90 },
      { grade: 4, minScore: 60, standardScore: 85 },
      { grade: 5, minScore: 50, standardScore: 80 },
      { grade: 6, minScore: 40, standardScore: 75 },
      { grade: 7, minScore: 30, standardScore: 70 },
      { grade: 8, minScore: 20, standardScore: 65 },
      { grade: 9, minScore: 0, standardScore: 60 },
    ],
  },
];

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>(mockExams);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'grades'>('questions');

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setExams(exams.filter(e => e.id !== id));
    }
  };

  const handleSaveExam = (exam: Exam) => {
    if (editingExam) {
      setExams(exams.map(e => e.id === exam.id ? exam : e));
    } else {
      setExams([...exams, { ...exam, id: Date.now().toString() }]);
    }
    setEditingExam(null);
    setIsAddModalOpen(false);
  };

  return (
    <SNarOCRLayout currentPage="admin-exams">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">시험 관리</h1>
            <p className="text-sm text-neutral-500 mt-1">시험 문제, 정답, 등급컷, 표준점수를 관리합니다.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            시험 추가
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{exams.length}</div>
            <div className="text-sm text-neutral-500">등록된 시험</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{new Set(exams.map(e => e.subject)).size}</div>
            <div className="text-sm text-neutral-500">과목 수</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{exams.reduce((acc, e) => acc + e.totalQuestions, 0)}</div>
            <div className="text-sm text-neutral-500">총 문제 수</div>
          </div>
        </div>

        {/* Exam List */}
        <div className="space-y-4">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              {/* Exam Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50"
                onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-700">
                      {exam.subject}
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                      exam.examType === '모의고사'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {exam.examType}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">{exam.name}</div>
                    <div className="text-sm text-neutral-500">{exam.date} · {exam.totalQuestions}문제</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingExam(exam);
                    }}
                    className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(exam.id);
                    }}
                    className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                  {expandedExam === exam.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedExam === exam.id && (
                <div className="border-t border-neutral-200">
                  {/* Tabs */}
                  <div className="flex border-b border-neutral-200">
                    <button
                      onClick={() => setActiveTab('questions')}
                      className={`px-4 py-3 text-sm font-medium ${
                        activeTab === 'questions'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      문제 및 정답
                    </button>
                    <button
                      onClick={() => setActiveTab('grades')}
                      className={`px-4 py-3 text-sm font-medium ${
                        activeTab === 'grades'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      등급컷 및 표준점수
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4">
                    {activeTab === 'questions' ? (
                      <div className="grid grid-cols-5 gap-2">
                        {exam.questions.map(q => (
                          <div key={q.questionNumber} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                            <span className="text-sm font-medium text-neutral-600 w-8">{q.questionNumber}번</span>
                            <span className="flex-1 text-center font-bold text-neutral-900">{q.correctAnswer}</span>
                            <span className="text-xs text-neutral-500">{q.points}점</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-neutral-50">
                              <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">등급</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">원점수 컷</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">표준점수</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {exam.gradeCutoffs.map(cutoff => (
                              <tr key={cutoff.grade}>
                                <td className="px-4 py-2 text-sm font-medium text-neutral-900">{cutoff.grade}등급</td>
                                <td className="px-4 py-2 text-sm text-neutral-600">{cutoff.minScore}점 이상</td>
                                <td className="px-4 py-2 text-sm text-neutral-600">{cutoff.standardScore}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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
    </SNarOCRLayout>
  );
}

interface ExamModalProps {
  exam: Exam | null;
  onClose: () => void;
  onSave: (exam: Exam) => void;
}

function ExamModal({ exam, onClose, onSave }: ExamModalProps) {
  const [step, setStep] = useState<'basic' | 'questions' | 'grades'>('basic');
  const [formData, setFormData] = useState<Omit<Exam, 'id'>>({
    name: exam?.name || '',
    examType: exam?.examType || '모의고사',
    subject: exam?.subject || '국어',
    date: exam?.date || new Date().toISOString().split('T')[0],
    totalQuestions: exam?.totalQuestions || 45,
    questions: exam?.questions || [],
    gradeCutoffs: exam?.gradeCutoffs || [
      { grade: 1, minScore: 90, standardScore: 130 },
      { grade: 2, minScore: 80, standardScore: 120 },
      { grade: 3, minScore: 70, standardScore: 110 },
      { grade: 4, minScore: 60, standardScore: 100 },
      { grade: 5, minScore: 50, standardScore: 90 },
      { grade: 6, minScore: 40, standardScore: 80 },
      { grade: 7, minScore: 30, standardScore: 70 },
      { grade: 8, minScore: 20, standardScore: 60 },
      { grade: 9, minScore: 0, standardScore: 50 },
    ],
  });

  const initializeQuestions = (count: number) => {
    const newQuestions: ExamQuestion[] = Array.from({ length: count }, (_, i) => ({
      questionNumber: i + 1,
      correctAnswer: '',
      points: 2,
    }));
    setFormData({ ...formData, totalQuestions: count, questions: newQuestions });
  };

  const handleSubmit = () => {
    onSave({
      id: exam?.id || '',
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-bold">{exam ? '시험 정보 수정' : '시험 추가'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Steps */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setStep('basic')}
            className={`flex-1 py-3 text-sm font-medium ${
              step === 'basic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-neutral-500'
            }`}
          >
            1. 기본 정보
          </button>
          <button
            onClick={() => setStep('questions')}
            className={`flex-1 py-3 text-sm font-medium ${
              step === 'questions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-neutral-500'
            }`}
          >
            2. 문제 및 정답
          </button>
          <button
            onClick={() => setStep('grades')}
            className={`flex-1 py-3 text-sm font-medium ${
              step === 'grades' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-neutral-500'
            }`}
          >
            3. 등급컷 및 표준점수
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'basic' && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">시험명</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 2025학년도 수능 국어"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">시험 유형</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="examType"
                      value="모의고사"
                      checked={formData.examType === '모의고사'}
                      onChange={(e) => setFormData({ ...formData, examType: e.target.value as '모의고사' | '일반시험' })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-neutral-700">모의고사</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="examType"
                      value="일반시험"
                      checked={formData.examType === '일반시험'}
                      onChange={(e) => setFormData({ ...formData, examType: e.target.value as '모의고사' | '일반시험' })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-neutral-700">일반시험</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">과목</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="국어">국어</option>
                  <option value="수학">수학</option>
                  <option value="영어">영어</option>
                  <option value="한국사">한국사</option>
                  <option value="탐구">탐구</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">시험일</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">문제 수</label>
                <input
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) => initializeQuestions(parseInt(e.target.value) || 0)}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {step === 'questions' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">각 문제의 정답과 배점을 입력하세요.</p>
              <div className="grid grid-cols-3 gap-3">
                {formData.questions.map((q, idx) => (
                  <div key={q.questionNumber} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm font-medium text-neutral-600 w-10">{q.questionNumber}번</span>
                    <input
                      type="text"
                      value={q.correctAnswer}
                      onChange={(e) => {
                        const newQuestions = [...formData.questions];
                        newQuestions[idx].correctAnswer = e.target.value;
                        setFormData({ ...formData, questions: newQuestions });
                      }}
                      placeholder="정답"
                      className="flex-1 px-2 py-1 text-center border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={q.points}
                      onChange={(e) => {
                        const newQuestions = [...formData.questions];
                        newQuestions[idx].points = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, questions: newQuestions });
                      }}
                      min="1"
                      max="10"
                      className="w-14 px-2 py-1 text-center border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-neutral-500">점</span>
                  </div>
                ))}
              </div>
              {formData.questions.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  먼저 기본 정보에서 문제 수를 설정해주세요.
                </div>
              )}
            </div>
          )}

          {step === 'grades' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">각 등급별 원점수 컷과 표준점수를 입력하세요.</p>
              <table className="w-full max-w-lg">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">등급</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">원점수 컷</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">표준점수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {formData.gradeCutoffs.map((cutoff, idx) => (
                    <tr key={cutoff.grade}>
                      <td className="px-4 py-2 text-sm font-medium text-neutral-900">{cutoff.grade}등급</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={cutoff.minScore}
                          onChange={(e) => {
                            const newCutoffs = [...formData.gradeCutoffs];
                            newCutoffs[idx].minScore = parseInt(e.target.value) || 0;
                            setFormData({ ...formData, gradeCutoffs: newCutoffs });
                          }}
                          min="0"
                          max="100"
                          className="w-20 px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={cutoff.standardScore}
                          onChange={(e) => {
                            const newCutoffs = [...formData.gradeCutoffs];
                            newCutoffs[idx].standardScore = parseInt(e.target.value) || 0;
                            setFormData({ ...formData, gradeCutoffs: newCutoffs });
                          }}
                          min="0"
                          max="200"
                          className="w-20 px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-4 border-t border-neutral-200">
          <button
            onClick={() => {
              if (step === 'questions') setStep('basic');
              else if (step === 'grades') setStep('questions');
            }}
            className={`px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 ${
              step === 'basic' ? 'invisible' : ''
            }`}
          >
            이전
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              취소
            </button>
            {step === 'grades' ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={16} />
                저장
              </button>
            ) : (
              <button
                onClick={() => {
                  if (step === 'basic') setStep('questions');
                  else if (step === 'questions') setStep('grades');
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                다음
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Edit2, Trash2, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { Exam, ExamQuestion } from './types';

// Subject code lookups from OMR-DB
const SUBJECT_CODE_LOOKUP: Record<string, string> = {
  '국어': '1000',
  '화법과 작문': '1001',
  '언어와 매체': '1002',
  '수학': '2000',
  '확률과 통계': '2001',
  '미적분': '2002',
  '기하': '2003',
  '영어': '3000',
  '한국사': '4000',
  '생활과 윤리': '4111',
  '윤리와 사상': '4112',
  '한국지리': '4113',
  '세계지리': '4114',
  '동아시아사': '4115',
  '세계사': '4116',
  '경제': '4117',
  '정치와 법': '4118',
  '사회·문화': '4119',
  '물리학I': '4220',
  '화학I': '4221',
  '생명과학I': '4222',
  '지구과학I': '4223',
  '물리학II': '4224',
  '화학II': '4225',
  '생명과학II': '4226',
  '지구과학II': '4227',
};

// Get subject category from code/name
const getSubjectCategory = (subjectCode?: string, subjectName?: string): 'korean' | 'math' | 'english' | 'history' | 'social' | 'science' | 'default' => {
  const code = subjectCode || SUBJECT_CODE_LOOKUP[subjectName || ''] || '';
  if (code.startsWith('1')) return 'korean';
  if (code.startsWith('2')) return 'math';
  if (code.startsWith('3')) return 'english';
  if (code === '4000') return 'history';
  if (code.startsWith('41')) return 'social';
  if (code.startsWith('42')) return 'science';
  return 'default';
};

// Get color scheme for subject category
const getSubjectColors = (category: ReturnType<typeof getSubjectCategory>) => {
  const colors = {
    korean: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100' },
    math: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
    english: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
    history: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' },
    social: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100' },
    science: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100' },
    default: { bg: 'bg-neutral-50', border: 'border-neutral-200', text: 'text-neutral-700', badge: 'bg-neutral-100' },
  };
  return colors[category];
};

interface ExamsTableProps {
  exams: Exam[];
  loading: boolean;
  expandedExam: string | null;
  activeTab: 'questions' | 'grades';
  onExpand: (id: string | null) => void;
  onTabChange: (tab: 'questions' | 'grades') => void;
  onEdit: (exam: Exam) => void;
  onDelete: (id: string) => void;
}

export function ExamsTable({ 
  exams, 
  loading, 
  expandedExam, 
  activeTab,
  onExpand, 
  onTabChange,
  onEdit, 
  onDelete 
}: ExamsTableProps) {
  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      onDelete(id);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" />
          <span className="text-neutral-600">시험 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="py-12 text-center text-neutral-500">
          <Database className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
          <p>등록된 시험이 없습니다.</p>
          <p className="text-sm text-neutral-400 mt-1">상단의 &quot;시험 추가&quot; 버튼을 클릭하여 시험을 등록하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exams.map(exam => (
        <div key={exam.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Exam Header */}
          <div
            className="p-4 cursor-pointer hover:bg-neutral-50"
            onClick={() => onExpand(expandedExam === exam.id ? null : exam.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-neutral-900">{exam.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      exam.examType === '모의고사' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {exam.examType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
                    <span>{exam.subject}</span>
                    {exam.providerName && <span>• {exam.providerName}</span>}
                    {exam.date && <span>• {exam.date}</span>}
                    {exam.totalQuestions !== null && exam.totalQuestions !== undefined && (
                      <span>• {exam.totalQuestions}문항</span>
                    )}
                    {exam.studentCount !== undefined && exam.studentCount > 0 && (
                      <span>• {exam.studentCount}명 응시</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(exam);
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
                  aria-label={`시험 삭제: ${exam.name}`}
                  data-testid={`delete-exam-${exam.id}`}
                >
                  <Trash2 size={18} />
                </button>
                {expandedExam === exam.id ? (
                  <ChevronUp size={20} className="text-neutral-400" />
                ) : (
                  <ChevronDown size={20} className="text-neutral-400" />
                )}
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedExam === exam.id && (
            <div className="border-t border-neutral-200">
              {/* Tabs */}
              <div className="flex border-b border-neutral-200">
                <button
                  onClick={() => onTabChange('questions')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === 'questions'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  문제 및 정답
                </button>
                <button
                  onClick={() => onTabChange('grades')}
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
                  <QuestionsTabContent 
                    questions={exam.questions} 
                    subjectCode={exam.subjectCode} 
                    subjectName={exam.subject}
                  />
                ) : (
                  exam.gradeCutoffs.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-6 text-neutral-500 text-sm">
                      등급컷 정보가 없습니다.
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Questions Tab Content Component with subject-specific styling
interface QuestionsTabContentProps {
  questions: ExamQuestion[];
  subjectCode?: string;
  subjectName?: string;
}

function QuestionsTabContent({ questions, subjectCode, subjectName }: QuestionsTabContentProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-6 text-neutral-500 text-sm">
        정답 데이터를 불러오려면 시험을 클릭하세요.
        <br />
        <span className="text-xs text-neutral-400">(상세 정답은 API를 통해 별도 조회됩니다)</span>
      </div>
    );
  }

  const category = getSubjectCategory(subjectCode, subjectName);
  const colors = getSubjectColors(category);
  
  // Sort questions by number
  const sortedQuestions = [...questions].sort((a, b) => a.questionNumber - b.questionNumber);
  
  // Calculate total points
  const totalPoints = sortedQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
  
  // Group questions by type (multiple choice vs short answer based on answer format)
  const isShortAnswer = (answer: string) => {
    // If answer is longer than 1 char or not a digit 1-5, it's likely short answer
    return answer.length > 1 || !/^[1-5]$/.test(answer);
  };
  
  // 선택과목 문항에서 선택과목명 추출
  const getElectiveSubjectName = (questions: ExamQuestion[]): string | null => {
    const electiveQuestion = questions.find(q => q.metadata?.electiveSubject);
    return electiveQuestion?.metadata?.electiveSubject || null;
  };
  
  // For Korean (45 questions): common 1-34, elective 35-45
  // For Math (30 questions): common multiple 1-15, common short 16-22, elective multiple 23-28, elective short 29-30
  // For others: just group by 5s
  
  const renderKoreanQuestions = () => {
    const commonQuestions = sortedQuestions.filter(q => q.questionNumber <= 34);
    const electiveQuestions = sortedQuestions.filter(q => q.questionNumber > 34);
    const electiveSubject = getElectiveSubjectName(electiveQuestions);
    
    return (
      <div className="space-y-6">
        {/* Common Questions (1-34) */}
        <div className={`rounded-xl p-4 ${colors.bg} border ${colors.border}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold text-sm ${colors.text}`}>공통문항 (1-34번)</h4>
            <span className="text-xs text-neutral-500">
              {commonQuestions.reduce((sum, q) => sum + (q.points || 0), 0)}점
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {commonQuestions.map(q => (
              <QuestionBadge key={q.questionNumber} question={q} colors={colors} />
            ))}
          </div>
        </div>
        
        {/* Elective Questions (35-45) */}
        {electiveQuestions.length > 0 && (
          <div className="rounded-xl p-4 bg-purple-50 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-purple-700">
                  선택문항 (35-45번)
                </h4>
                {electiveSubject && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 text-xs font-medium">
                    {electiveSubject}
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-500">
                {electiveQuestions.reduce((sum, q) => sum + (q.points || 0), 0)}점
              </span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-11 gap-2">
              {electiveQuestions.map(q => (
                <QuestionBadge 
                  key={q.questionNumber} 
                  question={q} 
                  colors={{ bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100' }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderMathQuestions = () => {
    const commonMultiple = sortedQuestions.filter(q => q.questionNumber <= 15);
    const commonShort = sortedQuestions.filter(q => q.questionNumber >= 16 && q.questionNumber <= 22);
    const electiveMultiple = sortedQuestions.filter(q => q.questionNumber >= 23 && q.questionNumber <= 28);
    const electiveShort = sortedQuestions.filter(q => q.questionNumber >= 29 && q.questionNumber <= 30);
    const electiveSubject = getElectiveSubjectName([...electiveMultiple, ...electiveShort]);
    
    return (
      <div className="space-y-6">
        {/* Common Multiple Choice (1-15) */}
        <div className={`rounded-xl p-4 ${colors.bg} border ${colors.border}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold text-sm ${colors.text}`}>공통 객관식 (1-15번)</h4>
            <span className="text-xs text-neutral-500">
              {commonMultiple.reduce((sum, q) => sum + (q.points || 0), 0)}점
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-15 gap-2">
            {commonMultiple.map(q => (
              <QuestionBadge key={q.questionNumber} question={q} colors={colors} />
            ))}
          </div>
        </div>
        
        {/* Common Short Answer (16-22) */}
        {commonShort.length > 0 && (
          <div className={`rounded-xl p-4 ${colors.bg} border ${colors.border}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-semibold text-sm ${colors.text}`}>공통 주관식 (16-22번)</h4>
              <span className="text-xs text-neutral-500">
                {commonShort.reduce((sum, q) => sum + (q.points || 0), 0)}점
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {commonShort.map(q => (
                <QuestionBadge key={q.questionNumber} question={q} colors={colors} isShortAnswer />
              ))}
            </div>
          </div>
        )}
        
        {/* Elective Multiple Choice (23-28) */}
        {electiveMultiple.length > 0 && (
          <div className="rounded-xl p-4 bg-purple-50 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-purple-700">선택 객관식 (23-28번)</h4>
                {electiveSubject && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 text-xs font-medium">
                    {electiveSubject}
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-500">
                {electiveMultiple.reduce((sum, q) => sum + (q.points || 0), 0)}점
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {electiveMultiple.map(q => (
                <QuestionBadge 
                  key={q.questionNumber} 
                  question={q} 
                  colors={{ bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100' }} 
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Elective Short Answer (29-30) */}
        {electiveShort.length > 0 && (
          <div className="rounded-xl p-4 bg-purple-50 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-purple-700">선택 주관식 (29-30번)</h4>
                {electiveSubject && !electiveMultiple.length && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 text-xs font-medium">
                    {electiveSubject}
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-500">
                {electiveShort.reduce((sum, q) => sum + (q.points || 0), 0)}점
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {electiveShort.map(q => (
                <QuestionBadge 
                  key={q.questionNumber} 
                  question={q} 
                  colors={{ bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100' }}
                  isShortAnswer 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderDefaultQuestions = () => {
    // Group questions into rows of 5
    const groups: ExamQuestion[][] = [];
    for (let i = 0; i < sortedQuestions.length; i += 10) {
      groups.push(sortedQuestions.slice(i, i + 10));
    }
    
    return (
      <div className={`rounded-xl p-4 ${colors.bg} border ${colors.border}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`font-semibold text-sm ${colors.text}`}>
            전체 문항 (1-{sortedQuestions.length}번)
          </h4>
          <span className="text-xs text-neutral-500">{totalPoints}점</span>
        </div>
        <div className="space-y-2">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {group.map(q => (
                <QuestionBadge 
                  key={q.questionNumber} 
                  question={q} 
                  colors={colors}
                  isShortAnswer={isShortAnswer(q.correctAnswer)} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Summary header
  const SummaryHeader = () => (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge} ${colors.text}`}>
          {subjectName || '과목 미지정'}
        </span>
        <span className="text-sm text-neutral-600">
          총 <span className="font-bold">{sortedQuestions.length}</span>문항
        </span>
      </div>
      <span className="text-sm text-neutral-600">
        총점: <span className="font-bold">{totalPoints}</span>점
      </span>
    </div>
  );
  
  return (
    <div>
      <SummaryHeader />
      {category === 'korean' && sortedQuestions.length >= 34 ? renderKoreanQuestions() :
       category === 'math' && sortedQuestions.length >= 22 ? renderMathQuestions() :
       renderDefaultQuestions()}
    </div>
  );
}

// Individual question badge component
interface QuestionBadgeProps {
  question: ExamQuestion;
  colors: ReturnType<typeof getSubjectColors>;
  isShortAnswer?: boolean;
}

function QuestionBadge({ question, colors, isShortAnswer }: QuestionBadgeProps) {
  return (
    <div className={`flex flex-col items-center p-2 rounded-lg bg-white border ${colors.border} shadow-sm`}>
      <span className="text-xs text-neutral-500 mb-1">{question.questionNumber}번</span>
      <span className={`font-bold ${isShortAnswer ? 'text-sm' : 'text-lg'} ${colors.text}`}>
        {question.correctAnswer}
      </span>
      <span className="text-[10px] text-neutral-400">{question.points}점</span>
    </div>
  );
}

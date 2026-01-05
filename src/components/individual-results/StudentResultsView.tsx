'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Loader2, ChevronDown, Printer, ArrowLeft } from 'lucide-react';
import { Student, StudentSummary, SubjectResult, ExamResult, QuestionResponse } from './types';
import { ScoreTrendChart } from './ScoreTrendChart';
import { RadarChart } from './RadarChart';

const BACKEND_URL = '/api';

interface StudentResultsViewProps {
  student: Student;
  onBack: () => void;
}

// Subject color mapping
const subjectColors: Record<string, string> = {
  '국어': '#3b82f6',
  '수학': '#60a5fa',
  '영어': '#93c5fd',
  '한국사': '#fbbf24',
  '탐구': '#34d399',
};

// Get subject category
function getSubjectCategory(subjectCode: string): string {
  if (subjectCode.startsWith('KOR')) return '국어';
  if (subjectCode.startsWith('MAT')) return '수학';
  if (subjectCode.startsWith('ENG')) return '영어';
  if (subjectCode.startsWith('HIS')) return '한국사';
  return '탐구';
}

export function StudentResultsView({ student, onBack }: StudentResultsViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  
  // Exam selection state
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<ExamResult | null>(null);
  const [isExamListExpanded, setIsExamListExpanded] = useState(false);
  
  // Subject selection state
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  // Responses for wrong answers
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Dropdown positioning
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [dropdownLeft, setDropdownLeft] = useState(0);

  const studentId = student.studentNumber || student.username;

  // Fetch student summary
  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/exams/student/${encodeURIComponent(studentId)}/summary`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(data.message || '학생 정보를 불러올 수 없습니다.');
      }
      
      setSummary(data);
      
      // Set initial selection
      if (data.months && data.months.length > 0) {
        setSelectedMonth(data.months[0].month);
        if (data.months[0].exams && data.months[0].exams.length > 0) {
          setSelectedExam(data.months[0].exams[0]);
          if (data.months[0].exams[0].subjects && data.months[0].exams[0].subjects.length > 0) {
            setSelectedSubject(data.months[0].exams[0].subjects[0].subjectCode);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch student summary:', err);
      setError(err instanceof Error ? err.message : '학생 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Fetch responses for selected exam/subject
  const fetchResponses = useCallback(async () => {
    if (!selectedExam || !selectedSubject) return;
    
    setLoadingResponses(true);
    try {
      const params = new URLSearchParams({
        exam_code: selectedExam.examCode || '',
        subject_code: selectedSubject,
      });
      const response = await fetch(`${BACKEND_URL}/exams/student/${encodeURIComponent(studentId)}/responses?${params}`);
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.status === 'ok') {
        setResponses(data.responses || []);
      }
    } catch (err) {
      console.error('Failed to fetch responses:', err);
    } finally {
      setLoadingResponses(false);
    }
  }, [studentId, selectedExam, selectedSubject]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  // Update dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (selectedMonth && buttonRefs.current[selectedMonth] && scrollContainerRef.current) {
      const button = buttonRefs.current[selectedMonth];
      const container = scrollContainerRef.current;
      if (button && container) {
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        setDropdownLeft(buttonRect.left - containerRect.left);
      }
    }
  }, [selectedMonth]);

  useEffect(() => {
    updateDropdownPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateDropdownPosition);
      window.addEventListener('resize', updateDropdownPosition);
    }
    return () => {
      if (container) container.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [selectedMonth, updateDropdownPosition]);

  const handleMonthChange = (month: string) => {
    if (selectedMonth === month) {
      setIsExamListExpanded(!isExamListExpanded);
      return;
    }
    setSelectedMonth(month);
    setIsExamListExpanded(true);
  };

  const handleExamSelect = (exam: ExamResult) => {
    setSelectedExam(exam);
    setIsExamListExpanded(false);
    if (exam.subjects && exam.subjects.length > 0) {
      setSelectedSubject(exam.subjects[0].subjectCode);
    }
  };

  // Prepare chart data for ScoreTrendChart
  const examChartData = useMemo(() => {
    if (!summary?.months) return [];
    
    const data: Array<{
      month: string;
      examName: string;
      examType: string;
      scores: Record<string, number>;
    }> = [];
    
    summary.months.forEach(monthData => {
      monthData.exams.forEach(exam => {
        const scores: Record<string, number> = {};
        exam.subjects.forEach(subject => {
          // Map subject codes to display names
          let displayName = subject.subjectName || subject.subjectCode;
          if (subject.subjectCode.startsWith('KOR')) displayName = '국어';
          else if (subject.subjectCode.startsWith('MAT')) displayName = '수학';
          else if (subject.subjectCode.startsWith('ENG')) displayName = '영어';
          else if (subject.subjectCode.startsWith('HIS')) displayName = '한국사';
          else displayName = '탐구1';
          
          scores[displayName] = subject.rawScore ?? 0;
        });
        
        data.push({
          month: monthData.month,
          examName: exam.providerName || exam.examCode || monthData.month,
          examType: exam.providerName?.includes('모의고사') ? '모의고사' : '일반시험',
          scores
        });
      });
    });
    
    return data;
  }, [summary]);

  // Prepare radar chart data
  const radarChartData = useMemo(() => {
    if (!selectedExam) return null;
    
    const myScores: Record<string, number> = {};
    selectedExam.subjects.forEach(subject => {
      let displayName = subject.subjectName || subject.subjectCode;
      if (subject.subjectCode.startsWith('KOR')) displayName = '국어';
      else if (subject.subjectCode.startsWith('MAT')) displayName = '수학';
      else if (subject.subjectCode.startsWith('ENG')) displayName = '영어';
      else if (subject.subjectCode.startsWith('HIS')) displayName = '한국사';
      else if (!myScores['탐구1']) displayName = '탐구1';
      else displayName = '탐구2';
      
      myScores[displayName] = subject.rawScore ?? 0;
    });
    
    return { myScores };
  }, [selectedExam]);

  // Get current subject data
  const currentSubjectData = selectedExam?.subjects.find(s => s.subjectCode === selectedSubject);
  
  // Get wrong answers
  const wrongAnswers = responses.filter(r => !r.isCorrect);

  // Print report
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">학생 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchSummary}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!summary || summary.totalExamCount === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 mb-4">
          <strong>{student.name}</strong> 학생의 채점 결과가 없습니다.
        </p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{student.name}</h2>
            <p className="text-sm text-neutral-500">
              {student.grade && `${student.grade}반`}
              {student.studyRoom && ` · ${student.studyRoom}`}
              {student.studentNumber && ` · ${student.studentNumber}`}
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
        >
          <Printer size={16} />
          인쇄
        </button>
      </div>

      {/* Month/Exam Selector */}
      {summary.months && summary.months.length > 0 && (
        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-medium text-gray-700">시험 선택</label>
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-hide snap-x relative"
          >
            {summary.months.map((monthData) => {
              const hasExams = monthData.exams.length > 0;
              const isActive = selectedMonth === monthData.month;
              return (
                <button
                  key={monthData.month}
                  ref={el => { buttonRefs.current[monthData.month] = el; }}
                  onClick={() => handleMonthChange(monthData.month)}
                  className={`
                    flex items-center justify-center px-4 py-2 min-w-[5rem] h-9 rounded-lg text-sm font-semibold transition-all whitespace-nowrap snap-center shrink-0
                    ${isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                      : hasExams
                        ? 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    }
                  `}
                  disabled={!hasExams}
                >
                  {monthData.month}
                </button>
              );
            })}
          </div>

          {/* Exam Dropdown */}
          {isExamListExpanded && selectedMonth && (
            <div
              className="absolute top-[4.5rem] z-20 transition-all duration-200 ease-out"
              style={{ left: `${Math.max(0, dropdownLeft)}px` }}
            >
              <div className="bg-white rounded-xl p-2 shadow-xl border border-gray-200 flex flex-col gap-1 w-72 animate-in slide-in-from-top-1 fade-in duration-200">
                <div className="text-[10px] text-gray-400 font-medium px-2 py-1 mb-1 border-b pb-1">
                  {selectedMonth} 시험 목록
                </div>
                {summary.months.find(m => m.month === selectedMonth)?.exams.map((exam, idx) => (
                  <button
                    key={`${exam.examCode}-${idx}`}
                    onClick={() => handleExamSelect(exam)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between items-center group
                      ${selectedExam?.examCode === exam.examCode
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                      }
                    `}
                  >
                    <div className="flex flex-col">
                      <span className="truncate max-w-[200px]">{exam.providerName || exam.examCode}</span>
                      <span className="text-[10px] text-gray-400">{exam.subjects.length}개 과목</span>
                    </div>
                    {selectedExam?.examCode === exam.examCode && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subject Tabs */}
      {selectedExam && selectedExam.subjects.length > 0 && (
        <div className="border-b border-neutral-200">
          <div className="flex gap-1 overflow-x-auto">
            {selectedExam.subjects.map(subject => (
              <button
                key={subject.subjectCode}
                onClick={() => setSelectedSubject(subject.subjectCode)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedSubject === subject.subjectCode
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {subject.subjectName || subject.subjectCode}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject Results */}
      {currentSubjectData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold mb-4">성적 요약</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">
                  {currentSubjectData.rawScore ?? '-'}
                </div>
                <div className="text-sm text-neutral-600 mt-1">원점수</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <div className="text-3xl font-bold text-neutral-900">
                  {currentSubjectData.grade ?? '-'}
                </div>
                <div className="text-sm text-neutral-600 mt-1">등급</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <div className="text-2xl font-bold text-neutral-700">
                  {currentSubjectData.standardScore ?? '-'}
                </div>
                <div className="text-sm text-neutral-600 mt-1">표준점수</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <div className="text-2xl font-bold text-neutral-700">
                  {currentSubjectData.percentile ?? '-'}
                </div>
                <div className="text-sm text-neutral-600 mt-1">백분위</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">정답 수</span>
                <span className="font-medium">
                  {currentSubjectData.correctCount ?? '-'} / {currentSubjectData.totalQuestions ?? '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Wrong Answers */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold mb-4">
              오답 문항 
              {wrongAnswers.length > 0 && (
                <span className="text-sm font-normal text-neutral-500 ml-2">
                  ({wrongAnswers.length}문항)
                </span>
              )}
            </h3>
            {loadingResponses ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            ) : wrongAnswers.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                오답이 없습니다! 🎉
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {wrongAnswers.map((r) => (
                  <div 
                    key={r.number}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-red-700">
                        {r.number}번
                      </span>
                      <span className="text-xs text-neutral-500">
                        {r.points}점
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-red-600">
                        선택: {r.markedChoice || r.markedText || '-'}
                      </span>
                      <span className="text-green-600">
                        정답: {r.correctChoice || r.correctText || '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Latest Scores by Subject */}
      {summary.subjectLatest && Object.keys(summary.subjectLatest).length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">과목별 최근 성적</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(summary.subjectLatest).map(([code, data]) => {
              const category = getSubjectCategory(code);
              const color = subjectColors[category] || '#6b7280';
              return (
                <div 
                  key={code}
                  className="p-4 rounded-xl border"
                  style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}
                >
                  <div className="text-sm font-medium" style={{ color }}>
                    {data.subjectName || code}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-neutral-900">
                    {data.rawScore ?? '-'}점
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {data.grade && `${data.grade}등급`}
                    {data.examMonth && ` · ${data.examMonth}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Score Trend Chart */}
      {examChartData.length > 0 && (
        <ScoreTrendChart 
          examData={examChartData}
          subjects={['국어', '수학', '영어', '탐구1', '한국사']}
        />
      )}

      {/* Radar Chart - Subject Distribution */}
      {radarChartData && Object.keys(radarChartData.myScores).length > 0 && (
        <RadarChart 
          myScores={radarChartData.myScores}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Printer, Lock, ChevronDown } from 'lucide-react';

const BACKEND_URL = '/api';

// ===== Types =====
interface Student {
  id: string;
  studentNumber: string;
  name: string;
  grade: string | null;
  hasExamResults: boolean;
  examCount: number;
}

interface SubjectScore {
  subjectCode: string;
  subjectName: string;
  rawScore: number | null;
  standardScore: number | null;
  grade: number | null;
  percentile: number | null;
  correctCount: number;
  totalQuestions: number;
  wrongQuestions?: number[];
}

interface ExamResult {
  examId?: number;
  examSubjectId?: number;
  providerName: string | null;
  examName?: string;
  examCode: string;
  examYear: number;
  examMonth: number;
  gradeLevel: string;
  subjects: SubjectScore[];
}

interface MonthExamGroup {
  month: string;
  year: number;
  monthNum: number;
  exams: ExamResult[];
}

interface StudentResponse {
  number: number;
  markedChoice: number | null;
  markedText: string | null;
  isCorrect: boolean;
  correctChoice: number | null;
  correctText: string | null;
  points: number;
  subjectCode?: string;
}

// ===== Utility Functions =====
const subjectColors: { [key: string]: string } = {
  'KOR': '#3b82f6',      // 블루 500
  '국어': '#3b82f6',
  'MATH': '#60a5fa',     // 블루 400
  '수학': '#60a5fa',
  'ENG': '#93c5fd',      // 블루 300
  '영어': '#93c5fd',
  'HIST': '#bfdbfe',     // 블루 200
  '한국사': '#bfdbfe',
  '탐구1': '#dbeafe',    // 블루 100
  '탐구2': '#f0f9ff',
};

// ===== Score Trend Chart Component =====
function ScoreTrendChart({ examData }: { examData: MonthExamGroup[] }) {
  const [viewMode, setViewMode] = useState<'multi-subject' | 'single-subject'>('multi-subject');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['국어', '수학', '영어']);
  const [singleSubject, setSingleSubject] = useState('국어');
  const [monthRange, setMonthRange] = useState(6);

  // Extract unique subjects from exam data
  const subjects = Array.from(new Set(
    examData.flatMap(m => m.exams.flatMap(e => e.subjects.map(s => s.subjectName || s.subjectCode)))
  )).slice(0, 5);

  // Flatten exam data for chart
  const flattenedData = examData.flatMap(m =>
    m.exams.map(exam => ({
      month: m.month,
      examName: exam.examName || `${exam.examYear}년 ${exam.examMonth}월`,
      label: `${m.month}`,
      subjects: exam.subjects.reduce((acc, s) => {
        acc[s.subjectName || s.subjectCode] = s.rawScore || 0;
        return acc;
      }, {} as { [key: string]: number })
    }))
  ).slice(-monthRange);

  const maxScores: { [key: string]: number } = {
    '국어': 100, '수학': 100, '영어': 100, '한국사': 50,
    'KOR': 100, 'MATH': 100, 'ENG': 100, 'HIST': 50
  };

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  if (flattenedData.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="text-lg font-semibold mb-2">성적 추이</h3>
        <p className="text-sm text-neutral-500">시험 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">성적 추이</h3>
            <p className="text-sm text-neutral-600 mt-1">월별 시험 성적 변화를 확인하세요</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('multi-subject')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'multi-subject'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              과목별 비교
            </button>
            <button
              onClick={() => setViewMode('single-subject')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'single-subject'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              단일 과목
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* 필터 옵션 */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {viewMode === 'multi-subject' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">과목 선택:</span>
                <div className="flex gap-1">
                  {subjects.map(subject => (
                    <button
                      key={subject}
                      onClick={() => toggleSubject(subject)}
                      className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                        selectedSubjects.includes(subject)
                          ? 'text-white'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                      style={{
                        backgroundColor: selectedSubjects.includes(subject)
                          ? subjectColors[subject] || '#3b82f6'
                          : undefined
                      }}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">기간:</span>
                <select
                  value={monthRange}
                  onChange={(e) => setMonthRange(Number(e.target.value))}
                  className="text-xs px-2 py-1.5 border border-neutral-300 rounded-lg"
                >
                  <option value={3}>최근 3개월</option>
                  <option value={6}>최근 6개월</option>
                  <option value={12}>전체</option>
                </select>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">과목:</span>
              <select
                value={singleSubject}
                onChange={(e) => setSingleSubject(e.target.value)}
                className="text-xs px-2 py-1.5 border border-neutral-300 rounded-lg"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 막대 그래프 */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex">
              {/* Y축 라벨 */}
              <div className="w-10 flex flex-col justify-between text-right pr-2" style={{ height: '200px' }}>
                {[100, 75, 50, 25, 0].map(value => (
                  <span key={value} className="text-xs text-neutral-400 leading-none">{value}</span>
                ))}
              </div>

              {/* 차트 영역 */}
              <div className="flex-1">
                <div className="relative border-l border-b border-neutral-200" style={{ height: '200px' }}>
                  {/* 가로 그리드 라인 */}
                  {[0.25, 0.5, 0.75, 1].map(ratio => (
                    <div
                      key={ratio}
                      className="absolute left-0 right-0 border-t border-neutral-100"
                      style={{ bottom: `${ratio * 100}%` }}
                    />
                  ))}

                  {/* 막대 그룹 */}
                  <div className="absolute inset-0 flex items-end justify-around px-2">
                    {flattenedData.map((data, examIdx) => {
                      const displaySubjects = viewMode === 'multi-subject' ? selectedSubjects : [singleSubject];
                      return (
                        <div key={examIdx} className="flex items-end justify-center gap-[2px] flex-1">
                          {displaySubjects.map(subject => {
                            const score = data.subjects[subject] || 0;
                            const maxScore = maxScores[subject] || 100;
                            const heightPercent = (score / maxScore) * 100;

                            return (
                              <div key={subject} className="relative group flex-1 max-w-4">
                                <div
                                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                                  style={{
                                    height: `${heightPercent}%`,
                                    backgroundColor: subjectColors[subject] || '#3b82f6',
                                    minHeight: '4px'
                                  }}
                                />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                  {subject}: {score}/{maxScore}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X축 라벨 */}
                <div className="flex justify-around pt-2">
                  {flattenedData.map((data, idx) => (
                    <div key={idx} className="text-center flex-1 px-1">
                      <div className="text-xs font-medium text-neutral-700">{data.month}</div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        {data.examName && data.examName.length > 5 ? data.examName.slice(0, 5) + '..' : data.examName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t">
          {(viewMode === 'multi-subject' ? selectedSubjects : [singleSubject]).map(subject => (
            <div key={subject} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: subjectColors[subject] || '#3b82f6' }}
              />
              <span className="text-neutral-600">{subject}</span>
              <span className="text-xs text-neutral-400">
                ({maxScores[subject] || 100}점)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Radar Chart Component =====
function RadarChart({ scores }: { scores: { [key: string]: { score: number; max: number } } }) {
  const [showAverage, setShowAverage] = useState(false);

  const subjectKeys = Object.keys(scores).slice(0, 6);
  const avgScores: { [key: string]: number } = {
    '국어': 72, '수학': 65, '영어': 75, '한국사': 40, '탐구1': 35, '탐구2': 33
  };

  if (subjectKeys.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="text-lg font-semibold mb-2">과목별 성적 분포</h3>
        <p className="text-sm text-neutral-500">성적 데이터가 없습니다.</p>
      </div>
    );
  }

  // Calculate polygon points
  const calculatePoint = (index: number, value: number, max: number, count: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const radius = 150 * (value / max);
    return {
      x: 200 + radius * Math.cos(angle),
      y: 200 + radius * Math.sin(angle)
    };
  };

  const myPoints = subjectKeys.map((key, i) => 
    calculatePoint(i, scores[key]?.score || 0, scores[key]?.max || 100, subjectKeys.length)
  );

  const avgPoints = subjectKeys.map((key, i) => 
    calculatePoint(i, avgScores[key] || 50, scores[key]?.max || 100, subjectKeys.length)
  );

  // Grid points (concentric polygons)
  const gridLevels = [1, 0.8, 0.6, 0.4, 0.2];

  return (
    <div className="rounded-2xl border bg-white">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">과목별 성적 분포</h3>
        <p className="text-sm text-neutral-600 mt-1">국어, 수학, 영어는 100점 만점 / 탐구, 한국사는 50점 만점</p>
      </div>
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 레이더 차트 */}
          <div className="flex-1 flex justify-center">
            <svg viewBox="0 0 400 400" className="w-full max-w-[400px]">
              {/* 배경 다각형 그리드 */}
              {gridLevels.map((scale, idx) => {
                const points = subjectKeys.map((_, i) => 
                  calculatePoint(i, scale * 100, 100, subjectKeys.length)
                );
                return (
                  <polygon
                    key={idx}
                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth="1"
                  />
                );
              })}

              {/* 축 선 */}
              {subjectKeys.map((_, i) => {
                const point = calculatePoint(i, 100, 100, subjectKeys.length);
                return (
                  <line
                    key={i}
                    x1="200"
                    y1="200"
                    x2={point.x}
                    y2={point.y}
                    stroke="#e5e5e5"
                    strokeWidth="1"
                  />
                );
              })}

              {/* 평균 영역 */}
              {showAverage && (
                <polygon
                  points={avgPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(234, 179, 8, 0.1)"
                  stroke="#eab308"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}

              {/* 현재 점수 영역 */}
              <polygon
                points={myPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              {myPoints.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="5" fill="#3b82f6" />
              ))}

              {/* 과목 라벨 */}
              {subjectKeys.map((key, i) => {
                const labelPoint = calculatePoint(i, 120, 100, subjectKeys.length);
                const score = scores[key]?.score || 0;
                const max = scores[key]?.max || 100;
                return (
                  <g key={i}>
                    <text
                      x={labelPoint.x}
                      y={labelPoint.y}
                      textAnchor="middle"
                      className="text-xs font-medium fill-neutral-700"
                    >
                      {key} ({max})
                    </text>
                    <text
                      x={labelPoint.x}
                      y={labelPoint.y + 14}
                      textAnchor="middle"
                      className="text-xs font-bold fill-blue-600"
                    >
                      {score}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 비교 옵션 및 범례 */}
          <div className="lg:w-64 space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-sm font-medium text-neutral-700 mb-3">비교 옵션</div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAverage}
                    onChange={(e) => setShowAverage(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    전체 평균
                  </span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-sm font-medium text-neutral-700 mb-3">범례</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-neutral-600">내 점수</span>
                </div>
                {showAverage && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-neutral-600">전체 평균</span>
                  </div>
                )}
              </div>
            </div>

            {/* 점수 요약 */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-700 mb-2">내 점수 요약</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {subjectKeys.map(key => (
                  <div key={key} className="flex justify-between">
                    <span className="text-neutral-600">{key}</span>
                    <span className="font-medium">{scores[key]?.score || 0}/{scores[key]?.max || 100}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Subject Detail Analysis Component =====
function SubjectDetailAnalysis({ 
  subjects, 
  wrongResponses 
}: { 
  subjects: SubjectScore[];
  wrongResponses: { [subjectCode: string]: StudentResponse[] };
}) {
  const [activeSubject, setActiveSubject] = useState(subjects[0]?.subjectCode || '');

  if (subjects.length === 0) {
    return null;
  }

  const currentSubject = subjects.find(s => s.subjectCode === activeSubject) || subjects[0];
  const currentWrongResponses = wrongResponses[currentSubject.subjectCode] || [];
  const wrongQuestions = currentWrongResponses.map(r => r.number);

  return (
    <div className="rounded-2xl border bg-white">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">과목별 상세 분석</h3>
        <p className="text-sm text-neutral-600 mt-1">각 과목의 상세한 채점 결과를 확인하세요</p>
      </div>
      <div className="p-6">
        {/* 과목 탭 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {subjects.map(subject => (
            <button
              key={subject.subjectCode}
              onClick={() => setActiveSubject(subject.subjectCode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSubject === subject.subjectCode
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {subject.subjectName || subject.subjectCode}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* 요약 정보 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
              <div className="text-3xl font-bold text-neutral-900">{currentSubject.rawScore || 0}</div>
              <div className="text-sm text-neutral-500">총점</div>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
              <div className="text-3xl font-bold text-red-600">{wrongQuestions.length}</div>
              <div className="text-sm text-neutral-500">오답</div>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
              <div className="text-3xl font-bold text-blue-600">{currentSubject.correctCount || 0}</div>
              <div className="text-sm text-neutral-500">정답</div>
            </div>
          </div>

          {/* 틀린 문항 목록 */}
          <div className="rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-500 mb-2">틀린 문항:</div>
            <div className="text-base font-medium text-red-600">
              {wrongQuestions.length > 0 ? wrongQuestions.join(', ') : '없음'}
            </div>
          </div>

          {/* 문항별 결과 그리드 */}
          {currentSubject.totalQuestions > 0 && (
            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="text-sm font-medium mb-3 text-neutral-700">문항별 결과</div>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: currentSubject.totalQuestions }, (_, i) => i + 1).map((num) => (
                  <div
                    key={num}
                    className={`p-2 text-center text-sm rounded-lg border ${
                      wrongQuestions.includes(num)
                        ? 'bg-red-50 border-red-200 text-red-600 font-semibold'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-500'
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-50 border border-red-200"></div>
                  <span>오답</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-neutral-50 border border-neutral-200"></div>
                  <span>정답</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Score Table Component =====
function ScoreTable({ exam, student }: { exam: ExamResult | null; student: Student }) {
  if (!exam) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center text-neutral-500">
        시험을 선택해주세요
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-2">
          {exam.examName || `${exam.examYear}년 ${exam.examMonth}월 시험`}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {exam.providerName && `${exam.providerName} · `}{exam.examYear}년 {exam.examMonth}월 시행
        </p>
        
        {/* 학생 정보 테이블 */}
        <div className="grid grid-cols-4 gap-4 border border-gray-300 mb-4">
          <div className="border-r border-gray-300 p-3 bg-gray-100">
            <div className="text-sm font-bold">수험번호</div>
            <div className="text-sm mt-1">{student.studentNumber || student.id}</div>
          </div>
          <div className="border-r border-gray-300 p-3 bg-gray-100">
            <div className="text-sm font-bold">성명</div>
            <div className="text-sm mt-1">{student.name}</div>
          </div>
          <div className="border-r border-gray-300 p-3 bg-gray-100">
            <div className="text-sm font-bold">학년</div>
            <div className="text-sm mt-1">{exam.gradeLevel || '고3'}</div>
          </div>
          <div className="p-3 bg-gray-100">
            <div className="text-sm font-bold">반</div>
            <div className="text-sm mt-1">{student.grade || '-'}</div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          {/* 과목별 점수 테이블 */}
          <table className="w-full border border-gray-300 text-sm table-fixed">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 p-2 text-center font-bold w-20">영역</th>
                {exam.subjects.map(subj => (
                  <th key={subj.subjectCode} className="border border-gray-300 p-2 text-center font-bold">
                    {subj.subjectName || subj.subjectCode}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-center">원점수</td>
                {exam.subjects.map(subj => (
                  <td key={subj.subjectCode} className="border border-gray-300 p-2 text-center">
                    {subj.rawScore !== null ? subj.rawScore : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-center">표준점수</td>
                {exam.subjects.map(subj => (
                  <td key={subj.subjectCode} className="border border-gray-300 p-2 text-center">
                    {subj.standardScore !== null ? subj.standardScore : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-center">백분위</td>
                {exam.subjects.map(subj => (
                  <td key={subj.subjectCode} className="border border-gray-300 p-2 text-center">
                    {subj.percentile !== null ? subj.percentile : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-center">등급</td>
                {exam.subjects.map(subj => (
                  <td key={subj.subjectCode} className="border border-gray-300 p-2 text-center">
                    {subj.grade !== null ? subj.grade : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-center">정답/문항</td>
                {exam.subjects.map(subj => (
                  <td key={subj.subjectCode} className="border border-gray-300 p-2 text-center">
                    {subj.correctCount}/{subj.totalQuestions}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 과목별 오답번호 섹션 */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4">과목별 오답번호</h3>
          <div className="space-y-3">
            {exam.subjects.map(subj => (
              <div key={subj.subjectCode} className="flex items-baseline gap-2">
                <span className="text-sm font-bold w-32">{subj.subjectName || subj.subjectCode}:</span>
                <span className="text-sm">
                  {subj.wrongQuestions && subj.wrongQuestions.length > 0 
                    ? subj.wrongQuestions.join(', ') 
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            본 프로그램은 SN독학기숙학원이 개발하였습니다.
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium text-sm flex items-center gap-1"
          >
            <Printer size={14} />
            PDF로 인쇄하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Main Page Component =====
export default function SNarOCRIndividualResults() {
  const { userId, isLoading: authLoading } = useAuth();
  
  // State
  const [mainTab, setMainTab] = useState<'모의고사' | '일반시험'>('모의고사');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('전체');
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  
  // Students
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Exams
  const [examData, setExamData] = useState<MonthExamGroup[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamResult | null>(null);
  const [activeExamMonth, setActiveExamMonth] = useState<string>('');
  const [isExamListExpanded, setIsExamListExpanded] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  
  // Wrong responses
  const [wrongResponses, setWrongResponses] = useState<{ [subjectCode: string]: StudentResponse[] }>({});
  const examScrollRef = useRef<HTMLDivElement>(null);

  // Fetch available years
  useEffect(() => {
    async function fetchYears() {
      try {
        const response = await fetch(`${BACKEND_URL}/exams/years`);
        if (response.ok) {
          const data = await response.json();
          const years = data.years || [];
          setAvailableYears(years);
          if (years.length > 0) {
            setSelectedYear(years[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch years:', err);
        // Set default year if fetch fails
        setAvailableYears([2026, 2025]);
      }
    }
    fetchYears();
  }, []);

  // Fetch students
  useEffect(() => {
    if (!selectedYear) return;
    
    async function fetchStudents() {
      setLoadingStudents(true);
      try {
        let url = `${BACKEND_URL}/exams/students/with-results?academic_year=${selectedYear}`;
        if (selectedGrade && selectedGrade !== '전체') {
          url += `&grade=${selectedGrade}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
          setAvailableGrades(['전체', ...(data.grades || [])]);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, [selectedYear, selectedGrade]);

  // Fetch student exam results when student is selected
  useEffect(() => {
    if (!selectedStudent) {
      setExamData([]);
      setSelectedExam(null);
      return;
    }
    
    async function fetchStudentResults() {
      if (!selectedStudent) return;
      setLoadingExams(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/exams/student/${selectedStudent.id}/summary`
        );
        if (response.ok) {
          const data = await response.json();
          
          // Transform data to match our interface
          const months: MonthExamGroup[] = (data.months || []).map((m: any) => ({
            month: m.month,
            year: m.year,
            monthNum: m.monthNum,
            exams: (m.exams || []).map((e: any) => ({
              examId: e.examId,
              examSubjectId: e.examSubjectId,
              providerName: e.providerName,
              examName: e.examName,
              examCode: e.examCode,
              examYear: e.examYear,
              examMonth: e.examMonth,
              gradeLevel: e.gradeLevel,
              subjects: (e.subjects || []).map((s: any) => ({
                subjectCode: s.subjectCode,
                subjectName: s.subjectName,
                rawScore: s.rawScore,
                standardScore: s.standardScore,
                grade: s.grade,
                percentile: s.percentile,
                correctCount: s.correctCount,
                totalQuestions: s.totalQuestions,
                wrongQuestions: []
              }))
            }))
          }));
          
          setExamData(months);
          
          // Select first exam if available
          if (months.length > 0 && months[0].exams.length > 0) {
            setActiveExamMonth(months[0].month);
            setSelectedExam(months[0].exams[0]);
            
            // Fetch wrong responses for selected exam
            await fetchWrongResponsesHelper(months[0].exams[0], selectedStudent.id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch student results:', err);
      } finally {
        setLoadingExams(false);
      }
    }
    fetchStudentResults();
  }, [selectedStudent]);

  // Fetch wrong responses for an exam
  const fetchWrongResponsesHelper = async (exam: ExamResult, studentId: string) => {
    if (!studentId || !exam) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/exams/student/${studentId}/responses?exam_code=${exam.examCode}`
      );
      if (response.ok) {
        const data = await response.json();
        const responses = data.responses || [];
        
        // Group by subject and filter wrong ones
        const wrongBySubject: { [key: string]: StudentResponse[] } = {};
        
        for (const resp of responses) {
          if (!resp.isCorrect) {
            const key = resp.subjectCode || 'UNKNOWN';
            if (!wrongBySubject[key]) {
              wrongBySubject[key] = [];
            }
            wrongBySubject[key].push(resp);
          }
        }
        
        setWrongResponses(wrongBySubject);
        
        // Update exam subjects with wrong questions
        const updatedExam = {
          ...exam,
          subjects: exam.subjects.map(s => ({
            ...s,
            wrongQuestions: (wrongBySubject[s.subjectCode] || []).map(r => r.number)
          }))
        };
        setSelectedExam(updatedExam);
      }
    } catch (err) {
      console.error('Failed to fetch wrong responses:', err);
    }
  };

  // Handle exam selection
  const handleExamSelect = async (exam: ExamResult) => {
    setSelectedExam(exam);
    setIsExamListExpanded(false);
    if (selectedStudent) {
      await fetchWrongResponsesHelper(exam, selectedStudent.id);
    }
  };

  // Handle month change
  const handleMonthChange = (month: string) => {
    if (activeExamMonth === month) {
      setIsExamListExpanded(!isExamListExpanded);
      return;
    }
    setActiveExamMonth(month);
    setIsExamListExpanded(true);
    
    const monthData = examData.find(m => m.month === month);
    if (monthData && monthData.exams.length > 0) {
      handleExamSelect(monthData.exams[0]);
    }
  };

  // Build score data for radar chart
  const radarScores: { [key: string]: { score: number; max: number } } = {};
  if (selectedExam) {
    for (const subj of selectedExam.subjects) {
      const name = subj.subjectName || subj.subjectCode;
      const isExplore = subj.subjectCode.startsWith('SCI_') || subj.subjectCode.startsWith('SOC_');
      radarScores[name] = {
        score: subj.rawScore || 0,
        max: isExplore || subj.subjectCode === 'HIST' ? 50 : 100
      };
    }
  }

  // Auth check
  if (authLoading) {
    return (
      <SNarOCRLayout currentPage="individual-results">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </SNarOCRLayout>
    );
  }

  if (!userId) {
    return (
      <SNarOCRLayout currentPage="individual-results">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500">
          <Lock size={48} className="mb-4 text-neutral-300" />
          <p className="text-lg font-medium">로그인이 필요합니다</p>
          <p className="text-sm mt-2">개별 채점 결과를 확인하려면 로그인해주세요.</p>
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
    <SNarOCRLayout currentPage="individual-results">
      <section className="space-y-6">
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-xl font-semibold">개인별 채점 결과</h2>

            {/* 모의고사 / 일반시험 탭 */}
            <div className="mt-4 flex gap-1 border-b border-neutral-200">
              <button
                onClick={() => setMainTab('모의고사')}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  mainTab === '모의고사'
                    ? 'bg-white border border-b-white border-neutral-200 -mb-px text-blue-600'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                모의고사
              </button>
              <button
                onClick={() => setMainTab('일반시험')}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  mainTab === '일반시험'
                    ? 'bg-white border border-b-white border-neutral-200 -mb-px text-blue-600'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                일반시험
              </button>
            </div>
          </div>

          {mainTab === '모의고사' ? (
            <>
              {/* 학년, 반, 학생 선택 */}
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {/* 학년도 선택 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">학년도</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(Number(e.target.value));
                      setSelectedStudent(null);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}학년도</option>
                    ))}
                  </select>
                </div>

                {/* 반 선택 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">반</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => {
                      setSelectedGrade(e.target.value);
                      setSelectedStudent(null);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableGrades.map(grade => (
                      <option key={grade} value={grade}>{grade === '전체' ? '전체 반' : `${grade}반`}</option>
                    ))}
                  </select>
                </div>

                {/* 학생 선택 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">학생</label>
                  <select
                    value={selectedStudent?.id || ''}
                    onChange={(e) => {
                      const student = students.find(s => s.id === e.target.value);
                      setSelectedStudent(student || null);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingStudents}
                  >
                    <option value="">학생을 선택하세요</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} {student.examCount > 0 ? `(${student.examCount}개 시험)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedStudent && (
                <>
                  {/* 시험지 선택 */}
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-gray-700">시험지 선택</label>
                    <div className="flex flex-col gap-2 relative">
                      <div
                        ref={examScrollRef}
                        className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-hide snap-x relative"
                      >
                        {examData.map((group) => {
                          const hasExams = group.exams.length > 0;
                          const isActive = activeExamMonth === group.month;
                          return (
                            <button
                              key={group.month}
                              onClick={() => handleMonthChange(group.month)}
                              className={`
                                flex items-center justify-center px-4 py-2 min-w-[4rem] h-9 rounded-lg text-sm font-semibold transition-all whitespace-nowrap snap-center shrink-0
                                ${isActive
                                  ? 'bg-blue-100 text-blue-600 border border-blue-200 shadow-sm'
                                  : hasExams
                                    ? 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'
                                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                }
                              `}
                              disabled={!hasExams}
                            >
                              {group.month}
                            </button>
                          );
                        })}
                      </div>

                      {isExamListExpanded && activeExamMonth && (
                        <div className="absolute top-[3rem] z-20 left-0">
                          <div className="bg-white rounded-xl p-2 shadow-xl border border-gray-200 flex flex-col gap-1 w-64">
                            <div className="text-[10px] text-gray-400 font-medium px-2 py-1 mb-1 border-b pb-1">
                              {activeExamMonth} 시험 목록
                            </div>
                            {examData.find(g => g.month === activeExamMonth)?.exams.map((exam, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleExamSelect(exam)}
                                className={`
                                  w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between items-center group
                                  ${selectedExam?.examCode === exam.examCode
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'hover:bg-gray-50 text-gray-700'
                                  }
                                `}
                              >
                                <div className="flex flex-col">
                                  <span className="truncate max-w-[200px]">
                                    {exam.examName || `${exam.providerName || ''} ${exam.examYear}년 ${exam.examMonth}월`}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {exam.subjects.length}개 과목
                                  </span>
                                </div>
                                {selectedExam?.examCode === exam.examCode && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {isExamListExpanded && (
                        <div className="fixed inset-0 z-10" onClick={() => setIsExamListExpanded(false)} />
                      )}
                    </div>
                    
                    {selectedExam && (
                      <div className="text-sm text-gray-600">
                        선택된 시험: <span className="font-medium text-green-600">
                          {selectedExam.examName || `${selectedExam.providerName || ''} ${selectedExam.examYear}년 ${selectedExam.examMonth}월`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 학생 성적표 */}
                  {loadingExams ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                      <span className="ml-3 text-neutral-600">성적 데이터를 불러오는 중...</span>
                    </div>
                  ) : (
                    <>
                      <ScoreTable exam={selectedExam} student={selectedStudent} />
                      
                      {/* 성적 추이 그래프 */}
                      <ScoreTrendChart examData={examData} />
                      
                      {/* 레이더 차트 */}
                      {Object.keys(radarScores).length > 0 && (
                        <RadarChart scores={radarScores} />
                      )}
                      
                      {/* 과목별 상세 분석 */}
                      {selectedExam && selectedExam.subjects.length > 0 && (
                        <SubjectDetailAnalysis 
                          subjects={selectedExam.subjects}
                          wrongResponses={wrongResponses}
                        />
                      )}
                    </>
                  )}
                </>
              )}

              {!selectedStudent && (
                <div className="mt-8 p-12 text-center bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="text-neutral-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700 mb-1">학생을 선택해주세요</h3>
                  <p className="text-sm text-neutral-500">위에서 학생을 선택하면 채점 결과를 확인할 수 있습니다.</p>
                </div>
              )}
            </>
          ) : (
            /* 일반시험 탭 - 동일한 구조로 구현 */
            <div className="mt-8 p-12 text-center bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="text-neutral-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-1">일반시험 기능 준비 중</h3>
              <p className="text-sm text-neutral-500">일반시험(단과 시험, 학원 자체 시험) 기능은 곧 추가될 예정입니다.</p>
            </div>
          )}
        </div>
      </section>
    </SNarOCRLayout>
  );
}

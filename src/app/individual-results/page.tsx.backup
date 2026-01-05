'use client';

import { useState, useRef, useEffect } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { Printer } from 'lucide-react';

// 성적 추이 차트 컴포넌트 (막대 그래프)
function ScoreTrendChart() {
  const [viewMode, setViewMode] = useState<'multi-subject' | 'single-subject'>('multi-subject');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['국어', '수학', '영어', '탐구1', '탐구2']);
  const [singleSubject, setSingleSubject] = useState('국어');
  const [monthRange, setMonthRange] = useState(6);
  const [examTypeFilter, setExamTypeFilter] = useState<'all' | '모의고사' | '일반시험'>('all');

  const subjects = ['국어', '수학', '영어', '탐구1', '탐구2'];
  // 밝은 블루 톤 색상 팔레트
  const subjectColors: { [key: string]: string } = {
    '국어': '#3b82f6',   // 블루 500
    '수학': '#60a5fa',   // 블루 400
    '영어': '#93c5fd',   // 블루 300
    '탐구1': '#bfdbfe',  // 블루 200
    '탐구2': '#dbeafe',  // 블루 100
  };

  // 월별 시험 데이터 (1월~11월, 월당 최대 3개 시험)
  const examData = [
    { month: '1월', exams: [] as { name: string; examType: '모의고사' | '일반시험'; scores: { 국어: number; 수학: number; 영어: number; 탐구1: number; 탐구2: number } }[] },
    { month: '2월', exams: [] as { name: string; examType: '모의고사' | '일반시험'; scores: { 국어: number; 수학: number; 영어: number; 탐구1: number; 탐구2: number } }[] },
    { month: '3월', exams: [
      { name: '3월 학력평가', examType: '모의고사' as const, scores: { 국어: 70, 수학: 75, 영어: 85, 탐구1: 38, 탐구2: 35 } }
    ]},
    { month: '4월', exams: [
      { name: '4월 학력평가', examType: '모의고사' as const, scores: { 국어: 73, 수학: 78, 영어: 86, 탐구1: 40, 탐구2: 37 } },
      { name: '4월 중간고사', examType: '일반시험' as const, scores: { 국어: 82, 수학: 88, 영어: 91, 탐구1: 44, 탐구2: 42 } }
    ]},
    { month: '5월', exams: [
      { name: '5월 단원평가', examType: '일반시험' as const, scores: { 국어: 80, 수학: 85, 영어: 88, 탐구1: 43, 탐구2: 41 } }
    ]},
    { month: '6월', exams: [
      { name: '6월 모의고사', examType: '모의고사' as const, scores: { 국어: 78, 수학: 82, 영어: 90, 탐구1: 42, 탐구2: 38 } },
      { name: '대성 모의고사', examType: '모의고사' as const, scores: { 국어: 75, 수학: 80, 영어: 88, 탐구1: 41, 탐구2: 36 } }
    ]},
    { month: '7월', exams: [
      { name: '7월 학력평가', examType: '모의고사' as const, scores: { 국어: 76, 수학: 83, 영어: 89, 탐구1: 43, 탐구2: 40 } },
      { name: '7월 기말고사', examType: '일반시험' as const, scores: { 국어: 88, 수학: 91, 영어: 93, 탐구1: 47, 탐구2: 45 } }
    ]},
    { month: '8월', exams: [
      { name: '8월 보충평가', examType: '일반시험' as const, scores: { 국어: 84, 수학: 87, 영어: 90, 탐구1: 45, 탐구2: 43 } }
    ]},
    { month: '9월', exams: [
      { name: '9월 모의고사', examType: '모의고사' as const, scores: { 국어: 81, 수학: 88, 영어: 96, 탐구1: 50, 탐구2: 50 } },
      { name: '대성 모의고사', examType: '모의고사' as const, scores: { 국어: 79, 수학: 85, 영어: 92, 탐구1: 46, 탐구2: 44 } }
    ]},
    { month: '10월', exams: [
      { name: '10월 모의고사', examType: '모의고사' as const, scores: { 국어: 83, 수학: 90, 영어: 94, 탐구1: 48, 탐구2: 46 } },
      { name: '10월 중간고사', examType: '일반시험' as const, scores: { 국어: 90, 수학: 93, 영어: 95, 탐구1: 49, 탐구2: 47 } }
    ]},
    { month: '11월', exams: [
      { name: '수능', examType: '모의고사' as const, scores: { 국어: 85, 수학: 92, 영어: 98, 탐구1: 50, 탐구2: 48 } }
    ]},
  ];

  // 시험 유형 필터 적용
  const filteredExamData = examData.map(m => ({
    ...m,
    exams: m.exams.filter(exam =>
      examTypeFilter === 'all' || exam.examType === examTypeFilter
    )
  }));

  // 시험이 있는 월만 필터링
  const monthsWithExams = filteredExamData.filter(m => m.exams.length > 0);

  // 표시할 월 범위 계산
  const displayMonths = viewMode === 'single-subject'
    ? monthsWithExams
    : monthsWithExams.slice(-monthRange);

  // 모든 시험 데이터를 평면화
  const flattenedData = displayMonths.flatMap(m =>
    m.exams.map(exam => ({
      month: m.month,
      examName: exam.name,
      examType: exam.examType,
      label: `${m.month} ${exam.name}`,
      ...exam.scores
    }))
  );

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const maxScores: { [key: string]: number } = {
    '국어': 100, '수학': 100, '영어': 100, '탐구1': 50, '탐구2': 50
  };

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
                  {subjects.map(subject => {
                    const isLight = subject === '탐구2';
                    return (
                      <button
                        key={subject}
                        onClick={() => toggleSubject(subject)}
                        className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                          selectedSubjects.includes(subject)
                            ? isLight ? 'text-neutral-700' : 'text-white'
                            : 'bg-neutral-100 text-neutral-400'
                        }`}
                        style={{
                          backgroundColor: selectedSubjects.includes(subject)
                            ? subjectColors[subject]
                            : undefined
                        }}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    if (selectedSubjects.length === subjects.length) {
                      setSelectedSubjects([subjects[0]]);
                    } else {
                      setSelectedSubjects([...subjects]);
                    }
                  }}
                  className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  {selectedSubjects.length === subjects.length ? '전체해제' : '전체선택'}
                </button>
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
                  <option value={12}>전체 (11개월)</option>
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
              <span className="text-xs text-neutral-500 ml-2">(전체 기간)</span>
            </div>
          )}
          {/* 시험 유형 필터 (공통) */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-neutral-600">시험 유형:</span>
            <div className="flex gap-1">
              {(['all', '모의고사', '일반시험'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setExamTypeFilter(type)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    examTypeFilter === type
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {type === 'all' ? '전체' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 막대 그래프 */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Y축 라벨 + 차트 영역 */}
            <div className="flex">
              {/* Y축 라벨 */}
              <div className="w-10 flex flex-col justify-between text-right pr-2" style={{ height: '200px' }}>
                {(viewMode === 'single-subject' && maxScores[singleSubject] === 50
                  ? [50, 40, 30, 20, 10, 0]
                  : [100, 75, 50, 25, 0]
                ).map(value => (
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
                        <div
                          key={examIdx}
                          className="flex items-end justify-center gap-[2px] flex-1"
                        >
                          {displaySubjects.map(subject => {
                            const score = data[subject as keyof typeof data] as number;
                            const maxScore = maxScores[subject];
                            const heightPercent = (score / maxScore) * 100;

                            return (
                              <div
                                key={subject}
                                className="relative group flex-1 max-w-4"
                              >
                                {/* 막대 */}
                                <div
                                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                                  style={{
                                    height: `${heightPercent}%`,
                                    backgroundColor: subjectColors[subject],
                                    minHeight: '4px'
                                  }}
                                />
                                {/* 툴팁 */}
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
                        {data.examName.length > 5 ? data.examName.slice(0, 5) + '..' : data.examName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 범례 */}
        {viewMode === 'multi-subject' && (
          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t">
            {selectedSubjects.map(subject => (
              <div key={subject} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: subjectColors[subject] }}
                />
                <span className="text-neutral-600">{subject}</span>
                <span className="text-xs text-neutral-400">
                  ({maxScores[subject]}점)
                </span>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'single-subject' && (
          <div className="flex justify-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: subjectColors[singleSubject] }}
              />
              <span className="text-neutral-600">{singleSubject}</span>
              <span className="text-xs text-neutral-400">
                ({maxScores[singleSubject]}점 만점)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SNarOCRIndividualResults() {
  // 메인 탭 상태 (모의고사 / 일반시험)
  const [mainTab, setMainTab] = useState<'모의고사' | '일반시험'>('모의고사');

  const [subjectFilter, setSubjectFilter] = useState('all');
  const [isMoreExamsModalOpen, setIsMoreExamsModalOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState('국어'); // 메인 과목 선택
  const [activeSubSubject, setActiveSubSubject] = useState(''); // 하위 과목 선택 (과탐, 사탐용)

  // 학원, 반, 학생 선택 상태
  const [selectedAcademy, setSelectedAcademy] = useState('SN독학기숙학원');
  const [selectedClass, setSelectedClass] = useState('1반');
  const [selectedStudent, setSelectedStudent] = useState('강동호');

  // 시험지 선택 상태
  const [activeExamMonth, setActiveExamMonth] = useState('9월');
  const [isExamListExpanded, setIsExamListExpanded] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  // 드롭다운 위치
  const examScrollRef = useRef<HTMLDivElement>(null);
  const examButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [examDropdownLeft, setExamDropdownLeft] = useState(0);

  // 레이더 차트 비교 옵션
  const [showTop10, setShowTop10] = useState(false);
  const [showAverage, setShowAverage] = useState(false);
  const [showPrevExam, setShowPrevExam] = useState(false);
  const [selectedPrevExam, setSelectedPrevExam] = useState('');

  // 일반시험 탭 상태
  const [generalExamSubject, setGeneralExamSubject] = useState('전체');
  const [selectedGeneralExam, setSelectedGeneralExam] = useState<string | null>(null);
  const [isWrongCollectionOpen, setIsWrongCollectionOpen] = useState(false);

  // 이전 시험 목록 (비교용)
  const previousExams = [
    { id: '6월', name: '6월 모의고사', scores: { 국어: 78, 수학: 82, 영어: 90, 탐구1: 42, 탐구2: 38, 한국사: 45 } },
    { id: '3월', name: '3월 학력평가', scores: { 국어: 70, 수학: 75, 영어: 85, 탐구1: 38, 탐구2: 35, 한국사: 42 } },
    { id: '작년11월', name: '2024 수능', scores: { 국어: 85, 수학: 90, 영어: 92, 탐구1: 45, 탐구2: 40, 한국사: 48 } },
    { id: '작년9월', name: '2024 9월 모의고사', scores: { 국어: 72, 수학: 78, 영어: 88, 탐구1: 40, 탐구2: 36, 한국사: 43 } },
  ];

  // 학원 데이터
  const academies = ['SN독학기숙학원', '메가스터디학원', '대성학원'];

  // 반 데이터 (학원별)
  const classesByAcademy: { [key: string]: string[] } = {
    'SN독학기숙학원': ['1반', '2반', '3반', '4반'],
    '메가스터디학원': ['A반', 'B반', 'C반'],
    '대성학원': ['수학반', '국어반', '영어반'],
  };

  // 학생 데이터 (반별)
  const studentsByClass: { [key: string]: string[] } = {
    '1반': ['강동호', '김민수', '이서연', '박지훈', '최유진'],
    '2반': ['정하늘', '오승우', '한소영', '임재현', '송미래'],
    '3반': ['윤지수', '강현우', '배수빈', '조은서', '황민준'],
    '4반': ['신예진', '문성호', '장서윤', '권도현', '류하은'],
    'A반': ['김태호', '이수민', '박준영'],
    'B반': ['최서현', '정유빈', '한지민'],
    'C반': ['오현우', '신다은', '임채원'],
    '수학반': ['송민규', '강서진', '윤태양'],
    '국어반': ['장하윤', '백승현', '고은채'],
    '영어반': ['남지우', '이도윤', '김하람'],
  };

  // 일반시험 데이터 (단과 시험, 학원 자체 시험 등) - 수학, 영어만
  // round: 회차 (같은 과목 내에서 시험 순서)
  const generalExams = [
    {
      id: 'ge1',
      name: '12월 주간 수학 테스트',
      subject: '수학',
      date: '2024-12-15',
      score: 92,
      totalScore: 100,
      rank: 2,
      totalStudents: 25,
      questions: 20,
      wrongCount: 2,
      round: 6,
    },
    {
      id: 'ge2',
      name: '12월 영어 듣기 평가',
      subject: '영어',
      date: '2024-12-12',
      score: 88,
      totalScore: 100,
      rank: 3,
      totalStudents: 25,
      questions: 30,
      wrongCount: 3,
      round: 6,
    },
    {
      id: 'ge3',
      name: '11월 영어 독해 테스트',
      subject: '영어',
      date: '2024-11-28',
      score: 78,
      totalScore: 100,
      rank: 5,
      totalStudents: 25,
      questions: 25,
      wrongCount: 5,
      round: 5,
    },
    {
      id: 'ge4',
      name: '11월 주간 수학 테스트',
      subject: '수학',
      date: '2024-11-20',
      score: 75,
      totalScore: 100,
      rank: 8,
      totalStudents: 25,
      questions: 20,
      wrongCount: 5,
      round: 5,
    },
    {
      id: 'ge5',
      name: '10월 수학 단원평가',
      subject: '수학',
      date: '2024-10-25',
      score: 68,
      totalScore: 100,
      rank: 12,
      totalStudents: 25,
      questions: 15,
      wrongCount: 5,
      round: 4,
    },
    {
      id: 'ge6',
      name: '10월 영어 어휘 테스트',
      subject: '영어',
      date: '2024-10-20',
      score: 82,
      totalScore: 100,
      rank: 6,
      totalStudents: 25,
      questions: 20,
      wrongCount: 4,
      round: 4,
    },
    {
      id: 'ge7',
      name: '9월 수학 테스트',
      subject: '수학',
      date: '2024-09-18',
      score: 58,
      totalScore: 100,
      rank: 15,
      totalStudents: 25,
      questions: 20,
      wrongCount: 8,
      round: 3,
    },
    {
      id: 'ge8',
      name: '9월 영어 듣기 평가',
      subject: '영어',
      date: '2024-09-15',
      score: 72,
      totalScore: 100,
      rank: 8,
      totalStudents: 25,
      questions: 25,
      wrongCount: 7,
      round: 3,
    },
    {
      id: 'ge9',
      name: '8월 수학 테스트',
      subject: '수학',
      date: '2024-08-20',
      score: 62,
      totalScore: 100,
      rank: 14,
      totalStudents: 25,
      questions: 20,
      wrongCount: 8,
      round: 2,
    },
    {
      id: 'ge10',
      name: '8월 영어 독해 테스트',
      subject: '영어',
      date: '2024-08-18',
      score: 65,
      totalScore: 100,
      rank: 10,
      totalStudents: 25,
      questions: 25,
      wrongCount: 9,
      round: 2,
    },
    {
      id: 'ge11',
      name: '7월 수학 테스트',
      subject: '수학',
      date: '2024-07-15',
      score: 55,
      totalScore: 100,
      rank: 18,
      totalStudents: 25,
      questions: 20,
      wrongCount: 9,
      round: 1,
    },
    {
      id: 'ge12',
      name: '7월 영어 어휘 테스트',
      subject: '영어',
      date: '2024-07-12',
      score: 60,
      totalScore: 100,
      rank: 12,
      totalStudents: 25,
      questions: 20,
      wrongCount: 8,
      round: 1,
    },
  ];

  // 일반시험 과목 목록
  const generalExamSubjects = ['전체', ...Array.from(new Set(generalExams.map(e => e.subject)))];

  // 필터링된 일반시험 목록
  const filteredGeneralExams = generalExamSubject === '전체'
    ? generalExams
    : generalExams.filter(e => e.subject === generalExamSubject);

  // 학원 변경 시 반, 학생 초기화
  const handleAcademyChange = (academy: string) => {
    setSelectedAcademy(academy);
    const classes = classesByAcademy[academy] || [];
    if (classes.length > 0) {
      setSelectedClass(classes[0]);
      const students = studentsByClass[classes[0]] || [];
      if (students.length > 0) {
        setSelectedStudent(students[0]);
      }
    }
  };

  // 반 변경 시 학생 초기화
  const handleClassChange = (className: string) => {
    setSelectedClass(className);
    const students = studentsByClass[className] || [];
    if (students.length > 0) {
      setSelectedStudent(students[0]);
    }
  };

  // 시험지 데이터 (월별)
  const examsByMonth = [
    { month: '1월', exams: [] },
    { month: '12월', exams: [] },
    { month: '11월', exams: [{ name: '2025학년도 수능', date: '2024년 11월 14일' }] },
    { month: '10월', exams: [{ name: '대성 모의고사', date: '2024년 10월 25일' }] },
    { month: '9월', exams: [{ name: '2025학년도 9월 모의고사', date: '2024년 9월 04일' }, { name: '대성 모의고사', date: '2024년 9월 20일' }] },
    { month: '8월', exams: [] },
    { month: '7월', exams: [{ name: '인천시 교육청 학력평가', date: '2024년 7월 10일' }] },
    { month: '6월', exams: [{ name: '2025학년도 6월 모의고사', date: '2024년 6월 04일' }] },
    { month: '5월', exams: [] },
    { month: '4월', exams: [{ name: '경기도 교육청 학력평가', date: '2024년 4월 10일' }] },
    { month: '3월', exams: [{ name: '서울시 교육청 학력평가', date: '2024년 3월 27일' }] },
  ];

  // 드롭다운 위치 업데이트
  const updateExamDropdownPosition = () => {
    if (activeExamMonth && examButtonRefs.current[activeExamMonth] && examScrollRef.current) {
      const button = examButtonRefs.current[activeExamMonth];
      const container = examScrollRef.current;
      const buttonRect = button!.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setExamDropdownLeft(buttonRect.left - containerRect.left);
    }
  };

  useEffect(() => {
    updateExamDropdownPosition();
  }, [activeExamMonth]);

  // 월 변경 핸들러
  const handleExamMonthChange = (month: string) => {
    if (activeExamMonth === month) {
      setIsExamListExpanded(!isExamListExpanded);
      return;
    }
    setActiveExamMonth(month);
    setIsExamListExpanded(true);
    const monthData = examsByMonth.find(m => m.month === month);
    if (monthData && monthData.exams.length > 0) {
      setSelectedExam(monthData.exams[0]);
    } else {
      setSelectedExam(null);
    }
  };

  // 메인 과목 탭 (성적표의 실제 과목 기준)
  const mainSubjects = [
    { id: '한국사', name: '한국사' },
    { id: '국어', name: '국어' },
    { id: '수학', name: '수학' },
    { id: '영어', name: '영어' },
    { id: '생활과윤리', name: '생활과윤리' },
    { id: '사회문화', name: '사회문화' }
  ];


  // 과목별 샘플 데이터 (성적표 기준)
  const subjectData = {
    한국사: {
      wrongQuestions: [3, 8, 14],
      totalScore: 90,
      wrongCount: 3,
      totalQuestions: 20,
      details: [
        { question: 3, type: '고대사', detail: '삼국 시대' },
        { question: 8, type: '중세사', detail: '조선 건국' },
        { question: 14, type: '근현대사', detail: '일제 강점기' }
      ]
    },
    국어: {
      wrongQuestions: [11, 12, 13, 15, 16, 17, 23, 26],
      totalScore: 81,
      wrongCount: 8,
      totalQuestions: 45,
      details: [
        { question: 11, type: '화법', detail: '담화 상황 파악' },
        { question: 12, type: '작문', detail: '글의 구조' },
        { question: 13, type: '독해', detail: '문맥 추론' },
        { question: 15, type: '문법', detail: '띄어쓰기 규칙' },
        { question: 16, type: '화법', detail: '대화 상황 이해' },
        { question: 17, type: '작문', detail: '수사적 표현' },
        { question: 23, type: '독해', detail: '추론 문제' },
        { question: 26, type: '어휘', detail: '동의어 파악' }
      ]
    },
    수학: {
      wrongQuestions: [21, 22, 29],
      totalScore: 88,
      wrongCount: 3,
      totalQuestions: 30,
      details: [
        { question: 21, type: '미적분', detail: '부정적분' },
        { question: 22, type: '미적분', detail: '정적분의 계산' },
        { question: 29, type: '미적분', detail: '적분의 응용' }
      ]
    },
    영어: {
      wrongQuestions: [30, 31],
      totalScore: 96,
      wrongCount: 2,
      totalQuestions: 45,
      details: [
        { question: 30, type: '독해', detail: '추론 문제' },
        { question: 31, type: '어휘', detail: '동의어 파악' }
      ]
    },
    생활과윤리: {
      wrongQuestions: [],
      totalScore: 50,
      wrongCount: 0,
      totalQuestions: 20,
      details: []
    },
    사회문화: {
      wrongQuestions: [],
      totalScore: 50,
      wrongCount: 0,
      totalQuestions: 20,
      details: []
    }
  };

  // PDF 인쇄 함수
  const printStudentReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `구현예정`;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // 인쇄 대화상자 열기
    printWindow.onload = () => {
      printWindow.print();
    };
  };
  // 현재 선택된 과목의 데이터 결정
  const getCurrentData = () => {
    return subjectData[activeSubject as keyof typeof subjectData];
  };

  const currentData = getCurrentData();

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

          {/* 탭 콘텐츠 */}
          {mainTab === '모의고사' ? (
          <>
            {/* 학원, 반, 학생 선택 */}
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {/* 학원 선택 */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">학원</label>
                <select
                  value={selectedAcademy}
                  onChange={(e) => handleAcademyChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {academies.map((academy) => (
                    <option key={academy} value={academy}>{academy}</option>
                  ))}
                </select>
              </div>

              {/* 반 선택 */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">반</label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {(classesByAcademy[selectedAcademy] || []).map((className) => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>

              {/* 학생 선택 */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">학생</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {(studentsByClass[selectedClass] || []).map((student) => (
                    <option key={student} value={student}>{student}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 시험지 선택 (버튼 UI) */}
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-gray-700">시험지 선택</label>
              <div className="flex flex-col gap-2 relative">
                <div
                  ref={examScrollRef}
                  className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-hide snap-x relative"
                >
                  {examsByMonth.map((group) => {
                    const hasExams = group.exams.length > 0;
                    const isActive = activeExamMonth === group.month;
                    return (
                      <button
                        key={group.month}
                        ref={el => examButtonRefs.current[group.month] = el}
                        onClick={() => handleExamMonthChange(group.month)}
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
                  <div
                    className="absolute top-[3rem] z-20 transition-all duration-200 ease-out"
                    style={{ left: `${Math.max(0, examDropdownLeft)}px` }}
                  >
                    <div className="bg-white rounded-xl p-2 shadow-xl border border-gray-200 flex flex-col gap-1 w-64 animate-in slide-in-from-top-1 fade-in duration-200">
                      <div className="text-[10px] text-gray-400 font-medium px-2 py-1 mb-1 border-b pb-1">
                        {activeExamMonth} 시험 목록
                      </div>
                      {examsByMonth.find(g => g.month === activeExamMonth)?.exams.map((exam, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsExamListExpanded(false);
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between items-center group
                            ${selectedExam?.name === exam.name
                              ? 'bg-blue-50 text-blue-600'
                              : 'hover:bg-gray-50 text-gray-700'
                            }
                          `}
                        >
                          <div className="flex flex-col">
                            <span className="truncate max-w-[200px]">{exam.name}</span>
                            <span className="text-[10px] text-gray-400">{exam.date}</span>
                          </div>
                          {selectedExam?.name === exam.name && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
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
                  선택된 시험: <span className="font-medium text-green-600">{selectedExam.name}</span>
                </div>
              )}
            </div>

          {/* 학생 성적표 */}
          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-2xl font-bold text-center mb-2">
                {selectedExam ? selectedExam.name : '시험을 선택해주세요'}
              </h2>
              {selectedExam && (
                <p className="text-sm text-gray-500 text-center mb-6">{selectedExam.date} 시행</p>
              )}
              {!selectedExam && <div className="mb-6" />}
              
              {/* 학생 정보 테이블 */}
              <div className="grid grid-cols-4 gap-4 border border-gray-300 mb-4">
                <div className="border-r border-gray-300 p-3 bg-gray-100">
                  <div className="text-sm font-bold">수험번호</div>
                  <div className="text-sm mt-1">STU_강동호</div>
                </div>
                <div className="border-r border-gray-300 p-3 bg-gray-100">
                  <div className="text-sm font-bold">성명</div>
                  <div className="text-sm mt-1">강동호</div>
                </div>
                <div className="border-r border-gray-300 p-3 bg-gray-100">
                  <div className="text-sm font-bold">성별</div>
                  <div className="text-sm mt-1">남</div>
                </div>
                <div className="p-3 bg-gray-100">
                  <div className="text-sm font-bold">반</div>
                  <div className="text-sm mt-1">1반</div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 border border-gray-300 mb-6">
                <div className="border-r border-gray-300 p-3 bg-gray-100">
                  <div className="text-sm font-bold">생년월일</div>
                  <div className="text-sm mt-1">2008-03-15</div>
                </div>
                <div className="border-r border-gray-300 p-3 bg-gray-100">
                  <div className="text-sm font-bold">시·도</div>
                  <div className="text-sm mt-1">서울</div>
                </div>
                <div className="border-r border-gray-300 p-3 bg-gray-100">
                  <div className="text-sm font-bold">학교명(학원명)</div>
                  <div className="text-sm mt-1">SN독학기숙학원</div>
                </div>
                <div className="p-3 bg-gray-100">
                  <div className="text-sm font-bold">번호</div>
                  <div className="text-sm mt-1">001</div>
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
                      <th className="border border-gray-300 p-2 text-center font-bold">한국사</th>
                      <th className="border border-gray-300 p-2 text-center font-bold">
                        국어
                        <br />
                        <span className="text-xs font-normal text-gray-600">화법과 작문</span>
                      </th>
                      <th className="border border-gray-300 p-2 text-center font-bold">
                        수학
                        <br />
                        <span className="text-xs font-normal text-gray-600">미분과 적분</span>
                      </th>
                      <th className="border border-gray-300 p-2 text-center font-bold">영어</th>
                      <th className="border border-gray-300 p-2 text-center font-bold">생활과윤리</th>
                      <th className="border border-gray-300 p-2 text-center font-bold">사회문화</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-center">원점수</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">81</td>
                      <td className="border border-gray-300 p-2 text-center">88</td>
                      <td className="border border-gray-300 p-2 text-center">96</td>
                      <td className="border border-gray-300 p-2 text-center">50</td>
                      <td className="border border-gray-300 p-2 text-center">50</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-center">표준점수</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">80</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-center">백분위</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">75</td>
                      <td className="border border-gray-300 p-2 text-center">95</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">95</td>
                      <td className="border border-gray-300 p-2 text-center">95</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-center">등급</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">3</td>
                      <td className="border border-gray-300 p-2 text-center">1</td>
                      <td className="border border-gray-300 p-2 text-center">1</td>
                      <td className="border border-gray-300 p-2 text-center">1</td>
                      <td className="border border-gray-300 p-2 text-center">1</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-center">응시자수</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                      <td className="border border-gray-300 p-2 text-center">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 과목별 오답번호 섹션 */}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">과목별 오답번호</h3>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold w-32">한국사:</span>
                    <span className="text-sm text-gray-500">—</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold w-32">국어(언어와 매체):</span>
                    <span className="text-sm">11, 12, 13, 15, 16, 17, 23, 26</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold w-32">수학(미적분):</span>
                    <span className="text-sm">21, 22, 29</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold w-32">영어:</span>
                    <span className="text-sm">30, 31</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold w-32">생활과윤리:</span>
                    <span className="text-sm">—</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold w-32">사회문화:</span>
                    <span className="text-sm">—</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold w-32">제2외국어·한문:</span>
                    <span className="text-sm text-gray-500">—</span>
                  </div>
                </div>
              </div>

              {/* 푸터 */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  본 프로그램은 SN독학기숙학원이 개발하였습니다.
                </div>
                <button
                  onClick={printStudentReport}
                  className="px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium text-sm flex items-center gap-1"
                >
                  <Printer size={14} />
                  PDF로 인쇄하기
                </button>
              </div>
            </div>
          </div>

          {/* 성적 추이 그래프 */}
          <ScoreTrendChart />

          {/* 육각형 레이더 차트 */}
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
                    {/* 배경 육각형 그리드 */}
                    {[1, 0.8, 0.6, 0.4, 0.2].map((scale, idx) => {
                      const points = [
                        { x: 200, y: 200 - 150 * scale }, // 국어 (top)
                        { x: 200 + 130 * scale, y: 200 - 75 * scale }, // 수학 (top-right)
                        { x: 200 + 130 * scale, y: 200 + 75 * scale }, // 영어 (bottom-right)
                        { x: 200, y: 200 + 150 * scale }, // 탐구1 (bottom)
                        { x: 200 - 130 * scale, y: 200 + 75 * scale }, // 탐구2 (bottom-left)
                        { x: 200 - 130 * scale, y: 200 - 75 * scale }, // 한국사 (top-left)
                      ];
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
                    {[
                      { x: 200, y: 50 },
                      { x: 330, y: 125 },
                      { x: 330, y: 275 },
                      { x: 200, y: 350 },
                      { x: 70, y: 275 },
                      { x: 70, y: 125 },
                    ].map((point, idx) => (
                      <line
                        key={idx}
                        x1="200"
                        y1="200"
                        x2={point.x}
                        y2={point.y}
                        stroke="#e5e5e5"
                        strokeWidth="1"
                      />
                    ))}

                    {/* 상위 10% 영역 */}
                    {showTop10 && (() => {
                      const top10Scores = { 국어: 95, 수학: 92, 영어: 98, 탐구1: 48, 탐구2: 47, 한국사: 49 };
                      const maxScores = { 국어: 100, 수학: 100, 영어: 100, 탐구1: 50, 탐구2: 50, 한국사: 50 };
                      const points = [
                        { x: 200, y: 200 - 150 * (top10Scores.국어 / maxScores.국어) },
                        { x: 200 + 130 * (top10Scores.수학 / maxScores.수학), y: 200 - 75 * (top10Scores.수학 / maxScores.수학) },
                        { x: 200 + 130 * (top10Scores.영어 / maxScores.영어), y: 200 + 75 * (top10Scores.영어 / maxScores.영어) },
                        { x: 200, y: 200 + 150 * (top10Scores.탐구1 / maxScores.탐구1) },
                        { x: 200 - 130 * (top10Scores.탐구2 / maxScores.탐구2), y: 200 + 75 * (top10Scores.탐구2 / maxScores.탐구2) },
                        { x: 200 - 130 * (top10Scores.한국사 / maxScores.한국사), y: 200 - 75 * (top10Scores.한국사 / maxScores.한국사) },
                      ];
                      return (
                        <polygon
                          points={points.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="rgba(34, 197, 94, 0.1)"
                          stroke="#22c55e"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      );
                    })()}

                    {/* 평균 영역 */}
                    {showAverage && (() => {
                      const avgScores = { 국어: 72, 수학: 65, 영어: 75, 탐구1: 35, 탐구2: 33, 한국사: 40 };
                      const maxScores = { 국어: 100, 수학: 100, 영어: 100, 탐구1: 50, 탐구2: 50, 한국사: 50 };
                      const points = [
                        { x: 200, y: 200 - 150 * (avgScores.국어 / maxScores.국어) },
                        { x: 200 + 130 * (avgScores.수학 / maxScores.수학), y: 200 - 75 * (avgScores.수학 / maxScores.수학) },
                        { x: 200 + 130 * (avgScores.영어 / maxScores.영어), y: 200 + 75 * (avgScores.영어 / maxScores.영어) },
                        { x: 200, y: 200 + 150 * (avgScores.탐구1 / maxScores.탐구1) },
                        { x: 200 - 130 * (avgScores.탐구2 / maxScores.탐구2), y: 200 + 75 * (avgScores.탐구2 / maxScores.탐구2) },
                        { x: 200 - 130 * (avgScores.한국사 / maxScores.한국사), y: 200 - 75 * (avgScores.한국사 / maxScores.한국사) },
                      ];
                      return (
                        <polygon
                          points={points.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="rgba(234, 179, 8, 0.1)"
                          stroke="#eab308"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      );
                    })()}

                    {/* 지난 시험 영역 */}
                    {showPrevExam && selectedPrevExam && (() => {
                      const selectedExamData = previousExams.find(e => e.id === selectedPrevExam);
                      if (!selectedExamData) return null;
                      const prevScores = selectedExamData.scores;
                      const maxScores = { 국어: 100, 수학: 100, 영어: 100, 탐구1: 50, 탐구2: 50, 한국사: 50 };
                      const points = [
                        { x: 200, y: 200 - 150 * (prevScores.국어 / maxScores.국어) },
                        { x: 200 + 130 * (prevScores.수학 / maxScores.수학), y: 200 - 75 * (prevScores.수학 / maxScores.수학) },
                        { x: 200 + 130 * (prevScores.영어 / maxScores.영어), y: 200 + 75 * (prevScores.영어 / maxScores.영어) },
                        { x: 200, y: 200 + 150 * (prevScores.탐구1 / maxScores.탐구1) },
                        { x: 200 - 130 * (prevScores.탐구2 / maxScores.탐구2), y: 200 + 75 * (prevScores.탐구2 / maxScores.탐구2) },
                        { x: 200 - 130 * (prevScores.한국사 / maxScores.한국사), y: 200 - 75 * (prevScores.한국사 / maxScores.한국사) },
                      ];
                      return (
                        <polygon
                          points={points.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="rgba(168, 85, 247, 0.1)"
                          stroke="#a855f7"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      );
                    })()}

                    {/* 현재 점수 영역 */}
                    {(() => {
                      const myScores = { 국어: 81, 수학: 88, 영어: 96, 탐구1: 50, 탐구2: 50, 한국사: 45 };
                      const maxScores = { 국어: 100, 수학: 100, 영어: 100, 탐구1: 50, 탐구2: 50, 한국사: 50 };
                      const points = [
                        { x: 200, y: 200 - 150 * (myScores.국어 / maxScores.국어) },
                        { x: 200 + 130 * (myScores.수학 / maxScores.수학), y: 200 - 75 * (myScores.수학 / maxScores.수학) },
                        { x: 200 + 130 * (myScores.영어 / maxScores.영어), y: 200 + 75 * (myScores.영어 / maxScores.영어) },
                        { x: 200, y: 200 + 150 * (myScores.탐구1 / maxScores.탐구1) },
                        { x: 200 - 130 * (myScores.탐구2 / maxScores.탐구2), y: 200 + 75 * (myScores.탐구2 / maxScores.탐구2) },
                        { x: 200 - 130 * (myScores.한국사 / maxScores.한국사), y: 200 - 75 * (myScores.한국사 / maxScores.한국사) },
                      ];
                      return (
                        <>
                          <polygon
                            points={points.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="rgba(59, 130, 246, 0.2)"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                          {points.map((p, idx) => (
                            <circle key={idx} cx={p.x} cy={p.y} r="5" fill="#3b82f6" />
                          ))}
                        </>
                      );
                    })()}

                    {/* 과목 라벨 */}
                    <text x="200" y="30" textAnchor="middle" className="text-sm font-medium fill-neutral-700">국어 (100)</text>
                    <text x="350" y="115" textAnchor="start" className="text-sm font-medium fill-neutral-700">수학 (100)</text>
                    <text x="350" y="295" textAnchor="start" className="text-sm font-medium fill-neutral-700">영어 (100)</text>
                    <text x="200" y="380" textAnchor="middle" className="text-sm font-medium fill-neutral-700">탐구1 (50)</text>
                    <text x="50" y="295" textAnchor="end" className="text-sm font-medium fill-neutral-700">탐구2 (50)</text>
                    <text x="50" y="115" textAnchor="end" className="text-sm font-medium fill-neutral-700">한국사 (50)</text>

                    {/* 점수 표시 */}
                    <text x="200" y="68" textAnchor="middle" className="text-xs font-bold fill-blue-600">81</text>
                    <text x="318" y="133" textAnchor="start" className="text-xs font-bold fill-blue-600">88</text>
                    <text x="318" y="277" textAnchor="start" className="text-xs font-bold fill-blue-600">96</text>
                    <text x="200" y="342" textAnchor="middle" className="text-xs font-bold fill-blue-600">50</text>
                    <text x="82" y="277" textAnchor="end" className="text-xs font-bold fill-blue-600">50</text>
                    <text x="82" y="133" textAnchor="end" className="text-xs font-bold fill-blue-600">45</text>
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
                          checked={showTop10}
                          onChange={(e) => setShowTop10(e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                          상위 10%
                        </span>
                      </label>
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
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showPrevExam}
                            onChange={(e) => {
                              setShowPrevExam(e.target.checked);
                              if (e.target.checked && !selectedPrevExam) {
                                setSelectedPrevExam(previousExams[0]?.id || '');
                              }
                            }}
                            className="w-4 h-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            지난 시험
                          </span>
                        </label>
                        {showPrevExam && (
                          <div className="pl-7">
                            <select
                              value={selectedPrevExam}
                              onChange={(e) => setSelectedPrevExam(e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              {previousExams.map((exam) => (
                                <option key={exam.id} value={exam.id}>{exam.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="text-sm font-medium text-neutral-700 mb-3">범례</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-neutral-600">내 점수</span>
                      </div>
                      {showTop10 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                          <span className="text-neutral-600">상위 10%</span>
                        </div>
                      )}
                      {showAverage && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                          <span className="text-neutral-600">전체 평균</span>
                        </div>
                      )}
                      {showPrevExam && selectedPrevExam && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                          <span className="text-neutral-600">
                            {previousExams.find(e => e.id === selectedPrevExam)?.name || '지난 시험'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 점수 요약 */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-700 mb-2">내 점수 요약</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">국어</span>
                        <span className="font-medium">81/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">수학</span>
                        <span className="font-medium">88/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">영어</span>
                        <span className="font-medium">96/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">탐구1</span>
                        <span className="font-medium">50/50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">탐구2</span>
                        <span className="font-medium">50/50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">한국사</span>
                        <span className="font-medium">45/50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">과목별 상세 분석</h3>
              <p className="text-sm text-neutral-600 mt-1">각 과목의 상세한 채점 결과를 확인하세요</p>
            </div>
            <div className="p-6">
              {/* 메인 과목 탭 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mainSubjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setActiveSubject(subject.id);
                      setActiveSubSubject('');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSubject === subject.id
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>

              {/* 하위 과목 탭 (과탐, 사탐일 때만 표시) */}
              {(activeSubject === '과학탐구' || activeSubject === '사회탐구') && (
                <div className="flex flex-wrap gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-2 w-full">개별 과목 선택:</div>
                  {subSubjects[activeSubject as keyof typeof subSubjects]?.map((subSubject) => (
                    <button
                      key={subSubject.id}
                      onClick={() => setActiveSubSubject(subSubject.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeSubSubject === subSubject.id
                          ? 'bg-gray-700 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {subSubject.name}
                    </button>
                  ))}
                </div>
              )}

              {/* 선택된 과목의 채점 결과 */}
              <div className="space-y-6">
                {/* 요약 정보 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                    <div className="text-3xl font-bold text-neutral-900">{currentData.totalScore}</div>
                    <div className="text-sm text-neutral-500">총점</div>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                    <div className="text-3xl font-bold text-neutral-900">{currentData.wrongCount}</div>
                    <div className="text-sm text-neutral-500">오답</div>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                    <div className="text-3xl font-bold text-neutral-900">{currentData.totalQuestions - currentData.wrongCount}</div>
                    <div className="text-sm text-neutral-500">정답</div>
                  </div>
                </div>

                {/* 틀린 문항 목록 */}
                <div className="rounded-lg border border-neutral-200 p-4">
                  <div className="text-sm text-neutral-500 mb-2">틀린 문항:</div>
                  <div className="text-base font-medium text-red-600">
                    {currentData.wrongQuestions.length > 0 ? currentData.wrongQuestions.join(', ') : '없음'}
                  </div>
                </div>

                {/* 문항별 결과 그리드 */}
                <div className="rounded-lg border border-neutral-200 p-4">
                  <div className="text-sm font-medium mb-3 text-neutral-700">문항별 결과</div>
                  <div className="grid grid-cols-10 gap-2">
                    {Array.from({ length: currentData.totalQuestions }, (_, i) => i + 1).map((num) => (
                      <div
                        key={num}
                        className={`p-2 text-center text-sm rounded-lg border ${
                          currentData.wrongQuestions.includes(num)
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

                {/* 상세 오답 정보 */}
                <div className="rounded-lg border border-neutral-200 p-4">
                  <div className="text-sm font-medium mb-3 text-neutral-700">오답 상세 정보</div>
                  <div className="space-y-2">
                    {currentData.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className="font-medium text-red-600 w-8">{detail.question}번</span>
                        <span className="text-neutral-500 w-20">{detail.type}</span>
                        <span className="text-neutral-600">{detail.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 채점한 시험지 목록 */}
          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">최근 채점한 시험지</h3>
              <p className="text-sm text-neutral-600 mt-1">이전에 채점한 시험지를 다시 확인하세요</p>
            </div>
            <div className="p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {/* 최근 시험지 목록 (3개만) */}
                {[
                  {
                    title: '2025학년도 9월 모의고사 - 국어',
                    date: '2025-09-15',
                    score: 90,
                    total: 100,
                    subject: '국어',
                    questions: 45
                  },
                  {
                    title: '2025학년도 9월 모의고사 - 수학',
                    date: '2025-09-15',
                    score: 75,
                    total: 100,
                    subject: '수학',
                    questions: 30
                  },
                  {
                    title: '2025학년도 6월 모의고사 - 영어',
                    date: '2025-06-15',
                    score: 88,
                    total: 100,
                    subject: '영어',
                    questions: 45
                  }
                ].map((exam, index) => (
                  <button
                    key={index}
                    className="p-4 rounded-xl border hover:bg-neutral-50 text-left transition-colors"
                    onClick={() => {
                      // 시험지 상세 보기 로직
                      console.log('시험지 선택:', exam.title);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-neutral-900 mb-1 line-clamp-2">
                          {exam.title}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {exam.date} • {exam.questions}문항
                        </div>
                      </div>
                      <div className="ml-2 text-right">
                        <div className={`text-lg font-bold ${
                          exam.score >= 90 ? 'text-blue-600' :
                          exam.score >= 80 ? 'text-blue-500' :
                          exam.score >= 70 ? 'text-blue-400' : 'text-blue-300'
                        }`}>
                          {exam.score}점
                        </div>
                        <div className="text-xs text-neutral-500">
                          {exam.score}/{exam.total}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700">
                        {exam.subject}
                      </span>
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${exam.score}%`,
                            backgroundColor: exam.score >= 90 ? '#3b82f6' :
                              exam.score >= 80 ? '#60a5fa' :
                              exam.score >= 70 ? '#93c5fd' : '#bfdbfe'
                          }}
                        ></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* 더 보기 버튼 */}
              <div className="mt-4 text-center">
                <button 
                  className="px-4 py-2 rounded-xl border hover:bg-neutral-50 text-sm font-medium"
                  onClick={() => setIsMoreExamsModalOpen(true)}
                >
                  더 많은 시험지 보기
                </button>
              </div>
            </div>
          </div>

          {/* 오답노트 */}
          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">오답노트</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-600">과목:</label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="px-3 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">전체</option>
                    <option value="수학">수학</option>
                    <option value="국어">국어</option>
                    <option value="영어">영어</option>
                    <option value="과학탐구">과학탐구</option>
                    <option value="사회탐구">사회탐구</option>
                    <option value="한국사">한국사</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* 시험별 오답노트 항목 */}
                {[
                  {
                    examTitle: '2025학년도 9월 모의고사 - 국어',
                    date: '2025-09-15',
                    subject: '국어',
                    wrongCount: 5,
                    totalQuestions: 45,
                    wrongQuestions: [3, 7, 12, 15, 18],
                    details: [
                      { question: 3, type: '문법', detail: '음운 변동 규칙' },
                      { question: 7, type: '독해', detail: '글의 구조 파악' },
                      { question: 12, type: '문학', detail: '시의 표현 기법' },
                      { question: 15, type: '문법', detail: '띄어쓰기 규칙' },
                      { question: 18, type: '독해', detail: '논증 구조 분석' }
                    ]
                  },
                  {
                    examTitle: '2025학년도 9월 모의고사 - 수학',
                    date: '2025-09-15',
                    subject: '수학',
                    wrongCount: 8,
                    totalQuestions: 30,
                    wrongQuestions: [2, 5, 9, 11, 14, 17, 22, 25],
                    details: [
                      { question: 2, type: '미적분', detail: '도함수의 활용' },
                      { question: 5, type: '확률과 통계', detail: '조건부 확률' },
                      { question: 9, type: '기하', detail: '벡터의 내적' },
                      { question: 11, type: '미적분', detail: '정적분의 활용' },
                      { question: 14, type: '수열', detail: '등차수열의 합' },
                      { question: 17, type: '함수', detail: '삼각함수의 성질' },
                      { question: 22, type: '미적분', detail: '부정적분' },
                      { question: 25, type: '기하', detail: '원의 방정식' }
                    ]
                  },
                  {
                    examTitle: '2025학년도 6월 모의고사 - 영어',
                    date: '2025-06-15',
                    subject: '영어',
                    wrongCount: 3,
                    totalQuestions: 45,
                    wrongQuestions: [8, 23, 35],
                    details: [
                      { question: 8, type: '문법', detail: '시제 일치' },
                      { question: 23, type: '독해', detail: '추론 문제' },
                      { question: 35, type: '어휘', detail: '동의어 파악' }
                    ]
                  }
                ].map((exam, idx) => (
                  <div key={idx} className="rounded-xl border p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            exam.subject === '수학' ? 'bg-blue-100 text-blue-800' :
                            exam.subject === '국어' ? 'bg-green-100 text-green-800' :
                            exam.subject === '영어' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {exam.subject}
                          </span>
                          <span className="font-semibold text-sm">{exam.examTitle}</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {exam.date} • {exam.wrongCount}개 오답 / {exam.totalQuestions}문항
                        </div>
                        <div className="text-sm text-gray-600">
                          틀린 문항: <span className="font-medium text-red-600">{exam.wrongQuestions.join(', ')}</span>
                        </div>
                      </div>
                      <button 
                        className="px-3 py-1 text-xs rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          // 상세 보기 로직 - 틀린 문제 상세 정보 표시
                          console.log('상세 보기:', exam.examTitle, exam.details);
                        }}
                      >
                        상세보기
                      </button>
                    </div>
                    
                    {/* 틀린 문제 미리보기 (상세보기 클릭 시 확장) */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">틀린 문제 미리보기:</div>
                      <div className="space-y-1">
                        {exam.details.slice(0, 3).map((detail, detailIdx) => (
                          <div key={detailIdx} className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-red-600">{detail.question}번</span>
                            <span className="text-gray-600">· {detail.type}</span>
                            <span className="text-gray-500">· {detail.detail}</span>
                          </div>
                        ))}
                        {exam.details.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{exam.details.length - 3}개 더...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </>
          ) : (
            /* 일반시험 탭 */
            <>
            {/* 학원, 반, 학생 선택 */}
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {/* 학원 선택 */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">학원</label>
                <select
                  value={selectedAcademy}
                  onChange={(e) => handleAcademyChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {academies.map((academy) => (
                    <option key={academy} value={academy}>{academy}</option>
                  ))}
                </select>
              </div>

              {/* 반 선택 */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">반</label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {(classesByAcademy[selectedAcademy] || []).map((className) => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>

              {/* 학생 선택 */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">학생</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {(studentsByClass[selectedClass] || []).map((student) => (
                    <option key={student} value={student}>{student}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 시험 선택 (과목 필터 + 목록) */}
            <div className="mt-6 rounded-2xl border bg-white">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">일반시험 선택</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">과목:</span>
                    <div className="flex gap-1">
                      {generalExamSubjects.map(subject => (
                        <button
                          key={subject}
                          onClick={() => setGeneralExamSubject(subject)}
                          className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                            generalExamSubject === subject
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {filteredGeneralExams.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {filteredGeneralExams.map(exam => (
                      <button
                        key={exam.id}
                        onClick={() => setSelectedGeneralExam(exam.id)}
                        className={`px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                          selectedGeneralExam === exam.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          selectedGeneralExam === exam.id
                            ? 'bg-blue-500 text-blue-100'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {exam.subject}
                        </span>
                        <span className="font-medium">{exam.name}</span>
                        <span className="text-xs opacity-75">{exam.score}점</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    선택한 과목의 일반시험이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 회차별 성적 추이 차트 */}
            {(() => {
              // 과목별로 필터링된 시험 데이터를 회차순으로 정렬
              const chartSubject = generalExamSubject === '전체' ? '수학' : generalExamSubject;
              const subjectExams = generalExams
                .filter(e => e.subject === chartSubject)
                .sort((a, b) => a.round - b.round);

              const subjectColors: { [key: string]: string } = {
                '수학': '#3b82f6',
                '영어': '#10b981',
              };

              return (
                <div className="mt-6 rounded-2xl border bg-white">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">회차별 성적 추이</h3>
                        <p className="text-sm text-neutral-600 mt-1">시험 회차에 따른 성적 변화를 확인하세요</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600">과목:</span>
                        <div className="flex gap-1">
                          {['수학', '영어'].map(subject => (
                            <button
                              key={subject}
                              onClick={() => setGeneralExamSubject(subject)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                (generalExamSubject === '전체' ? '수학' : generalExamSubject) === subject
                                  ? 'bg-neutral-900 text-white'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }`}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* 막대 그래프 */}
                    <div className="overflow-x-auto">
                      <div className="min-w-[400px]">
                        {/* Y축 라벨 + 차트 영역 */}
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
                              <div className="absolute inset-0 flex items-end justify-around px-4">
                                {subjectExams.map((exam, idx) => {
                                  const heightPercent = (exam.score / 100) * 100;
                                  const isSelected = selectedGeneralExam === exam.id;

                                  return (
                                    <div
                                      key={exam.id}
                                      className="flex flex-col items-center flex-1 max-w-16 cursor-pointer"
                                      onClick={() => setSelectedGeneralExam(exam.id)}
                                    >
                                      <div className="relative group w-full flex justify-center">
                                        {/* 막대 */}
                                        <div
                                          className={`w-10 rounded-t transition-all duration-300 ${isSelected ? 'ring-2 ring-offset-1 ring-blue-400' : 'hover:opacity-80'}`}
                                          style={{
                                            height: `${heightPercent * 2}px`,
                                            backgroundColor: subjectColors[chartSubject],
                                            opacity: isSelected ? 1 : 0.7,
                                          }}
                                        />
                                        {/* 점수 표시 */}
                                        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold ${isSelected ? 'text-blue-600' : 'text-neutral-500'}`}>
                                          {exam.score}
                                        </div>
                                        {/* 툴팁 */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                          {exam.name}: {exam.score}점
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* X축 라벨 - 회차 */}
                            <div className="flex justify-around pt-2">
                              {subjectExams.map((exam) => (
                                <div key={exam.id} className="text-center flex-1 px-1">
                                  <div className={`text-sm font-medium ${selectedGeneralExam === exam.id ? 'text-blue-600' : 'text-neutral-700'}`}>
                                    {exam.round}회차
                                  </div>
                                  <div className="text-[10px] text-neutral-400 truncate">
                                    {exam.date.slice(5, 7)}월
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 범례 및 추이 분석 */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: subjectColors[chartSubject] }}
                        />
                        <span className="text-sm text-neutral-600">{chartSubject}</span>
                        <span className="text-xs text-neutral-400">(100점 만점)</span>
                      </div>
                      {subjectExams.length >= 2 && (() => {
                        const firstScore = subjectExams[0].score;
                        const lastScore = subjectExams[subjectExams.length - 1].score;
                        const diff = lastScore - firstScore;
                        const isImproved = diff > 0;
                        return (
                          <div className={`flex items-center gap-1 text-sm ${isImproved ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : 'text-neutral-500'}`}>
                            {isImproved ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            ) : diff < 0 ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                              </svg>
                            ) : null}
                            <span>
                              {isImproved ? `+${diff}점 상승` : diff < 0 ? `${diff}점 하락` : '변화 없음'}
                            </span>
                            <span className="text-xs text-neutral-400">
                              (1회차 → {subjectExams.length}회차)
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 선택된 시험 상세 정보 */}
            {selectedGeneralExam && (() => {
              const exam = generalExams.find(e => e.id === selectedGeneralExam);
              if (!exam) return null;

              // Mock 오답 데이터
              const wrongQuestions = Array.from({ length: exam.wrongCount }, (_, i) => {
                const q = Math.floor(Math.random() * exam.questions) + 1;
                return q;
              }).filter((v, i, a) => a.indexOf(v) === i).slice(0, exam.wrongCount);

              const wrongDetails = wrongQuestions.map(q => ({
                question: q,
                type: ['개념 이해', '계산 실수', '문제 해석', '시간 부족'][Math.floor(Math.random() * 4)],
                detail: ['기본 개념 복습 필요', '계산 과정 재확인', '문제 조건 꼼꼼히 확인', '시간 배분 연습 필요'][Math.floor(Math.random() * 4)]
              }));

              return (
                <>
                  {/* 시험 요약 정보 */}
                  <div className="mt-6 rounded-2xl border bg-white p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{exam.name}</h3>
                        <p className="text-sm text-neutral-500">{exam.date} · {exam.subject} · {exam.questions}문제</p>
                      </div>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                        exam.score >= 90 ? 'bg-blue-500' :
                        exam.score >= 80 ? 'bg-emerald-500' :
                        exam.score >= 70 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}>
                        {exam.score >= 90 ? 'A' :
                         exam.score >= 80 ? 'B' :
                         exam.score >= 70 ? 'C' : 'D'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                        <div className="text-3xl font-bold text-neutral-900">{exam.score}<span className="text-lg text-neutral-400">/{exam.totalScore}</span></div>
                        <div className="text-sm text-neutral-500">점수</div>
                      </div>
                      <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                        <div className="text-3xl font-bold text-neutral-900">{exam.rank}<span className="text-lg text-neutral-400">/{exam.totalStudents}</span></div>
                        <div className="text-sm text-neutral-500">등수</div>
                      </div>
                      <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                        <div className="text-3xl font-bold text-red-600">{exam.wrongCount}</div>
                        <div className="text-sm text-neutral-500">오답</div>
                      </div>
                      <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                        <div className="text-3xl font-bold text-blue-600">{Math.round((exam.questions - exam.wrongCount) / exam.questions * 100)}%</div>
                        <div className="text-sm text-neutral-500">정답률</div>
                      </div>
                    </div>
                  </div>

                  {/* 과목별 상세 분석 */}
                  <div className="mt-6 rounded-2xl border bg-white">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">상세 분석</h3>
                      <p className="text-sm text-neutral-600 mt-1">{exam.name}의 상세한 채점 결과를 확인하세요</p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        {/* 틀린 문항 목록 */}
                        <div className="rounded-lg border border-neutral-200 p-4">
                          <div className="text-sm text-neutral-500 mb-2">틀린 문항:</div>
                          <div className="text-base font-medium text-red-600">
                            {wrongQuestions.length > 0 ? wrongQuestions.sort((a, b) => a - b).join(', ') : '없음'}
                          </div>
                        </div>

                        {/* 문항별 결과 그리드 */}
                        <div className="rounded-lg border border-neutral-200 p-4">
                          <div className="text-sm font-medium mb-3 text-neutral-700">문항별 결과</div>
                          <div className="grid grid-cols-10 gap-2">
                            {Array.from({ length: exam.questions }, (_, i) => i + 1).map((num) => (
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

                        {/* 상세 오답 정보 */}
                        {wrongDetails.length > 0 && (
                          <div className="rounded-lg border border-neutral-200 p-4">
                            <div className="text-sm font-medium mb-3 text-neutral-700">오답 상세 정보</div>
                            <div className="space-y-2">
                              {wrongDetails.map((detail, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                  <span className="font-medium text-red-600 w-8">{detail.question}번</span>
                                  <span className="text-neutral-500 w-20">{detail.type}</span>
                                  <span className="text-neutral-600">{detail.detail}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 지금까지 틀린 문제 모음 (토글) */}
                        {(() => {
                          // 같은 과목의 모든 시험에서 틀린 문제들을 모음
                          const allWrongProblems = generalExams
                            .filter(e => e.subject === exam.subject)
                            .sort((a, b) => a.round - b.round)
                            .map(e => {
                              // 각 시험별 mock 오답 데이터 생성 (일관성을 위해 id 기반 시드)
                              const seed = parseInt(e.id.replace('ge', '')) || 1;
                              const wrongNums = Array.from({ length: e.wrongCount }, (_, i) => {
                                return ((seed * 7 + i * 3) % e.questions) + 1;
                              }).filter((v, i, a) => a.indexOf(v) === i).slice(0, e.wrongCount).sort((a, b) => a - b);

                              return {
                                examId: e.id,
                                examName: e.name,
                                round: e.round,
                                date: e.date,
                                wrongQuestions: wrongNums,
                                score: e.score,
                              };
                            });

                          // 문제 번호별로 틀린 횟수 집계
                          const problemFrequency: { [key: number]: { count: number; exams: string[] } } = {};
                          allWrongProblems.forEach(examData => {
                            examData.wrongQuestions.forEach(q => {
                              if (!problemFrequency[q]) {
                                problemFrequency[q] = { count: 0, exams: [] };
                              }
                              problemFrequency[q].count++;
                              problemFrequency[q].exams.push(`${examData.round}회차`);
                            });
                          });

                          // 2번 이상 틀린 문제 (반복 오답)
                          const repeatedWrong = Object.entries(problemFrequency)
                            .filter(([_, data]) => data.count >= 2)
                            .sort((a, b) => b[1].count - a[1].count);

                          // 총 오답 문제 수
                          const totalUniqueWrong = Object.keys(problemFrequency).length;

                          return (
                            <div className="rounded-lg border border-amber-200 bg-amber-50/50 overflow-hidden">
                              {/* 토글 헤더 */}
                              <button
                                onClick={() => setIsWrongCollectionOpen(!isWrongCollectionOpen)}
                                className="w-full flex items-center justify-between p-4 hover:bg-amber-100/50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                  </div>
                                  <span className="text-sm font-semibold text-amber-900">지금까지 틀린 문제 모음</span>
                                  <span className="text-xs text-amber-600">({exam.subject} 전체 {allWrongProblems.length}회 시험)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                                    총 {totalUniqueWrong}개 문제
                                  </div>
                                  <svg
                                    className={`w-5 h-5 text-amber-600 transition-transform duration-200 ${isWrongCollectionOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </button>

                              {/* 토글 콘텐츠 */}
                              {isWrongCollectionOpen && (
                                <div className="px-4 pb-4 space-y-4 border-t border-amber-200">
                                  {/* 회차별 오답 현황 */}
                                  <div className="pt-4">
                                    <div className="text-xs font-medium text-amber-800 mb-2">회차별 오답 현황</div>
                                    <div className="bg-white rounded-lg border border-amber-100 overflow-hidden">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="bg-amber-50 border-b border-amber-100">
                                            <th className="text-left px-3 py-2 text-amber-800 font-medium">회차</th>
                                            <th className="text-left px-3 py-2 text-amber-800 font-medium">시험명</th>
                                            <th className="text-center px-3 py-2 text-amber-800 font-medium">점수</th>
                                            <th className="text-left px-3 py-2 text-amber-800 font-medium">틀린 문제</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {allWrongProblems.map((examData) => (
                                            <tr
                                              key={examData.examId}
                                              className={`border-b border-amber-50 ${examData.examId === exam.id ? 'bg-amber-100/50' : ''}`}
                                            >
                                              <td className="px-3 py-2 text-amber-900 font-medium">{examData.round}회차</td>
                                              <td className="px-3 py-2 text-amber-800">
                                                <div className="flex items-center gap-1">
                                                  {examData.examName}
                                                  {examData.examId === exam.id && (
                                                    <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded">현재</span>
                                                  )}
                                                </div>
                                                <div className="text-[10px] text-amber-500">{examData.date}</div>
                                              </td>
                                              <td className="px-3 py-2 text-center">
                                                <span className={`font-semibold ${
                                                  examData.score >= 90 ? 'text-blue-600' :
                                                  examData.score >= 80 ? 'text-emerald-600' :
                                                  examData.score >= 70 ? 'text-amber-600' :
                                                  'text-red-600'
                                                }`}>
                                                  {examData.score}점
                                                </span>
                                              </td>
                                              <td className="px-3 py-2">
                                                <div className="flex flex-wrap gap-1">
                                                  {examData.wrongQuestions.map(q => (
                                                    <span
                                                      key={q}
                                                      className={`px-1.5 py-0.5 text-xs rounded ${
                                                        problemFrequency[q]?.count >= 2
                                                          ? 'bg-red-100 text-red-700 font-medium'
                                                          : 'bg-neutral-100 text-neutral-600'
                                                      }`}
                                                    >
                                                      {q}
                                                    </span>
                                                  ))}
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  {/* 요약 통계 */}
                                  <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                                    <div className="text-xs text-amber-700">
                                      <span className="font-medium">평균 오답:</span> {(allWrongProblems.reduce((acc, e) => acc + e.wrongQuestions.length, 0) / allWrongProblems.length).toFixed(1)}개/회
                                    </div>
                                    {repeatedWrong.length > 0 && (
                                      <div className="text-xs text-red-600">
                                        <span className="font-medium">반복 오답:</span> {repeatedWrong.length}개 문제
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* AI 오답 분석 */}
                        {wrongDetails.length > 0 && (
                          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                              <span className="text-sm font-semibold text-blue-900">AI 오답 분석</span>
                            </div>

                            <div className="space-y-4">
                              {/* 취약점 분석 */}
                              <div>
                                <div className="text-xs font-medium text-blue-800 mb-1.5">취약 영역</div>
                                <p className="text-sm text-blue-900">
                                  {exam.subject === '수학'
                                    ? '미적분 영역에서 도함수 개념 적용이 미흡합니다. 특히 합성함수의 미분과 삼각함수의 미분에서 실수가 발생했습니다.'
                                    : exam.subject === '국어'
                                    ? '비문학 독해에서 글의 구조 파악이 부족합니다. 특히 논증 구조와 전제-결론 관계 분석에서 오류가 있습니다.'
                                    : exam.subject === '영어'
                                    ? '장문 독해에서 문맥 파악이 미흡합니다. 특히 빈칸 추론과 요지 파악 유형에서 주제문 식별이 필요합니다.'
                                    : '기본 개념 이해도를 높이고, 문제 유형별 접근 방법을 숙지할 필요가 있습니다.'
                                  }
                                </p>
                              </div>

                              {/* 오답 원인 */}
                              <div>
                                <div className="text-xs font-medium text-blue-800 mb-1.5">오답 원인</div>
                                <ul className="text-sm text-blue-900 space-y-1">
                                  <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>기본 공식 및 개념 적용 미숙 ({Math.round(wrongDetails.length * 0.4)}문항)</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>문제 조건 파악 실수 ({Math.round(wrongDetails.length * 0.3)}문항)</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>계산 실수 및 시간 부족 ({Math.round(wrongDetails.length * 0.3)}문항)</span>
                                  </li>
                                </ul>
                              </div>

                              {/* 학습 권장 사항 */}
                              <div>
                                <div className="text-xs font-medium text-blue-800 mb-1.5">학습 권장 사항</div>
                                <div className="bg-white rounded-lg p-3 border border-blue-100">
                                  <ol className="text-sm text-blue-900 space-y-2">
                                    <li className="flex items-start gap-2">
                                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">1</span>
                                      <span>오답 문항의 관련 개념을 교재에서 다시 복습하세요.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">2</span>
                                      <span>유사 유형 문제 10~15문항을 추가로 풀어보세요.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">3</span>
                                      <span>시간을 재고 문제를 푸는 연습을 통해 시간 관리 능력을 기르세요.</span>
                                    </li>
                                  </ol>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PDF 인쇄 & 학부모님 공유 버튼 */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => window.print()}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            PDF로 인쇄하기
                          </button>
                          <button
                            onClick={() => {
                              // 카카오톡 공유 API 호출 준비
                              const shareData = {
                                studentName: selectedStudent,
                                examName: exam.name,
                                score: exam.score,
                                rank: exam.rank,
                                totalStudents: exam.totalStudents,
                                wrongCount: exam.wrongCount,
                                subject: exam.subject,
                              };
                              console.log('카카오톡 공유 데이터:', shareData);
                              // TODO: 실제 카카오톡 API 연동
                              alert(`학부모님께 카카오톡으로 성적 결과를 공유합니다.\n\n학생: ${selectedStudent}\n시험: ${exam.name}\n점수: ${exam.score}점 (${exam.rank}등/${exam.totalStudents}명)`);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#FEE500] text-[#3C1E1E] rounded-xl font-medium hover:bg-[#FDD835] transition-colors"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.87 5.31 4.68 6.71l-.47 4.01c-.04.34.31.58.6.4l4.77-2.88c.14.01.28.01.42.01 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z"/>
                            </svg>
                            학부모님 공유
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* 시험이 선택되지 않았을 때 안내 */}
            {!selectedGeneralExam && filteredGeneralExams.length > 0 && (
              <div className="mt-6 p-12 text-center bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-neutral-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-700 mb-1">시험을 선택해주세요</h3>
                <p className="text-sm text-neutral-500">위에서 확인하고 싶은 시험을 선택하면 상세 결과를 볼 수 있습니다.</p>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      {/* 더 많은 시험지 보기 모달 */}
      {isMoreExamsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">모든 채점한 시험지</h3>
              <p className="text-sm text-neutral-600 mt-1">이전에 채점한 모든 시험지를 확인하세요</p>
            </div>

            <div className="p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {/* 모든 시험지 목록 */}
                {[
                  {
                    title: '2025학년도 9월 모의고사 - 국어',
                    date: '2025-09-15',
                    score: 90,
                    total: 100,
                    subject: '국어',
                    questions: 45
                  },
                  {
                    title: '2025학년도 9월 모의고사 - 수학',
                    date: '2025-09-15',
                    score: 75,
                    total: 100,
                    subject: '수학',
                    questions: 30
                  },
                  {
                    title: '2025학년도 6월 모의고사 - 영어',
                    date: '2025-06-15',
                    score: 88,
                    total: 100,
                    subject: '영어',
                    questions: 45
                  },
                  {
                    title: '2025학년도 3월 학력평가 - 국어',
                    date: '2025-03-15',
                    score: 82,
                    total: 100,
                    subject: '국어',
                    questions: 45
                  },
                  {
                    title: '2024학년도 11월 모의고사 - 수학',
                    date: '2024-11-15',
                    score: 78,
                    total: 100,
                    subject: '수학',
                    questions: 30
                  },
                  {
                    title: '2024학년도 9월 모의고사 - 영어',
                    date: '2024-09-15',
                    score: 85,
                    total: 100,
                    subject: '영어',
                    questions: 45
                  },
                  {
                    title: '2024학년도 6월 모의고사 - 국어',
                    date: '2024-06-15',
                    score: 87,
                    total: 100,
                    subject: '국어',
                    questions: 45
                  },
                  {
                    title: '2024학년도 3월 학력평가 - 수학',
                    date: '2024-03-15',
                    score: 72,
                    total: 100,
                    subject: '수학',
                    questions: 30
                  },
                  {
                    title: '2023학년도 11월 모의고사 - 영어',
                    date: '2023-11-15',
                    score: 83,
                    total: 100,
                    subject: '영어',
                    questions: 45
                  }
                ].map((exam, index) => (
                  <button
                    key={index}
                    className="p-4 rounded-xl border hover:bg-neutral-50 text-left transition-colors"
                    onClick={() => {
                      // 시험지 상세 보기 로직
                      console.log('시험지 선택:', exam.title);
                      setIsMoreExamsModalOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-neutral-900 mb-1 line-clamp-2">
                          {exam.title}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {exam.date} • {exam.questions}문항
                        </div>
                      </div>
                      <div className="ml-2 text-right">
                        <div className={`text-lg font-bold ${
                          exam.score >= 90 ? 'text-blue-600' :
                          exam.score >= 80 ? 'text-blue-500' :
                          exam.score >= 70 ? 'text-blue-400' : 'text-blue-300'
                        }`}>
                          {exam.score}점
                        </div>
                        <div className="text-xs text-neutral-500">
                          {exam.score}/{exam.total}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700">
                        {exam.subject}
                      </span>
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${exam.score}%`,
                            backgroundColor: exam.score >= 90 ? '#3b82f6' :
                              exam.score >= 80 ? '#60a5fa' :
                              exam.score >= 70 ? '#93c5fd' : '#bfdbfe'
                          }}
                        ></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsMoreExamsModalOpen(false)}
                className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </SNarOCRLayout>
  );
}

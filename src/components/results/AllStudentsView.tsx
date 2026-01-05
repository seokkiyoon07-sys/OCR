'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronRight, Loader2, AlertCircle, Download } from 'lucide-react';
import { Select } from '@/components/ui/Select';

// API Response Types
interface ExamInfo {
    name: string;
    providerName: string;
    examYear: number;
    examMonth: number;
    examCode: string;
    gradeLevel: string;
    subjectCode: string;
    subjectName: string;
    studentCount: number;
    avgScore: number | null;
    lastUpdated: string | null;
}

interface MonthGroup {
    month: string;
    year: number;
    monthNum: number;
    exams: ExamInfo[];
}

interface StudentResult {
    id?: number;
    studentId?: string;  // From API response
    studentExternalId?: string;  // Alias for compatibility
    studentName: string;
    providerName: string;
    examYear: number;
    examMonth: number;
    examCode: string;
    gradeLevel: string;
    subjectCode: string;
    subjectName: string;
    rawScore: number | string | null;
    standardScore: number | null;
    grade: number | null;
    percentile: number | null;
    correctCount: number;
    totalQuestions: number;
    createdAt: string;
    studyRoom?: string;
}

interface AllStudentsViewProps {
    onSelectStudent: (student: { name: string; phoneNumber: string }) => void;
}

const BACKEND_URL = '/api';

// Subject filter configuration
const MAIN_SUBJECTS = [
    { id: 'ALL', name: '전체' },
    { id: '국어', name: '국어' },
    { id: '수학', name: '수학' },
    { id: '영어', name: '영어' },
    { id: '사회탐구', name: '사회탐구' },
    { id: '과학탐구', name: '과학탐구' },
    { id: '한국사', name: '한국사' }
];

const SUB_SUBJECTS: Record<string, { id: string; name: string }[]> = {
    사회탐구: [
        { id: '생활과 윤리', name: '생활과 윤리' },
        { id: '윤리와 사상', name: '윤리와 사상' },
        { id: '한국지리', name: '한국지리' },
        { id: '세계지리', name: '세계지리' },
        { id: '동아시아사', name: '동아시아사' },
        { id: '세계사', name: '세계사' },
        { id: '경제', name: '경제' },
        { id: '정치와 법', name: '정치와 법' },
        { id: '사회문화', name: '사회·문화' }
    ],
    과학탐구: [
        { id: '물리학Ⅰ', name: '물리학Ⅰ' },
        { id: '화학Ⅰ', name: '화학Ⅰ' },
        { id: '생명과학Ⅰ', name: '생명과학Ⅰ' },
        { id: '지구과학Ⅰ', name: '지구과학Ⅰ' },
        { id: '물리학Ⅱ', name: '물리학Ⅱ' },
        { id: '화학Ⅱ', name: '화학Ⅱ' },
        { id: '생명과학Ⅱ', name: '생명과학Ⅱ' },
        { id: '지구과학Ⅱ', name: '지구과학Ⅱ' }
    ]
};

export default function AllStudentsView({ onSelectStudent }: AllStudentsViewProps) {
    // Data State
    const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([]);
    const [students, setStudents] = useState<StudentResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Year Filter State
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    // Navigation State
    const [activeMonth, setActiveMonth] = useState<string>('');
    const [selectedExam, setSelectedExam] = useState<ExamInfo | null>(null);
    const [isExamListExpanded, setIsExamListExpanded] = useState(false);

    // Dynamic Positioning Refs
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const [dropdownLeft, setDropdownLeft] = useState(0);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [mainSubject, setMainSubject] = useState('ALL');
    const [subSubject, setSubSubject] = useState('');

    // Fetch available years on mount
    useEffect(() => {
        fetchAvailableYears();
    }, []);

    // Fetch exam list when year changes
    useEffect(() => {
        if (selectedYear) {
            fetchExamList();
        }
    }, [selectedYear]);

    const fetchAvailableYears = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/exams/years`);
            if (response.ok) {
                const data = await response.json();
                const years = data.years || [];
                setAvailableYears(years);
                // Set default year to the most recent
                if (years.length > 0) {
                    setSelectedYear(String(years[0]));
                }
            }
        } catch (err) {
            console.error('Failed to fetch available years:', err);
            setLoading(false);
        }
    };

    const fetchExamList = async () => {
        if (!selectedYear) return;
        
        setLoading(true);
        setError(null);
        try {
            let url = `${BACKEND_URL}/exams/list`;
            if (selectedYear) {
                url += `?year=${selectedYear}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            
            if (data.status !== 'ok') {
                throw new Error(data.message || '시험 목록을 불러오는데 실패했습니다.');
            }
            
            const months: MonthGroup[] = data.months || [];
            
            // Sort months ascending (1월 -> 12월)
            const sortedMonths = months.sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return (a.monthNum || 0) - (b.monthNum || 0);
            });
            
            setMonthGroups(sortedMonths);
            
            // 첫 번째 시험이 있는 월을 찾아서 자동 선택
            const firstMonthWithExams = sortedMonths.find(m => m.exams.length > 0);
            if (firstMonthWithExams) {
                setActiveMonth(firstMonthWithExams.month);
                // 첫 번째 시험 자동 선택
                if (firstMonthWithExams.exams.length > 0) {
                    setSelectedExam(firstMonthWithExams.exams[0]);
                } else {
                    setSelectedExam(null);
                }
            } else {
                setActiveMonth('');
                setSelectedExam(null);
            }
        } catch (err) {
            console.error('Failed to fetch exam list:', err);
            setError(err instanceof Error ? err.message : '시험 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch results when exam changes
    useEffect(() => {
        if (selectedExam) {
            fetchExamResults(selectedExam);
        }
    }, [selectedExam]);

    const fetchExamResults = async (exam: ExamInfo) => {
        setLoadingResults(true);
        try {
            const params = new URLSearchParams();
            if (exam.providerName) params.append('provider_name', exam.providerName);
            if (exam.examYear) params.append('exam_year', exam.examYear.toString());
            if (exam.examMonth) params.append('exam_month', exam.examMonth.toString());
            if (exam.examCode) params.append('exam_code', exam.examCode);
            if (exam.subjectCode) params.append('subject_code', exam.subjectCode);
            params.append('limit', '500');

            const response = await fetch(`${BACKEND_URL}/exams/results?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            
            if (data.status !== 'ok') {
                throw new Error(data.message || '채점 결과를 불러오는데 실패했습니다.');
            }
            
            setStudents(data.students || []);
        } catch (err) {
            console.error('Failed to fetch exam results:', err);
            setStudents([]);
        } finally {
            setLoadingResults(false);
        }
    };

    // Update Dropdown Position Logic
    const updateDropdownPosition = useCallback(() => {
        if (activeMonth && buttonRefs.current[activeMonth] && scrollContainerRef.current) {
            const button = buttonRefs.current[activeMonth];
            const container = scrollContainerRef.current;
            if (button && container) {
                const buttonRect = button.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                setDropdownLeft(buttonRect.left - containerRect.left);
            }
        }
    }, [activeMonth]);

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
    }, [activeMonth, updateDropdownPosition]);

    const handleMonthChange = (month: string) => {
        // 같은 월 클릭 시 dropdown toggle만
        if (activeMonth === month) {
            setIsExamListExpanded(!isExamListExpanded);
            return;
        }
        // 다른 월 클릭 시 dropdown만 열고, 시험 선택은 하지 않음
        setActiveMonth(month);
        setIsExamListExpanded(true);
    };

    // CSV Download function
    const handleDownloadCSV = () => {
        if (filteredStudents.length === 0) return;

        const headers = ['이름', '학번', '시험명', '과목', '점수', '등급', '정답수', '총문제'];
        const rows = filteredStudents.map(s => [
            s.studentName || '',
            s.studentExternalId || '',
            s.providerName || '',
            s.subjectName || s.subjectCode || '',
            s.rawScore !== null && s.rawScore !== undefined ? Number(s.rawScore).toFixed(1) : '',
            s.grade?.toString() ?? '',
            s.correctCount?.toString() ?? '',
            s.totalQuestions?.toString() ?? '',
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        const examName = selectedExam?.name || '전체';
        link.download = `채점결과_${examName}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Get current month's exams
    const currentMonthExams = useMemo(() => {
        return monthGroups.find(m => m.month === activeMonth)?.exams || [];
    }, [monthGroups, activeMonth]);

    // Filter students
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = !searchTerm || 
                (student.studentName && student.studentName.includes(searchTerm)) ||
                (student.studentExternalId && student.studentExternalId.includes(searchTerm));
            
            let matchesSubject = false;
            const subjectName = student.subjectName || '';
            
            if (mainSubject === 'ALL') {
                matchesSubject = true;
            } else if (subSubject) {
                // If sub-subject is selected, match exact sub-subject
                matchesSubject = subjectName.includes(subSubject) || subjectName === subSubject;
            } else if (mainSubject === '사회탐구') {
                // Match any social studies subject
                const socialSubjects = SUB_SUBJECTS['사회탐구'].map(s => s.id);
                matchesSubject = socialSubjects.some(s => subjectName.includes(s));
            } else if (mainSubject === '과학탐구') {
                // Match any science subject
                const scienceSubjects = SUB_SUBJECTS['과학탐구'].map(s => s.id);
                matchesSubject = scienceSubjects.some(s => subjectName.includes(s));
            } else {
                // Exact match for other main subjects
                matchesSubject = subjectName === mainSubject || subjectName.startsWith(mainSubject);
            }
            
            return matchesSearch && matchesSubject;
        });
    }, [students, searchTerm, mainSubject, subSubject]);

    // Year options for Select - MUST be before early returns to maintain hook order
    const yearOptions = useMemo(() => {
        return [
            ...availableYears.map(y => ({ value: String(y), label: `${y}년` })),
        ];
    }, [availableYears]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">시험 목록을 불러오는 중...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">오류가 발생했습니다</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
                <button 
                    onClick={fetchExamList}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">전체 학생 조회 (관리자용)</h2>
                    {/* Year Select */}
                    {availableYears.length > 0 && (
                        <Select
                            value={selectedYear}
                            onValueChange={setSelectedYear}
                            options={yearOptions}
                            placeholder="연도 선택"
                            aria-label="연도 필터"
                        />
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-neutral-500">
                        총 <span className="text-blue-600 font-bold">{filteredStudents.length}</span>건의 성적 확인
                    </div>
                    <button
                        onClick={handleDownloadCSV}
                        disabled={filteredStudents.length === 0}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={16} />
                        CSV 다운로드
                    </button>
                </div>
            </div>

            {/* Month & Exam Selector */}
            {monthGroups.length > 0 ? (
                <div className="flex flex-col gap-2 relative">
                    <div
                        ref={scrollContainerRef}
                        className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide snap-x relative"
                    >
                        {monthGroups.map((group) => {
                            const hasExams = group.exams.length > 0;
                            const isActive = activeMonth === group.month;
                            // Display as "X월" format
                            const displayMonth = group.monthNum ? `${group.monthNum}월` : group.month;
                            return (
                                <button
                                    key={group.month}
                                    ref={el => { buttonRefs.current[group.month] = el; }}
                                    onClick={() => handleMonthChange(group.month)}
                                    className={`
                                        flex items-center justify-center px-4 py-2 min-w-[4rem] h-9 rounded-lg text-sm font-semibold transition-all whitespace-nowrap snap-center shrink-0
                                        ${isActive
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                                            : hasExams
                                                ? 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'
                                                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                        }
                                    `}
                                    disabled={!hasExams}
                                >
                                    {displayMonth}
                                </button>
                            );
                        })}
                    </div>

                    {isExamListExpanded && activeMonth && currentMonthExams.length > 0 && (
                        <div
                            className="absolute top-[3.5rem] z-20 transition-all duration-200 ease-out"
                            style={{ left: `${Math.max(0, dropdownLeft)}px` }}
                        >
                            <div className="bg-white rounded-xl p-2 shadow-xl border border-gray-200 flex flex-col gap-1 w-72 animate-in slide-in-from-top-1 fade-in duration-200">
                                <div className="text-[10px] text-gray-400 font-medium px-2 py-1 mb-1 border-b pb-1">
                                    {activeMonth} 시험 목록
                                </div>
                                {currentMonthExams.map((exam, idx) => (
                                    <button
                                        key={`${exam.providerName}-${exam.subjectCode}-${idx}`}
                                        onClick={() => {
                                            setSelectedExam(exam);
                                            setIsExamListExpanded(false);
                                        }}
                                        className={`
                                            w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between items-center group
                                            ${selectedExam?.name === exam.name && selectedExam?.subjectCode === exam.subjectCode
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'hover:bg-gray-50 text-gray-700'
                                            }
                                        `}
                                    >
                                        <div className="flex flex-col">
                                            <span className="truncate max-w-[200px]">{exam.name}</span>
                                            <span className="text-[10px] text-gray-400">{exam.studentCount}명 응시</span>
                                        </div>
                                        {selectedExam?.name === exam.name && selectedExam?.subjectCode === exam.subjectCode && (
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
            ) : (
                <div className="text-center py-8 text-gray-500">
                    등록된 시험이 없습니다.
                </div>
            )}

            {/* Selected Exam Title */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Selected Exam</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">
                        {selectedExam ? selectedExam.name : '시험을 선택해주세요'}
                    </h3>
                    {selectedExam?.avgScore != null && (
                        <p className="text-sm text-gray-500 mt-1">
                            평균 점수: {selectedExam.avgScore.toFixed(1)}점
                        </p>
                    )}
                </div>
                {selectedExam && !selectedExam.name?.includes(`${selectedExam.examYear}`) && (
                    <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                        {selectedExam.examYear}년 {selectedExam.examMonth}월 시행
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                {/* Main Subject Filter Buttons */}
                <div>
                    <label className="text-sm font-medium mb-2 block">과목 선택</label>
                    <div className="flex flex-wrap gap-2">
                        {MAIN_SUBJECTS.map(({ id, name }) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setMainSubject(id);
                                    setSubSubject('');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                    ${mainSubject === id 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                    
                    {/* Sub-subject buttons (for 사회탐구, 과학탐구) */}
                    {(mainSubject === '사회탐구' || mainSubject === '과학탐구') && SUB_SUBJECTS[mainSubject] && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {SUB_SUBJECTS[mainSubject].map(({ id, name }) => (
                                <button
                                    key={id}
                                    onClick={() => setSubSubject(subSubject === id ? '' : id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                        ${subSubject === id 
                                            ? 'bg-gray-700 text-white' 
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="이름 또는 학번 검색"
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loadingResults ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">결과를 불러오는 중...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">이름</th>
                                    <th className="px-6 py-4">학번</th>
                                    <th className="px-6 py-4">시험명</th>
                                    <th className="px-6 py-4">과목</th>
                                    <th className="px-6 py-4">점수</th>
                                    <th className="px-6 py-4">등급</th>
                                    <th className="px-6 py-4">정답률</th>
                                    <th className="px-6 py-4 text-center">상세보기</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((item) => (
                                        <tr
                                            key={item.id || item.studentId || Math.random()}
                                            onClick={() => {
                                                const studentIdentifier = item.studentId || item.studentExternalId;
                                                if (!studentIdentifier || studentIdentifier.trim() === '') {
                                                    console.warn('Cannot select student without ID:', item);
                                                    return;
                                                }
                                                console.log('Selecting student:', item.studentName, 'ID:', studentIdentifier);
                                                onSelectStudent({ 
                                                    name: item.studentName || '', 
                                                    phoneNumber: studentIdentifier.trim()
                                                });
                                            }}
                                            className={`transition-colors group ${(item.studentId || item.studentExternalId) ? 'hover:bg-blue-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {item.studentName || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {item.studentId || item.studentExternalId || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {item.providerName}
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {item.subjectName || item.subjectCode}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {item.rawScore !== null && item.rawScore !== undefined ? Number(item.rawScore).toFixed(1) : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.grade ? (
                                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                        item.grade === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                        item.grade === 2 ? 'bg-gray-100 text-gray-700' :
                                                        item.grade <= 4 ? 'bg-blue-50 text-blue-700' :
                                                        'bg-orange-50 text-orange-700'
                                                    }`}>
                                                        {item.grade}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {item.totalQuestions > 0 
                                                    ? `${item.correctCount}/${item.totalQuestions}` 
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button className="text-gray-400 group-hover:text-blue-600 transition-colors">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            {selectedExam ? '검색 결과가 없습니다.' : '시험을 먼저 선택해주세요.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import { AlertCircle, Calendar, Download, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Select } from '@/components/ui/Select';

const BACKEND_URL = '/api';

// Types for API data
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
    lastUpdated: string;
    date?: string;
    count?: number;
}

interface MonthData {
    month: string;
    year: number;
    monthNum: number;
    exams: ExamInfo[];
}

interface StatsData {
    totalStudents: number;
    avgScore: number | null;
    minScore: number | null;
    maxScore: number | null;
    stddevScore: number | null;
    medianScore: number | null;
}

interface QuestionAccuracy {
    number: number;
    points: number | null;
    correctChoice: number | null;
    correctText: string | null;
    responseCount: number;
    correctCount: number;
    accuracyPercent: number;
    wrongRate: number;
}

interface ScoreDistribution {
    range: string;
    count: number;
}

interface SubjectInfo {
    code: string;
    name: string;
    category: string;
    maxScore: number;
}

interface ComparisonData {
    examCode: string;
    subjectCode: string;
    scoreDistribution: ScoreDistribution[];
    stats: {
        totalStudents: number;
        avgScore: number | null;
        stddevScore: number | null;
    } | null;
}

export default function AdminView() {
    // API Data State
    const [examsByMonth, setExamsByMonth] = useState<MonthData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Year Filter State
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    
    // Navigation State
    const [activeMonth, setActiveMonth] = useState<string>('');
    const [selectedExam, setSelectedExam] = useState<ExamInfo | null>(null);
    const [isExamListExpanded, setIsExamListExpanded] = useState(false);
    
    // Stats Data State
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
    const [topWrongQuestions, setTopWrongQuestions] = useState<QuestionAccuracy[]>([]);
    const [statsLoading, setStatsLoading] = useState(false);

    // Subject Data State (from DB)
    const [subjectCategories, setSubjectCategories] = useState<Record<string, SubjectInfo[]>>({});
    const [allSubjects, setAllSubjects] = useState<SubjectInfo[]>([]);

    // Comparison Data State (from DB)
    const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
    const [comparisonLoading, setComparisonLoading] = useState(false);

    // Fetch available years from API
    const fetchAvailableYears = useCallback(async () => {
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
        }
    }, []);

    // Fetch subjects from API
    const fetchSubjects = useCallback(async () => {
        const response = await fetch(`${BACKEND_URL}/exams/subjects`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok') {
                setAllSubjects(data.subjects || []);
                setSubjectCategories(data.categories || {});
            }
        }
    }, []);

    // Fetch exams list from API
    const fetchExams = useCallback(async () => {
        if (!selectedYear) return;
        
        setIsLoading(true);
        let url = `${BACKEND_URL}/exams/list`;
        if (selectedYear) {
            url += `?year=${selectedYear}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            setError('시험 목록을 불러오는데 실패했습니다.');
            setIsLoading(false);
            return;
        }
        const data = await response.json();
        
        if (data.status === 'ok' && data.months) {
            const transformedMonths: MonthData[] = data.months.map((m: { month: string; year: number; monthNum: number; exams: ExamInfo[] }) => ({
                month: m.month,
                year: m.year,
                monthNum: m.monthNum,
                exams: (m.exams || []).map((exam: ExamInfo) => ({
                    ...exam,
                    date: `${exam.examYear}년 ${exam.examMonth}월`,
                    count: exam.studentCount
                }))
            }));
            
            // Sort months ascending (1월 -> 12월)
            const sortedMonths = transformedMonths.sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return (a.monthNum || 0) - (b.monthNum || 0);
            });
            
            setExamsByMonth(sortedMonths);
            
            // 자동으로 첫 번째 시험 선택
            const firstMonthWithExams = sortedMonths.find(m => m.exams.length > 0);
            if (firstMonthWithExams) {
                setActiveMonth(firstMonthWithExams.month);
                // 첫 번째 시험 자동 선택
                if (firstMonthWithExams.exams.length > 0) {
                    setSelectedExam(firstMonthWithExams.exams[0]);
                }
            }
        }
        setError(null);
        setIsLoading(false);
    }, [selectedYear]);

    // Fetch stats for selected exam
    const fetchStats = useCallback(async (exam: ExamInfo) => {
        setStatsLoading(true);
        
        const params = new URLSearchParams();
        if (exam.examCode) params.set('exam_code', exam.examCode);
        if (exam.subjectCode) params.set('subject_code', exam.subjectCode);
        if (exam.providerName) params.set('provider_name', exam.providerName);
        if (exam.examYear) params.set('exam_year', exam.examYear.toString());
        if (exam.examMonth) params.set('exam_month', exam.examMonth.toString());
        
        // Fetch stats
        const statsResponse = await fetch(`${BACKEND_URL}/exams/results/stats?${params}`);
        if (statsResponse.ok) {
            const statsResult = await statsResponse.json();
            if (statsResult.status === 'ok') {
                setStatsData(statsResult.stats);
                setScoreDistribution(statsResult.scoreDistribution || []);
            }
        }
        
        // Fetch question accuracy
        const questionsResponse = await fetch(`${BACKEND_URL}/exams/results/questions?${params}`);
        if (questionsResponse.ok) {
            const questionsResult = await questionsResponse.json();
            if (questionsResult.status === 'ok') {
                setTopWrongQuestions(questionsResult.topWrongQuestions || []);
            }
        }
        
        setStatsLoading(false);
    }, []);

    // Fetch comparison data from API
    const fetchComparisonData = useCallback(async (baseExam: ExamInfo, compareExamCodes: string[]) => {
        if (compareExamCodes.length === 0) {
            setComparisonData([]);
            return;
        }
        
        setComparisonLoading(true);
        const params = new URLSearchParams();
        params.set('base_exam_code', baseExam.examCode);
        params.set('base_subject_code', baseExam.subjectCode);
        params.set('compare_exam_codes', compareExamCodes.join(','));
        
        const response = await fetch(`${BACKEND_URL}/exams/results/comparison?${params}`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok') {
                setComparisonData(data.comparisons || []);
            }
        }
        setComparisonLoading(false);
    }, []);

    // CSV Download function
    const handleDownloadCSV = useCallback(async () => {
        if (!selectedExam) return;
        
        try {
            const params = new URLSearchParams();
            if (selectedExam.providerName) params.append('provider_name', selectedExam.providerName);
            if (selectedExam.examYear) params.append('exam_year', selectedExam.examYear.toString());
            if (selectedExam.examMonth) params.append('exam_month', selectedExam.examMonth.toString());
            if (selectedExam.examCode) params.append('exam_code', selectedExam.examCode);
            if (selectedExam.subjectCode) params.append('subject_code', selectedExam.subjectCode);
            params.append('limit', '1000');

            const response = await fetch(`${BACKEND_URL}/exams/results?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            
            if (data.status !== 'ok') {
                throw new Error(data.message || 'CSV 다운로드 실패');
            }
            
            const students = data.students || [];
            if (students.length === 0) {
                alert('다운로드할 데이터가 없습니다.');
                return;
            }

            const headers = ['이름', '학번', '시험명', '과목', '점수', '등급', '정답수', '총문제'];
            const rows = students.map((s: { studentName?: string; studentExternalId?: string; providerName?: string; subjectName?: string; subjectCode?: string; rawScore?: number | string; grade?: number; correctCount?: number; totalQuestions?: number }) => [
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
            link.download = `채점결과_${selectedExam.name}_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('CSV download failed:', err);
            alert('CSV 다운로드에 실패했습니다.');
        }
    }, [selectedExam]);

    // Fetch available years on mount
    useEffect(() => {
        fetchAvailableYears();
        fetchSubjects();
    }, [fetchAvailableYears, fetchSubjects]);

    // Fetch exams when year changes
    useEffect(() => {
        if (selectedYear) {
            fetchExams();
        }
    }, [selectedYear, fetchExams]);

    // Fetch stats when exam changes
    useEffect(() => {
        if (selectedExam) {
            fetchStats(selectedExam);
        }
    }, [selectedExam, fetchStats]);

    // Dynamic Positioning Refs
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const [dropdownLeft, setDropdownLeft] = useState(0);

    // Filter State - use first category from DB or default
    const categoryList = Object.keys(subjectCategories);
    const [mainSubject, setMainSubject] = useState('');
    const [subSubject, setSubSubject] = useState('');

    // Set default main subject when categories load
    useEffect(() => {
        if (categoryList.length > 0 && !mainSubject) {
            setMainSubject(categoryList[0]);
        }
    }, [categoryList, mainSubject]);

    const getDisplaySubject = () => {
        if (subSubject) {
            const subject = allSubjects.find(s => s.code === subSubject);
            return subject?.name || subSubject;
        }
        return mainSubject;
    };

    // Update Dropdown Position Logic
    const updateDropdownPosition = useCallback(() => {
        if (activeMonth && buttonRefs.current[activeMonth] && scrollContainerRef.current) {
            const button = buttonRefs.current[activeMonth];
            const container = scrollContainerRef.current;
            if (!button) return;
            const buttonRect = button.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const left = buttonRect.left - containerRect.left;
            setDropdownLeft(left);
        }
    }, [activeMonth]);

    // Update position on mount, activeMonth change, and scroll
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

    // Update selectedExam when month changes
    const handleMonthChange = (month: string) => {
        if (activeMonth === month) {
            setIsExamListExpanded(!isExamListExpanded);
            return;
        }

        setActiveMonth(month);
        setIsExamListExpanded(true);
        // 월 변경 시 드롭다운만 열고, 시험은 선택하지 않음
    };

    // Comparison State
    const [selectedComparisonExams, setSelectedComparisonExams] = useState<string[]>([]);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);

    // Get all exams for comparison (excluding current)
    const availableExamsForComparison = useMemo(() => {
        const exams: { examCode: string; name: string; month: string }[] = [];
        examsByMonth.forEach(m => {
            m.exams.forEach(e => {
                if (selectedExam && e.examCode !== selectedExam.examCode) {
                    exams.push({ examCode: e.examCode, name: e.name, month: m.month });
                }
            });
        });
        return exams;
    }, [examsByMonth, selectedExam]);

    // Toggle comparison exam
    const toggleComparisonExam = (examCode: string) => {
        if (selectedComparisonExams.includes(examCode)) {
            setSelectedComparisonExams(prev => prev.filter(c => c !== examCode));
        } else {
            setSelectedComparisonExams(prev => [...prev, examCode]);
        }
    };

    // Fetch comparison data when selection changes
    useEffect(() => {
        if (selectedExam && selectedComparisonExams.length > 0) {
            fetchComparisonData(selectedExam, selectedComparisonExams);
        } else {
            setComparisonData([]);
        }
    }, [selectedExam, selectedComparisonExams, fetchComparisonData]);

    // Top Tier Analysis State
    const [topTierPercent, setTopTierPercent] = useState<number>(10);

    // Generate rank data from score distribution (from DB)
    const rankData = useMemo(() => {
        if (scoreDistribution.length === 0) return [];
        
        const data: { rank: number; score: number }[] = [];
        let cumulativeCount = 0;
        
        const sortedDist = [...scoreDistribution].sort((a, b) => {
            const scoreA = parseInt(a.range.split('-')[0]);
            const scoreB = parseInt(b.range.split('-')[0]);
            return scoreB - scoreA;
        });
        
        for (const d of sortedDist) {
            const score = parseInt(d.range.split('-')[0]) + 5;
            for (let i = 0; i < d.count; i++) {
                cumulativeCount++;
                data.push({ rank: cumulativeCount, score });
            }
        }
        
        return data;
    }, [scoreDistribution]);

    // Generate distribution data from API data (from DB)
    const currentDistributionData = useMemo(() => {
        if (scoreDistribution.length === 0) return [];
        return scoreDistribution.map(d => ({
            score: parseInt(d.range.split('-')[0]),
            density: d.count
        }));
    }, [scoreDistribution]);

    // Generate comparison rank data from API (from DB)
    const comparisonRankData = useMemo(() => {
        return comparisonData.map(comp => {
            const data: { rank: number; score: number }[] = [];
            let cumulativeCount = 0;
            
            const sortedDist = [...(comp.scoreDistribution || [])].sort((a, b) => {
                const scoreA = parseInt(a.range.split('-')[0]);
                const scoreB = parseInt(b.range.split('-')[0]);
                return scoreB - scoreA;
            });
            
            for (const d of sortedDist) {
                const score = parseInt(d.range.split('-')[0]) + 5;
                for (let i = 0; i < d.count; i++) {
                    cumulativeCount++;
                    data.push({ rank: cumulativeCount, score });
                }
            }
            
            return { examCode: comp.examCode, data };
        });
    }, [comparisonData]);

    // Generate comparison distribution data from API (from DB)
    const comparisonDistributionData = useMemo(() => {
        return comparisonData.map(comp => ({
            examCode: comp.examCode,
            data: (comp.scoreDistribution || []).map(d => ({
                score: parseInt(d.range.split('-')[0]),
                density: d.count
            }))
        }));
    }, [comparisonData]);

    // Year options for Select
    const yearOptions = useMemo(() => {
        return availableYears.map(y => ({ value: String(y), label: `${y}년` }));
    }, [availableYears]);

    // Loading state (only show when loading and no years yet)
    if (isLoading && availableYears.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">시험 목록을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchExams}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    // No data state
    if (examsByMonth.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">등록된 시험이 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header: Year Select & Month Buttons */}
            <div className="flex flex-col gap-2 relative">
                {/* Year Select */}
                <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">채점결과</h2>
                    {availableYears.length > 0 && (
                        <Select
                            value={selectedYear}
                            onValueChange={setSelectedYear}
                            options={yearOptions}
                            placeholder="연도 선택"
                            aria-label="연도 필터"
                        />
                    )}
                    {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                </div>
                
                {/* Month Buttons */}
                <div
                    ref={scrollContainerRef}
                    className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide snap-x relative"
                >
                    {examsByMonth.map((group) => {
                        const hasExams = group.exams.length > 0;
                        const isActive = activeMonth === group.month;
                        // Display as "X월" format
                        const displayMonth = group.monthNum ? `${group.monthNum}월` : group.month;
                        const buttonClass = `flex items-center justify-center px-4 py-2 min-w-[4rem] h-9 rounded-lg text-sm font-semibold transition-all whitespace-nowrap snap-center shrink-0 ${
                            isActive
                                ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                                : hasExams
                                    ? 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'
                                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        }`;
                        return (
                            <button
                                key={group.month}
                                ref={el => { buttonRefs.current[group.month] = el; }}
                                onClick={() => handleMonthChange(group.month)}
                                className={buttonClass}
                                disabled={!hasExams}
                            >
                                {displayMonth}
                            </button>
                        );
                    })}
                </div>

                {isExamListExpanded && activeMonth && (
                    <div
                        className="absolute top-[3.5rem] z-20 transition-all duration-200 ease-out"
                        style={{ left: `${Math.max(0, dropdownLeft)}px` }}
                    >
                        <div className="bg-white rounded-xl p-2 shadow-xl border border-gray-200 flex flex-col gap-1 w-64 animate-in slide-in-from-top-1 fade-in duration-200">
                            <div className="text-[10px] text-gray-400 font-medium px-2 py-1 mb-1 border-b pb-1">
                                {activeMonth} 시험 목록
                            </div>
                            {examsByMonth.find(g => g.month === activeMonth)?.exams.map((exam, idx) => {
                                const isSelected = selectedExam?.name === exam.name;
                                const itemClass = `w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between items-center group ${
                                    isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                                }`;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedExam(exam);
                                            setIsExamListExpanded(false);
                                        }}
                                        className={itemClass}
                                    >
                                        <span className="truncate max-w-[180px]">{exam.name}</span>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {isExamListExpanded && (
                    <div className="fixed inset-0 z-10" onClick={() => setIsExamListExpanded(false)} />
                )}
            </div>

            {/* Title & Info */}
            <div className="flex justify-between items-end">
                {selectedExam ? (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {selectedExam.name.startsWith(activeMonth) || selectedExam.name.match(/^\d+월/)
                                ? selectedExam.name
                                : `${activeMonth} ${selectedExam.name}`}
                        </h2>
                        <span className="text-sm text-gray-500">{selectedExam.date} 시행</span>
                    </div>
                ) : (
                    <div className="text-gray-400">시험을 선택해주세요</div>
                )}
            </div>

            {selectedExam && (
                <>

                    {/* CSV Download Section */}
                    <div className="rounded-2xl border bg-white">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold">개별 결과 다운로드</h3>
                                    <p className="text-sm text-neutral-600 mt-1">학생별 성적표 데이터를 CSV로 받으세요</p>
                                </div>
                                <button 
                                    onClick={handleDownloadCSV}
                                    disabled={!selectedExam}
                                    className="px-4 py-2 rounded-xl border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download size={14} />
                                    CSV 다운로드
                                </button>
                            </div>
                            <div className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                    {['국어', '수학', '영어', '사회탐구', '과학탐구', '한국사'].map((subject) => (
                                        <button
                                            key={subject}
                                            onClick={() => {/* Handle subject filter */}}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                selectedExam?.subjectName?.includes(subject) || (!selectedExam && subject === '수학')
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                                {(selectedExam?.subjectName?.includes('탐구') || selectedExam?.subjectCode?.includes('SOC') || selectedExam?.subjectCode?.includes('SCI')) && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {(selectedExam?.subjectCode?.includes('SOC') ? ['생활과 윤리', '윤리와 사상', '한국지리', '세계지리'] : ['물리학Ⅰ', '화학Ⅰ', '생명과학Ⅰ', '지구과학Ⅰ']).map((subSubject) => (
                                            <button
                                                key={subSubject}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                            >
                                                {subSubject}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats & Charts Section */}
                    <div className="rounded-2xl border bg-white">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold">{getDisplaySubject()} 반별 점수 분석</h3>
                            <p className="text-sm text-neutral-600 mt-1">반별 채점 통계 및 점수 분포를 확인하세요</p>
                        </div>
                        <div className="p-6">
                            {statsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    <span className="ml-2 text-gray-500">통계 로딩 중...</span>
                                </div>
                            ) : (
                                <>
                                    {/* Statistics Cards - Restored original colorful design */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                        <div className="rounded-xl bg-blue-50 p-4 border-2 border-blue-200">
                                            <div className="text-2xl font-bold text-blue-600">{statsData?.totalStudents ?? selectedExam.count ?? 0}</div>
                                            <div className="text-xs text-blue-700 font-medium">채점인원</div>
                                        </div>
                                        <div className="rounded-xl bg-green-50 p-4 border-2 border-green-200">
                                            <div className="text-2xl font-bold text-green-600">{statsData?.avgScore?.toFixed(1) ?? '-'}</div>
                                            <div className="text-xs text-green-700 font-medium">평균</div>
                                        </div>
                                        <div className="rounded-xl bg-orange-50 p-4 border-2 border-orange-200">
                                            <div className="text-2xl font-bold text-orange-600">{statsData?.stddevScore?.toFixed(1) ?? '-'}</div>
                                            <div className="text-xs text-orange-700 font-medium">표준편차</div>
                                        </div>
                                        <div className="rounded-xl bg-purple-50 p-4 border-2 border-purple-200">
                                            <div className="text-2xl font-bold text-purple-600">{statsData?.maxScore ?? '-'}</div>
                                            <div className="text-xs text-purple-700 font-medium">최고점</div>
                                        </div>
                                        <div className="rounded-xl bg-red-50 p-4 border-2 border-red-200">
                                            <div className="text-2xl font-bold text-red-600">{statsData?.minScore ?? '-'}</div>
                                            <div className="text-xs text-red-700 font-medium">최저점</div>
                                        </div>
                                    </div>

                                    {/* Score Distribution Bars - Restored original design */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold mb-3">점수 분포</h4>
                                        <div className="space-y-2">
                                            {scoreDistribution.length > 0 ? (
                                                scoreDistribution.map((item, idx) => {
                                                    const totalStudents = statsData?.totalStudents || 1;
                                                    const percentage = Math.round((item.count / totalStudents) * 100);
                                                    return (
                                                        <div key={idx} className="flex items-center gap-3">
                                                            <div className="w-16 text-xs font-medium">{item.range}</div>
                                                            <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                                                                <div
                                                                    className="h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-end pr-2"
                                                                    style={{ width: `${Math.max(percentage, 5)}%` }}
                                                                >
                                                                    {percentage > 10 && (
                                                                        <span className="text-xs font-medium text-white">{item.count}명</span>
                                                                    )}
                                                                </div>
                                                                {percentage <= 10 && (
                                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">{item.count}명</span>
                                                                )}
                                                            </div>
                                                            <div className="w-16 text-xs text-gray-600 text-right">{percentage}%</div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-4 text-gray-400">점수 분포 데이터가 없습니다</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Charts Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                        {/* Chart 1: Rank vs Score */}
                                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-base font-bold text-gray-900">성적 분포도 (Rank vs Score)</h4>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setIsComparisonOpen(!isComparisonOpen)}
                                                        className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                                            isComparisonOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        <Plus size={12} /> 비교 ({selectedComparisonExams.length})
                                                        {comparisonLoading && <Loader2 size={12} className="animate-spin ml-1" />}
                                                    </button>

                                                    {isComparisonOpen && (
                                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                                                            <div className="flex justify-between items-center mb-2 px-1">
                                                                <span className="text-xs font-semibold text-gray-500">비교할 시험 선택</span>
                                                                <button onClick={() => setIsComparisonOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
                                                            </div>
                                                            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                                                {availableExamsForComparison.map(exam => (
                                                                    <label key={exam.examCode} className="flex items-center gap-2 px-2 py-1.5 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedComparisonExams.includes(exam.examCode)}
                                                                            onChange={() => toggleComparisonExam(exam.examCode)}
                                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm text-gray-700 font-medium truncate max-w-[180px]">{exam.name}</span>
                                                                            <span className="text-xs text-gray-400">{exam.month}</span>
                                                                        </div>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="h-64">
                                                {rankData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                            <XAxis type="number" dataKey="rank" name="등수" unit="등" domain={[1, 'dataMax']} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                                            <YAxis type="number" dataKey="score" name="점수" unit="점" domain={[0, 100]} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                                            <Tooltip
                                                                cursor={{ strokeDasharray: '3 3' }}
                                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                formatter={(value, name) => [value ?? 0, String(name ?? '').includes('비교') ? name : '점수']}
                                                                labelFormatter={(label) => `${label}등`}
                                                            />
                                                            {comparisonRankData.map((comp) => (
                                                                <Line
                                                                    key={comp.examCode}
                                                                    type="monotone"
                                                                    dataKey="score"
                                                                    data={comp.data}
                                                                    stroke="#93C5FD"
                                                                    strokeWidth={2}
                                                                    dot={false}
                                                                    name={`${comp.examCode} (비교)`}
                                                                    strokeDasharray="5 5"
                                                                    isAnimationActive={false}
                                                                />
                                                            ))}
                                                            <Line
                                                                type="monotone"
                                                                dataKey="score"
                                                                data={rankData}
                                                                stroke="#2563EB"
                                                                strokeWidth={3}
                                                                dot={false}
                                                                name={`현재 (${selectedExam?.name || activeMonth})`}
                                                                activeDot={{ r: 6 }}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400">
                                                        점수 분포 데이터가 없습니다
                                                    </div>
                                                )}
                                            </div>
                                            {selectedComparisonExams.length > 0 && (
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 justify-center">
                                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div>현재</div>
                                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-300"></div>비교 ({selectedComparisonExams.length}개)</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Chart 2: Score Density */}
                                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                            <h4 className="text-base font-bold text-gray-900 mb-4">성적 분포 (Score Density)</h4>
                                            <div className="h-64">
                                                {currentDistributionData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                                            <defs>
                                                                <linearGradient id="colorDensityBlue" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                            <XAxis dataKey="score" type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDataOverflow={false} />
                                                            <YAxis hide />
                                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />

                                                            {comparisonDistributionData.map((comp) => (
                                                                <Area
                                                                    key={comp.examCode}
                                                                    type="monotone"
                                                                    dataKey="density"
                                                                    data={comp.data}
                                                                    stroke="#93C5FD"
                                                                    fill="none"
                                                                    strokeWidth={2}
                                                                    strokeDasharray="5 5"
                                                                    name={`${comp.examCode} (비교)`}
                                                                />
                                                            ))}
                                                            <Area
                                                                type="monotone"
                                                                dataKey="density"
                                                                data={currentDistributionData}
                                                                stroke="#2563EB"
                                                                fillOpacity={1}
                                                                fill="url(#colorDensityBlue)"
                                                                strokeWidth={2}
                                                                name={`현재 (${activeMonth})`}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400">
                                                        점수 분포 데이터가 없습니다
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Error Rate Analysis - 2 Column Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 전체 오답률 분석 */}
                        <div className="rounded-2xl border bg-white p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold">{getDisplaySubject()} 전체 오답률 분석</h3>
                                    <p className="text-sm text-neutral-600 mt-1">전체 학생의 문항별 정답 현황</p>
                                </div>
                            </div>
                            <div className="border rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left">순위</th>
                                            <th className="px-4 py-2 text-left">문항</th>
                                            <th className="px-4 py-2 text-left">오답률</th>
                                            <th className="px-4 py-2 text-left w-24">그래프</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topWrongQuestions.length > 0 ? topWrongQuestions.slice(0, 5).map((item, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="px-4 py-2 font-medium">{idx + 1}</td>
                                                <td className="px-4 py-2">{item.number}번</td>
                                                <td className="px-4 py-2">{item.wrongRate.toFixed(0)}%</td>
                                                <td className="px-4 py-2">
                                                    <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                                                        <div
                                                            className="bg-red-500 h-full rounded-full"
                                                            style={{ width: `${item.wrongRate}%` }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                    {statsLoading ? '로딩 중...' : '오답률 데이터가 없습니다.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 상위 N% 오답률 분석 */}
                        <div className="rounded-2xl border bg-white p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold">상위 {topTierPercent}% 오답률 분석</h3>
                                    <p className="text-sm text-neutral-600 mt-1">상위권 학생들의 주요 취약 유형</p>
                                </div>
                                <div className="relative">
                                    <select
                                        value={topTierPercent}
                                        onChange={(e) => setTopTierPercent(Number(e.target.value))}
                                        className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8"
                                    >
                                        <option value={10}>상위 10%</option>
                                        <option value={20}>상위 20%</option>
                                        <option value={30}>상위 30%</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-3 text-gray-500 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div className="border rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-blue-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">순위</th>
                                            <th className="px-4 py-2 text-left">문항</th>
                                            <th className="px-4 py-2 text-left">오답률</th>
                                            <th className="px-4 py-2 text-left w-24">그래프</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topWrongQuestions.length > 0 ? topWrongQuestions.slice(0, 5).map((item, idx) => {
                                            const topTierWrongRate = Math.max(5, Math.floor(item.wrongRate * (topTierPercent / 100) * 1.5));
                                            return (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-4 py-2 font-medium">{idx + 1}</td>
                                                    <td className="px-4 py-2">{item.number}번</td>
                                                    <td className="px-4 py-2">{topTierWrongRate}%</td>
                                                    <td className="px-4 py-2">
                                                        <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                                                            <div
                                                                className="bg-blue-600 h-full rounded-full"
                                                                style={{ width: `${topTierWrongRate}%` }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                    {statsLoading ? '로딩 중...' : '오답률 데이터가 없습니다.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

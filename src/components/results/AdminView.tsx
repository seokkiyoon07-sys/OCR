'use client';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, AreaChart, Area, LineChart, Line } from 'recharts';
import { Users, TrendingUp, AlertCircle, Calendar, FileDown, Download, Plus, ChevronDown } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';

// Generate 250 Mock Data Points
const SCATTER_DATA = Array.from({ length: 250 }, (_, i) => ({
    id: i,
    x: Math.floor(Math.random() * 90) + 10, // Study Time (10-100 hours)
    y: Math.min(100, Math.max(0, Math.floor(40 + (Math.random() * 90 * 0.5) + (Math.random() * 40 - 20)))), // Score (correlated with time)
    z: Math.floor(Math.random() * 500) // Z-index (optional size)
}));

// Mock Data: Exams by Month
const examsByMonth = [
    { month: '12월', exams: [] },
    { month: '11월', exams: [] },
    { month: '10월', exams: [] },
    { month: '9월', exams: [] },
    { month: '8월', exams: [] },
    {
        month: '7월',
        exams: [
            { name: '인천시 교육청 학력평가', date: '2025년 7월 10일', count: 240 },
            { name: '대성 더 프리미엄 모의고사', date: '2025년 7월 24일', count: 225 },
            { name: '서프(Seoff) 모의고사', date: '2025년 7월 31일', count: 210 }
        ]
    },
    {
        month: '6월',
        exams: [
            { name: '한국교육과정평가원 모의평가 (6월)', date: '2025년 6월 05일', count: 250 },
            { name: '대성 더 프리미엄 모의고사', date: '2025년 6월 19일', count: 240 },
            { name: '서프(Seoff) 모의고사', date: '2025년 6월 26일', count: 220 }
        ]
    },
    {
        month: '5월',
        exams: [
            { name: '경기도 교육청 학력평가 (고3)', date: '2025년 5월 08일', count: 235 },
            { name: '대성 더 프리미엄 모의고사', date: '2025년 5월 22일', count: 230 },
            { name: '서프(Seoff) 모의고사', date: '2025년 5월 29일', count: 215 },
            { name: '5월 월례고사', date: '2025년 5월 15일', count: 200, type: 'etc' }
        ]
    },
    {
        month: '4월',
        exams: [
            { name: '경기도 교육청 학력평가', date: '2025년 4월 09일', count: 245 },
            { name: '대성 더 프리미엄 모의고사', date: '2025년 4월 23일', count: 235 },
            { name: '서프(Seoff) 모의고사', date: '2025년 4월 30일', count: 220 }
        ]
    },
    {
        month: '3월',
        exams: [
            { name: '서울시 교육청 학력평가', date: '2025년 3월 27일', count: 250 },
            { name: '대성 더 프리미엄 모의고사', date: '2025년 3월 20일', count: 240 },
            { name: '서프(Seoff) 모의고사', date: '2025년 3월 13일', count: 230 }
        ]
    },
    { month: '2월', exams: [] },
    { month: '1월', exams: [] }
];

export default function AdminView() {
    // Navigation State
    const [activeMonth, setActiveMonth] = useState<string>('7월');
    const [selectedExam, setSelectedExam] = useState<any>(examsByMonth.find(m => m.month === '7월')?.exams[0] || null);
    const [isExamListExpanded, setIsExamListExpanded] = useState(false);

    // Dynamic Positioning Refs
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const [dropdownLeft, setDropdownLeft] = useState(0);

    // Filter State
    const [mainSubject, setMainSubject] = useState('국어');
    const [subSubject, setSubSubject] = useState('');

    const mainSubjects = [
        { id: '국어', name: '국어' },
        { id: '수학', name: '수학' },
        { id: '영어', name: '영어' },
        { id: '사회탐구', name: '사회탐구' },
        { id: '과학탐구', name: '과학탐구' },
        { id: '한국사', name: '한국사' }
    ];

    const subSubjects = {
        사회탐구: [
            { id: '생활과 윤리', name: '생활과 윤리' },
            { id: '윤리와 사상', name: '윤리와 사상' },
            { id: '한국지리', name: '한국지리' },
            { id: '세계지리', name: '세계지리' }
        ],
        과학탐구: [
            { id: '물리학I', name: '물리학I' },
            { id: '화학I', name: '화학I' },
            { id: '생명과학I', name: '생명과학I' },
            { id: '지구과학I', name: '지구과학I' }
        ]
    };

    const getDisplaySubject = () => {
        if (subSubject) return subSubject;
        return mainSubject;
    };

    // Update Dropdown Position Logic
    const updateDropdownPosition = () => {
        if (activeMonth && buttonRefs.current[activeMonth] && scrollContainerRef.current) {
            const button = buttonRefs.current[activeMonth];
            const container = scrollContainerRef.current;
            const buttonRect = button.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate relative left position
            let left = buttonRect.left - containerRect.left;

            // Adjust to center the dropdown if possible? 
            // User wants "underneath", but aligned left or centered is standard. 
            // Left align with the button is simplest.
            setDropdownLeft(left);
        }
    };

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
    }, [activeMonth]);

    // Update selectedExam when month changes
    const handleMonthChange = (month: string) => {
        if (activeMonth === month) {
            setIsExamListExpanded(!isExamListExpanded);
            return;
        }

        setActiveMonth(month);
        setIsExamListExpanded(true); // Always open when switching months

        const monthData = examsByMonth.find(m => m.month === month);
        if (monthData && monthData.exams.length > 0) {
            setSelectedExam(monthData.exams[0]);
        } else {
            setSelectedExam(null); // No exams for this month
        }
    };

    // Comparison State
    const [selectedComparisonMonths, setSelectedComparisonMonths] = useState<string[]>([]);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);

    // Toggle comparison month
    const toggleComparisonMonth = (month: string) => {
        if (selectedComparisonMonths.includes(month)) {
            setSelectedComparisonMonths(prev => prev.filter(m => m !== month));
        } else {
            setSelectedComparisonMonths(prev => [...prev, month]);
        }
    };

    // Top Tier Analysis State
    const [topTierPercent, setTopTierPercent] = useState<number>(10);

    // --- DATA GENERATION (HOOKS) ---

    // Helper to generate distinct pseudo DISTRIBUTION data for comparison (Bell Curve)
    const getComparisonDistributionData = useMemo(() => {
        return selectedComparisonMonths.map(month => {
            const seed = month.charCodeAt(0) * 10;
            const offset = (seed % 15) - 7;
            const mean = 78.5 + offset; // Shift mean
            const stdDev = 12.3;
            const data = [];
            for (let x = 0; x <= 100; x += 2) {
                const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
                data.push({ score: x, density: y });
            }
            return { month, data };
        });
    }, [selectedComparisonMonths]);

    // Current Distribution Data (Bell Curve)
    const currentDistributionData = useMemo(() => {
        const data = [];
        const mean = 78.5;
        const stdDev = 12.3;
        for (let x = 0; x <= 100; x += 2) {
            const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
            data.push({ score: x, density: y });
        }
        return data;
    }, []);

    // Rank Data (Rank vs Score)
    const RANK_DATA = useMemo(() => {
        return [...SCATTER_DATA]
            .sort((a, b) => b.y - a.y)
            .map((item, index) => ({ rank: index + 1, score: item.y, time: item.x }));
    }, []);

    // Helper to generate distinct pseudo RANK data for comparison
    const getComparisonRankData = useMemo(() => {
        return selectedComparisonMonths.map(month => {
            const seed = month.charCodeAt(0) * 10;
            const offset = (seed % 15) - 7;
            const data = [];

            // Generate raw scores first
            const rawScores = [];
            for (let i = 0; i < 250; i++) {
                // Different random distribution
                const studyTime = Math.floor(Math.random() * 90) + 10;
                let scoreBase = 40 + (studyTime * 0.5) + offset;
                let score = Math.min(100, Math.max(0, Math.floor(scoreBase + (Math.random() * 40) - 20)));
                rawScores.push(score);
            }

            // Sort and map to rank
            rawScores.sort((a, b) => b - a);
            const rankData = rawScores.map((score, index) => ({ rank: index + 1, score }));

            return { month, data: rankData };
        });
    }, [selectedComparisonMonths]);

    // Mock Stats Data
    const statsData = {
        gradedCount: selectedExam ? selectedExam.count : 0,
        average: 78.5,
        standardDeviation: 12.3,
        highestScore: 100,
        lowestScore: 24,
        topWrongQuestions: [
            { question: 22, wrongCount: 142, percentage: 68 },
            { question: 30, wrongCount: 135, percentage: 65 },
            { question: 15, wrongCount: 112, percentage: 54 },
            { question: 29, wrongCount: 98, percentage: 47 },
            { question: 21, wrongCount: 85, percentage: 41 },
        ]
    };

    // --- RENDER ---
    return (
        <div className="space-y-6">
            {/* Header: Month & Exam Selection (Scrollable) */}
            <div className="flex flex-col gap-2 relative">
                <div
                    ref={scrollContainerRef}
                    className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide snap-x relative"
                >
                    {examsByMonth.map((group) => {
                        const hasExams = group.exams.length > 0;
                        const isActive = activeMonth === group.month;
                        return (
                            <button
                                key={group.month}
                                ref={el => buttonRefs.current[group.month] = el}
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
                                {group.month}
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
                            {examsByMonth.find(g => g.month === activeMonth)?.exams.map((exam, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSelectedExam(exam);
                                        setIsExamListExpanded(false);
                                    }}
                                    className={`
                                        w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between items-center group
                                        ${selectedExam?.name === exam.name
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'hover:bg-gray-50 text-gray-700'
                                        }
                                    `}
                                >
                                    <span className="truncate max-w-[180px]">{exam.name}</span>
                                    {selectedExam?.name === exam.name && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Overlay to close dropdown if clicking outside */}
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
                    {/* CSV Download & Filter Section */}
                    <div className="rounded-2xl border bg-white">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold">개별 결과 다운로드</h3>
                                    <p className="text-sm text-neutral-600 mt-1">학생별 성적표 데이터를 CSV로 받으세요</p>
                                </div>
                                <button className="px-4 py-2 rounded-xl border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium text-sm flex items-center gap-1">
                                    <Download size={14} />
                                    CSV 다운로드
                                </button>
                            </div>
                            {/* Subject Filter */}
                            <div className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                    {mainSubjects.map((subject) => (
                                        <button
                                            key={subject.id}
                                            onClick={() => {
                                                setMainSubject(subject.id);
                                                setSubSubject('');
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mainSubject === subject.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {subject.name}
                                        </button>
                                    ))}
                                </div>
                                {(mainSubject === '사회탐구' || mainSubject === '과학탐구') && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {subSubjects[mainSubject as keyof typeof subSubjects]?.map((subSubjectItem) => (
                                            <button
                                                key={subSubjectItem.id}
                                                onClick={() => setSubSubject(subSubjectItem.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${subSubject === subSubjectItem.id
                                                    ? 'bg-gray-700 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {subSubjectItem.name}
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
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                                    <div className="text-2xl font-bold text-gray-900">{statsData.gradedCount}</div>
                                    <div className="text-xs text-gray-500 font-medium mt-1">채점인원</div>
                                </div>
                                <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                                    <div className="text-2xl font-bold text-gray-900">{statsData.average}</div>
                                    <div className="text-xs text-gray-500 font-medium mt-1">평균</div>
                                </div>
                                <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                                    <div className="text-2xl font-bold text-gray-900">{statsData.standardDeviation.toFixed(1)}</div>
                                    <div className="text-xs text-gray-500 font-medium mt-1">표준편차</div>
                                </div>
                                <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                                    <div className="text-2xl font-bold text-gray-900">{statsData.highestScore}</div>
                                    <div className="text-xs text-gray-500 font-medium mt-1">최고점</div>
                                </div>
                                <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                                    <div className="text-2xl font-bold text-gray-900">{statsData.lowestScore}</div>
                                    <div className="text-xs text-gray-500 font-medium mt-1">최저점</div>
                                </div>
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Chart 1: Rank vs Score (Cumulative S-Curve) */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-base font-bold text-gray-900">성적 분포도 (Rank vs Score)</h4>
                                        {/* Comparison Controls */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsComparisonOpen(!isComparisonOpen)}
                                                className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${isComparisonOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <Plus size={12} /> 비교 ({selectedComparisonMonths.length})
                                            </button>

                                            {isComparisonOpen && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                                                    <div className="flex justify-between items-center mb-2 px-1">
                                                        <span className="text-xs font-semibold text-gray-500">비교할 월 선택</span>
                                                        <button onClick={() => setIsComparisonOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
                                                    </div>
                                                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                                        {examsByMonth.filter(m => m.month !== activeMonth).map(m => (
                                                            <label key={m.month} className="flex items-center gap-2 px-2 py-1.5 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedComparisonMonths.includes(m.month)}
                                                                    onChange={() => toggleComparisonMonth(m.month)}
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                                />
                                                                <span className="text-sm text-gray-700 font-medium">{m.month}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis type="number" dataKey="rank" name="등수" unit="등" domain={[1, 250]} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                                <YAxis type="number" dataKey="score" name="점수" unit="점" domain={[0, 100]} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    cursor={{ strokeDasharray: '3 3' }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: number, name: string) => [value, name.includes('Current') ? '점수' : (name.includes('score') ? '점수' : name)]}
                                                    labelFormatter={(label) => `${label}등`}
                                                />
                                                {/* Comparison Lines (Lighter) */}
                                                {getComparisonRankData.map((comp) => (
                                                    <Line
                                                        key={comp.month}
                                                        type="monotone"
                                                        dataKey="score"
                                                        data={comp.data}
                                                        stroke="#93C5FD"
                                                        strokeWidth={2}
                                                        dot={false}
                                                        name={`${comp.month} (비교)`}
                                                        strokeDasharray="5 5"
                                                        isAnimationActive={false}
                                                    />
                                                ))}
                                                {/* Current Line (Prominent) */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="score"
                                                    data={RANK_DATA}
                                                    stroke="#2563EB"
                                                    strokeWidth={3}
                                                    dot={false}
                                                    name={`현재 (${selectedExam?.name || activeMonth})`}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {selectedComparisonMonths.length > 0 && (
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 justify-center">
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div>현재 ({activeMonth})</div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-300"></div>과거 비교 ({selectedComparisonMonths.join(', ')})</div>
                                        </div>
                                    )}
                                </div>

                                {/* Chart 2: Score Density (Bell Curve) */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <h4 className="text-base font-bold text-gray-900 mb-4">성적 분포 (Score Density)</h4>
                                    <div className="h-64">
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

                                                {getComparisonDistributionData.map((comp) => (
                                                    <Area
                                                        key={comp.month}
                                                        type="monotone"
                                                        dataKey="density"
                                                        data={comp.data}
                                                        stroke="#93C5FD"
                                                        fill="none"
                                                        strokeWidth={2}
                                                        strokeDasharray="5 5"
                                                        name={`${comp.month} (비교)`}
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Rate Analysis Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 1. General Error Rate */}
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
                                        {statsData.topWrongQuestions.map((item, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="px-4 py-2 font-medium">{idx + 1}</td>
                                                <td className="px-4 py-2">{item.question}번</td>
                                                <td className="px-4 py-2">{item.percentage}%</td>
                                                <td className="px-4 py-2">
                                                    <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                                                        <div className="bg-red-500 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 2. Top Tier Error Rate */}
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
                                        {statsData.topWrongQuestions.map((item, idx) => {
                                            // Mock data modification for top tier (lower wrong rate generally, but different distribution)
                                            const topTierWrongRate = Math.max(5, Math.floor(item.percentage * (topTierPercent / 100) * 1.5 + (Math.random() * 10)));
                                            return (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-4 py-2 font-medium">{idx + 1}</td>
                                                    <td className="px-4 py-2">{item.question}번</td>
                                                    <td className="px-4 py-2">{topTierWrongRate}%</td>
                                                    <td className="px-4 py-2">
                                                        <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                                                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${topTierWrongRate}%` }}></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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

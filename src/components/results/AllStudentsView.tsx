'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';

// Mock Data Type
interface StudentResult {
    id: string;
    name: string;
    phoneNumber: string; // 8 digits
    examTitle: string;
    subject: string;
    score: number;
    grade: number; // 1-9
    class: string;
    date: string;
}

// Mock Data: Exams by Month (Same as AdminView)
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

interface AllStudentsViewProps {
    onSelectStudent: (student: { name: string; phoneNumber: string }) => void;
}

export default function AllStudentsView({ onSelectStudent }: AllStudentsViewProps) {
    // Navigation State
    const [activeMonth, setActiveMonth] = useState<string>('7월');
    const [selectedExam, setSelectedExam] = useState<any>(examsByMonth.find(m => m.month === '7월')?.exams[0] || null);
    const [isExamListExpanded, setIsExamListExpanded] = useState(false);

    // Dynamic Positioning Refs
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const [dropdownLeft, setDropdownLeft] = useState(0);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('ALL');
    const [filterSubject, setFilterSubject] = useState('ALL');

    // Update Dropdown Position Logic
    const updateDropdownPosition = () => {
        if (activeMonth && buttonRefs.current[activeMonth] && scrollContainerRef.current) {
            const button = buttonRefs.current[activeMonth];
            const container = scrollContainerRef.current;
            const buttonRect = button.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            let left = buttonRect.left - containerRect.left;
            setDropdownLeft(left);
        }
    };

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

    const handleMonthChange = (month: string) => {
        if (activeMonth === month) {
            setIsExamListExpanded(!isExamListExpanded);
            return;
        }
        setActiveMonth(month);
        setIsExamListExpanded(true);
        const monthData = examsByMonth.find(m => m.month === month);
        if (monthData && monthData.exams.length > 0) {
            setSelectedExam(monthData.exams[0]);
        } else {
            setSelectedExam(null);
        }
    };

    // Memoized Data Generation based on Selected Exam
    const filteredData = useMemo(() => {
        const classes = ['A반', 'B반', 'C반', 'S반'];
        const subjects = ['국어', '수학', '영어'];
        const firstNames = ['김', '이', '박', '최', '정', '강', '조', '윤', 'Jang', '임', '한', '오'];
        const lastNames = ['민수', '서연', '지훈', '수진', '우성', '하늘', '민지', '성호', '장미', '재범', '도현', '지영'];

        const results: StudentResult[] = [];
        const count = selectedExam ? 250 : 0; // Only generate if exam selected

        // Seed random based on selectedExam name to be deterministic-ish or just random
        for (let i = 0; i < count; i++) {
            const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${randomFirstName}${randomLastName}`;
            const phone = `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
            const subject = subjects[Math.floor(Math.random() * subjects.length)];
            const score = Math.floor(Math.random() * 51) + 50;
            let grade = 1;
            if (score < 60) grade = 5;
            else if (score < 70) grade = 4;
            else if (score < 80) grade = 3;
            else if (score < 90) grade = 2;

            results.push({
                id: `res_${i}`,
                name: name,
                phoneNumber: phone,
                class: classes[Math.floor(Math.random() * classes.length)],
                examTitle: selectedExam ? selectedExam.name : '시험 없음',
                subject: subject,
                score: score,
                grade: grade,
                date: selectedExam ? selectedExam.date : ''
            });
        }

        // Apply Filters
        return results.filter(item => {
            const matchesSearch = item.name.includes(searchTerm) || item.phoneNumber.includes(searchTerm);
            const matchesClass = filterClass === 'ALL' || item.class === filterClass;
            const matchesSubject = filterSubject === 'ALL' || item.subject === filterSubject;
            return matchesSearch && matchesClass && matchesSubject;
        });
    }, [selectedExam, searchTerm, filterClass, filterSubject]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">전체 학생 조회 (관리자용)</h2>
                <div className="text-sm text-neutral-500">
                    총 <span className="text-blue-600 font-bold">{filteredData.length}</span>건의 성적 확인
                </div>
            </div>

            {/* Month & Exam Selector */}
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

                {isExamListExpanded && (
                    <div className="fixed inset-0 z-10" onClick={() => setIsExamListExpanded(false)} />
                )}
            </div>

            {/* Selected Exam Title */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Selected Exam</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">
                        {selectedExam ? selectedExam.name : '시험을 선택해주세요'}
                    </h3>
                </div>
                {selectedExam && (
                    <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                        {selectedExam.date} 시행
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="이름 또는 핸드폰 번호 검색"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <select
                            className="appearance-none px-4 py-2 pr-8 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                        >
                            <option value="ALL">모든 반</option>
                            <option value="A반">A반</option>
                            <option value="B반">B반</option>
                            <option value="C반">C반</option>
                            <option value="S반">S반</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-3 text-gray-400 pointer-events-none" size={14} />
                    </div>

                    <div className="relative">
                        <select
                            className="appearance-none px-4 py-2 pr-8 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                        >
                            <option value="ALL">모든 과목</option>
                            <option value="국어">국어</option>
                            <option value="수학">수학</option>
                            <option value="영어">영어</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-3 text-gray-400 pointer-events-none" size={14} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">이름</th>
                                <th className="px-6 py-4">핸드폰 번호</th>
                                <th className="px-6 py-4">반</th>
                                <th className="px-6 py-4">시험명</th>
                                <th className="px-6 py-4">과목</th>
                                <th className="px-6 py-4">점수</th>
                                <th className="px-6 py-4">등급</th>
                                <th className="px-6 py-4 text-center">상세보기</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => onSelectStudent({ name: item.name, phoneNumber: item.phoneNumber })}
                                        className="hover:bg-blue-50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{item.phoneNumber}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{item.class}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{item.examTitle}</td>
                                        <td className="px-6 py-4 font-medium">{item.subject}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{item.score}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${item.grade === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                item.grade === 2 ? 'bg-gray-100 text-gray-700' :
                                                    'bg-orange-50 text-orange-700'
                                                }`}>
                                                {item.grade}
                                            </span>
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
            </div>
        </div>
    );
}

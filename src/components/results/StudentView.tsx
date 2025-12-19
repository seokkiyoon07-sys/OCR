'use client';

import { useState } from 'react';
import { ChevronDown, Calendar, Target, TrendingUp, AlertCircle, LogOut } from 'lucide-react';

const SpoilerCell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div
            onClick={() => setIsRevealed(!isRevealed)}
            className={`transition-all duration-300 cursor-pointer rounded-lg relative overflow-hidden ${className} ${isRevealed ? '' : 'bg-slate-200 hover:bg-slate-300'
                }`}
            title={isRevealed ? "클릭하여 가리기" : "클릭하여 점수 확인"}
        >
            <div className={`transition-opacity duration-300 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                {children}
            </div>
            {!isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-medium select-none">
                    Click
                </div>
            )}
        </div>
    );
};

interface StudentViewProps {
    studentName: string;
    phoneNumber: string;
    onLogout: () => void;
}

// Mock Data
const examsByMonth = [
    {
        month: '11월',
        exams: [
            { name: '대성 더 프리미엄 모의고사', date: '2025년 11월 12일', count: 210, id: 'exam_nov_duff' },
            { name: '서울 교육청 학력평가', date: '2025년 11월 05일', count: 180, id: 'exam_nov_suff' }
        ]
    },
    {
        month: '10월',
        exams: [
            { name: '이투스 전국 모의고사', date: '2025년 10월 22일', count: 195, id: 'exam_oct_etoos' },
            { name: '종로 학력평가', date: '2025년 10월 15일', count: 160, id: 'exam_oct_jongro' }
        ]
    },
    { month: '9월', exams: [{ name: '평가원 모의고사', date: '2025년 9월 04일', count: 450, id: 'exam_sep_eval' }] },
];

export default function StudentView({ studentName, phoneNumber, onLogout }: StudentViewProps) {
    const [activeMonthDropdown, setActiveMonthDropdown] = useState<string | null>(null);
    const [selectedExamId, setSelectedExamId] = useState<string>('exam_nov_duff');

    const currentResult = {
        title: '2025학년도 9월 모의평가',
        date: '2025.09.04',
        subjects: [
            { name: '언어와 매체', score: 84, grade: 2, maxScore: 100, average: 78.5, mistakeType: '문법 개념 혼동' },
            { name: '미적분', score: 92, grade: 1, maxScore: 100, average: 82.1, mistakeType: '계산 실수' },
            { name: '영어', score: 88, grade: 2, maxScore: 100, average: 75.3, mistakeType: '빈칸 추론' },
            { name: '물리학 I', score: 45, grade: 2, maxScore: 50, average: 38.2, mistakeType: '역학 개념' },
            { name: '지구과학 I', score: 42, grade: 3, maxScore: 50, average: 35.7, mistakeType: '자료 해석' },
        ]
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header / Navigation */}
            <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-gray-800">{studentName} 학생</span>
                            <span className="text-sm text-gray-500 border-l pl-3">{phoneNumber}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                            <LogOut size={16} />
                            목록으로
                        </button>
                    </div>

                    {/* Month List (Horizontal Scroll) */}
                    <div className="overflow-x-auto pb-3">
                        <div className="flex items-center gap-2 min-w-max">
                            {examsByMonth.map((group) => (
                                <button
                                    key={group.month}
                                    onClick={() => setActiveMonthDropdown(activeMonthDropdown === group.month ? null : group.month)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeMonthDropdown === group.month
                                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-100'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    {group.month}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Selected Month's Exam List (Panel) */}
                {activeMonthDropdown && (
                    <div className="bg-gray-50 border-t animate-in slide-in-from-top-2 duration-200">
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            <div className="flex flex-col gap-2 max-w-md">
                                <h3 className="text-xs font-bold text-gray-500 mb-1">{activeMonthDropdown} 시험 목록</h3>
                                {examsByMonth.find(g => g.month === activeMonthDropdown)?.exams.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 bg-white rounded-xl border border-dashed">
                                        시험 내역이 없습니다
                                    </div>
                                ) : (
                                    examsByMonth.find(g => g.month === activeMonthDropdown)?.exams.map((exam) => (
                                        <button
                                            key={exam.id}
                                            onClick={() => {
                                                setSelectedExamId(exam.id);
                                                setActiveMonthDropdown(null);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all hover:shadow-md ${selectedExamId === exam.id
                                                    ? 'bg-white border-blue-500 ring-1 ring-blue-500 shadow-sm'
                                                    : 'bg-white border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{exam.name}</span>
                                                <span className="text-xs text-gray-500 mt-0.5">{exam.date}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                                    성적 보기
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">총점</div>
                        <div className="text-2xl font-bold text-gray-900">
                            <SpoilerCell>
                                {currentResult.subjects.reduce((acc, curr) => acc + curr.score, 0)}
                                <span className="text-sm font-normal text-gray-400 ml-1">/ {currentResult.subjects.reduce((acc, curr) => acc + curr.maxScore, 0)}</span>
                            </SpoilerCell>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">전체 등급 평균</div>
                        <div className="text-2xl font-bold text-blue-600">
                            <SpoilerCell>
                                {(currentResult.subjects.reduce((acc, curr) => acc + curr.grade, 0) / currentResult.subjects.length).toFixed(1)}
                                <span className="text-sm font-normal text-gray-400 ml-1">등급</span>
                            </SpoilerCell>
                        </div>
                    </div>
                </div>

                {/* Subject Detail Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg">과목별 상세 성적</h3>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                                {currentResult.title}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-6 py-4">과목</th>
                                    <th className="px-6 py-4">원점수</th>
                                    <th className="px-6 py-4">등급</th>
                                    <th className="px-6 py-4">평균</th>
                                    <th className="px-6 py-4">주요 약점</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentResult.subjects.map((subject) => (
                                    <tr key={subject.name} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{subject.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="w-24">
                                                <SpoilerCell>
                                                    <span className="font-semibold">{subject.score}</span>
                                                    <span className="text-sm text-gray-400 ml-1">/ {subject.maxScore}</span>
                                                </SpoilerCell>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-16 h-8">
                                                <SpoilerCell className="flex items-center justify-center">
                                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${subject.grade === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                        subject.grade === 2 ? 'bg-gray-100 text-gray-700' :
                                                            'bg-orange-50 text-orange-700'
                                                        }`}>
                                                        {subject.grade}
                                                    </span>
                                                </SpoilerCell>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{subject.average}</td>
                                        <td className="px-6 py-4 text-red-500 font-medium">{subject.mistakeType}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

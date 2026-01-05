'use client';

import { useState, useEffect, useCallback } from 'react';
import { LogOut, Loader2, AlertCircle } from 'lucide-react';

const BACKEND_URL = '/api';

// Types matching backend /student/{id}/summary response
interface SubjectResult {
    subjectCode: string;
    subjectName: string;
    rawScore: number | null;
    standardScore: number | null;
    grade: number | null;
    percentile: number | null;
    correctCount: number | null;
    totalQuestions: number;
}

interface ExamInfo {
    providerName: string;
    examName: string;
    examCode: string;
    gradeLevel: string;
    examYear: number;
    examMonth: number;
    subjects: SubjectResult[];
}

interface MonthGroup {
    month: string;
    year: number;
    monthNum: number;
    exams: ExamInfo[];
}

// Flattened exam result for internal use
interface ExamResult {
    providerName: string;
    examName: string;
    examCode: string;
    gradeLevel: string;
    examYear: number;
    examMonth: number;
    subjectCode: string;
    subjectName: string;
    rawScore: number | null;
    standardScore: number | null;
    grade: number | null;
    percentile: number | null;
    correctCount: number | null;
    totalQuestions: number;
}

interface QuestionResponse {
    number: number;
    markedChoice: number | null;
    markedText: string | null;
    correctChoice: number | null;
    correctText: string | null;
    points: number | null;
    isCorrect: boolean | null;
    examCode: string;
    subjectCode: string;
    subjectName: string;
}

interface StudentViewProps {
    studentName: string;
    phoneNumber: string; // Actually studentExternalId
    onLogout: () => void;
}

const SpoilerCell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    const baseClass = "transition-all duration-300 cursor-pointer rounded-lg relative overflow-hidden";
    const revealClass = isRevealed ? "" : "bg-slate-200 hover:bg-slate-300";
    const opacityClass = isRevealed ? "opacity-100" : "opacity-0";

    return (
        <div
            onClick={() => setIsRevealed(!isRevealed)}
            className={`${baseClass} ${className} ${revealClass}`}
            title={isRevealed ? "클릭하여 가리기" : "클릭하여 점수 확인"}
        >
            <div className={`transition-opacity duration-300 ${opacityClass}`}>
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

export default function StudentView({ studentName, phoneNumber, onLogout }: StudentViewProps) {
    const studentExternalId = phoneNumber;

    const [exams, setExams] = useState<ExamResult[]>([]);
    const [responses, setResponses] = useState<QuestionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingResponses, setLoadingResponses] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedExam, setSelectedExam] = useState<ExamResult | null>(null);

    const examsByMonth = exams.reduce((acc, exam) => {
        const key = `${exam.examYear}년 ${exam.examMonth}월`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(exam);
        return acc;
    }, {} as Record<string, ExamResult[]>);

    const fetchStudentExams = useCallback(async () => {
        // Validate studentExternalId - must be non-empty string
        if (!studentExternalId || studentExternalId.trim() === '') {
            setError('학생 정보가 없습니다.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const url = `${BACKEND_URL}/exams/student/${encodeURIComponent(studentExternalId.trim())}/summary`;
            const response = await fetch(url);
            if (!response.ok) {
                setError(`HTTP ${response.status}`);
                setLoading(false);
                return;
            }
            const data = await response.json();
            if (data.status !== 'ok') {
                setError(data.message || '시험 결과를 불러오는데 실패했습니다.');
                setLoading(false);
                return;
            }
            
            // Flatten the months/exams/subjects structure to a list of ExamResult
            const flattenedExams: ExamResult[] = [];
            const months: MonthGroup[] = data.months || [];
            
            for (const monthGroup of months) {
                for (const exam of monthGroup.exams) {
                    for (const subject of exam.subjects) {
                        flattenedExams.push({
                            providerName: exam.providerName,
                            examName: exam.examName,
                            examCode: exam.examCode,
                            gradeLevel: exam.gradeLevel,
                            examYear: exam.examYear,
                            examMonth: exam.examMonth,
                            subjectCode: subject.subjectCode,
                            subjectName: subject.subjectName,
                            rawScore: subject.rawScore,
                            standardScore: subject.standardScore,
                            grade: subject.grade,
                            percentile: subject.percentile,
                            correctCount: subject.correctCount,
                            totalQuestions: subject.totalQuestions,
                        });
                    }
                }
            }
            
            setExams(flattenedExams);
            if (flattenedExams.length > 0) setSelectedExam(flattenedExams[0]);
        } catch (err) {
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [studentExternalId]);

    const fetchExamResponses = useCallback(async (exam: ExamResult) => {
        if (!studentExternalId || studentExternalId.trim() === '') return;
        setLoadingResponses(true);
        const params = new URLSearchParams({ exam_code: exam.examCode, subject_code: exam.subjectCode });
        const url = `${BACKEND_URL}/exams/student/${encodeURIComponent(studentExternalId.trim())}/responses?${params}`;
        const response = await fetch(url);
        if (!response.ok) {
            setResponses([]);
            setLoadingResponses(false);
            return;
        }
        const data = await response.json();
        setResponses(data.status === 'ok' ? data.responses || [] : []);
        setLoadingResponses(false);
    }, [studentExternalId]);

    useEffect(() => { fetchStudentExams(); }, [fetchStudentExams]);
    useEffect(() => { if (selectedExam) fetchExamResponses(selectedExam); }, [selectedExam, fetchExamResponses]);

    const totalScore = Number(selectedExam?.rawScore) || 0;
    const correctCount = Number(selectedExam?.correctCount) || 0;
    const totalQuestions = Number(selectedExam?.totalQuestions) || 0;

    if (loading) return (
        <div className="bg-white min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">시험 결과를 불러오는 중...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-white min-h-screen flex items-center justify-center">
            <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={fetchStudentExams} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">다시 시도</button>
            </div>
        </div>
    );

    const getSelectedMonthKey = () => {
        if (!selectedExam) return '';
        return `${selectedExam.examYear}년 ${selectedExam.examMonth}월`;
    };

    const getButtonClass = (month: string) => {
        const base = "px-4 py-2 rounded-full text-sm font-medium transition-all";
        if (getSelectedMonthKey() === month) {
            return `${base} bg-blue-600 text-white shadow-md`;
        }
        return `${base} bg-white text-gray-600 hover:bg-gray-100 border border-gray-200`;
    };

    const getRowClass = (isCorrect: boolean | null) => {
        const base = "hover:bg-gray-50";
        if (isCorrect === false) return `${base} bg-red-50`;
        return base;
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-gray-800">{studentName || '학생'}</span>
                            <span className="text-sm text-gray-500 border-l pl-3">{studentExternalId}</span>
                        </div>
                        <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1">
                            <LogOut size={16} /> 목록으로
                        </button>
                    </div>
                    <div className="overflow-x-auto pb-3">
                        <div className="flex items-center gap-2 min-w-max">
                            {Object.keys(examsByMonth).map((month) => (
                                <button key={month} onClick={() => setSelectedExam(examsByMonth[month][0])}
                                    className={getButtonClass(month)}>{month}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                {exams.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">시험 결과가 없습니다.</div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-xl border shadow-sm">
                                <div className="text-sm text-gray-500 mb-1">총점</div>
                                <SpoilerCell><span className="text-2xl font-bold">{totalScore.toFixed(1)}</span><span className="text-sm text-gray-400 ml-1">점</span></SpoilerCell>
                            </div>
                            <div className="bg-white p-5 rounded-xl border shadow-sm">
                                <div className="text-sm text-gray-500 mb-1">정답 수</div>
                                <SpoilerCell><span className="text-2xl font-bold text-blue-600">{correctCount}</span><span className="text-sm text-gray-400 ml-1">/ {totalQuestions}</span></SpoilerCell>
                            </div>
                            <div className="bg-white p-5 rounded-xl border shadow-sm">
                                <div className="text-sm text-gray-500 mb-1">오답 수</div>
                                <SpoilerCell><span className="text-2xl font-bold text-red-500">{totalQuestions - correctCount}</span><span className="text-sm text-gray-400 ml-1">문항</span></SpoilerCell>
                            </div>
                            <div className="bg-white p-5 rounded-xl border shadow-sm">
                                <div className="text-sm text-gray-500 mb-1">등급</div>
                                <SpoilerCell><span className="text-2xl font-bold">{selectedExam?.grade ?? '-'}</span><span className="text-sm text-gray-400 ml-1">등급</span></SpoilerCell>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="font-bold text-lg">문항별 채점 결과</h3>
                                {loadingResponses && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">문항</th>
                                            <th className="px-6 py-4">배점</th>
                                            <th className="px-6 py-4">내 답</th>
                                            <th className="px-6 py-4">정답</th>
                                            <th className="px-6 py-4">결과</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {responses.length > 0 ? responses.map((r) => (
                                            <tr key={r.number} className={getRowClass(r.isCorrect)}>
                                                <td className="px-6 py-4 font-medium">Q{r.number}</td>
                                                <td className="px-6 py-4 text-gray-600">{r.points?.toFixed(0) ?? '-'}점</td>
                                                <td className="px-6 py-4"><SpoilerCell className="inline-block px-2">{r.markedChoice ?? r.markedText ?? '-'}</SpoilerCell></td>
                                                <td className="px-6 py-4 text-gray-600">{r.correctChoice ?? r.correctText ?? '-'}</td>
                                                <td className="px-6 py-4">
                                                    {r.isCorrect === true ? <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold inline-flex items-center justify-center">○</span>
                                                    : r.isCorrect === false ? <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold inline-flex items-center justify-center">✕</span>
                                                    : <span className="text-gray-400">-</span>}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">{loadingResponses ? '응답 데이터를 불러오는 중...' : '응답 데이터가 없습니다.'}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

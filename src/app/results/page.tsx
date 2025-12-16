'use client';

import { useState } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { Download, ChevronDown, FileDown } from 'lucide-react';

export default function SNarOCRResults() {
  // 채점 결과 선택 상태
  const [selectedDate, setSelectedDate] = useState('2025년 9월 15일');
  const [selectedExam, setSelectedExam] = useState('2025년도 9월 모의고사');

  // 드롭다운 상태
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);

  // 채점 학생 수 (샘플 데이터)
  const gradedCount = 28;

  // 과목 선택 상태
  const [mainSubject, setMainSubject] = useState('국어');
  const [subSubject, setSubSubject] = useState('');

  // 표시할 과목명 결정 (하위 과목 선택 시 하위 과목명 표시)
  const getDisplaySubject = () => {
    if (subSubject) return subSubject;
    return mainSubject;
  };

  // 메인 과목 목록
  const mainSubjects = [
    { id: '국어', name: '국어' },
    { id: '수학', name: '수학' },
    { id: '영어', name: '영어' },
    { id: '사회탐구', name: '사회탐구' },
    { id: '과학탐구', name: '과학탐구' },
    { id: '한국사', name: '한국사' }
  ];

  // 하위 과목 (사탐, 과탐용)
  const subSubjects = {
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
      { id: '물리학I', name: '물리학I' },
      { id: '화학I', name: '화학I' },
      { id: '생명과학I', name: '생명과학I' },
      { id: '지구과학I', name: '지구과학I' },
      { id: '물리학II', name: '물리학II' },
      { id: '화학II', name: '화학II' },
      { id: '생명과학II', name: '생명과학II' },
      { id: '지구과학II', name: '지구과학II' }
    ]
  };

  // 과목별 총 문항 수 정의
  const totalQuestionsBySubject = {
    국어: 45,
    수학: 30,
    영어: 45,
    사회탐구: 20,
    과학탐구: 20,
    한국사: 20
  };

  // 전체 문항에 대한 오답률 데이터 생성
  const generateAllQuestionsData = () => {
    const totalQuestions = totalQuestionsBySubject[mainSubject as keyof typeof totalQuestionsBySubject];
    const allQuestions = [];

    for (let i = 1; i <= totalQuestions; i++) {
      const topQuestion = statsData.topWrongQuestions.find(q => q.question === i);
      const topStudentQuestion = statsData.topStudentsWrongQuestions.find(q => q.question === i);

      allQuestions.push({
        question: i,
        wrongCount: topQuestion?.wrongCount || 0,
        percentage: topQuestion?.percentage || 0,
        topStudentWrongCount: topStudentQuestion?.wrongCount || 0,
        topStudentPercentage: topStudentQuestion?.percentage || 0
      });
    }

    return allQuestions;
  };

  // CSV 다운로드 함수
  const downloadWrongAnswersCSV = () => {
    const allQuestions = generateAllQuestionsData();

    const csvContent = [
      '문항,오답수,전체인원,오답률(%),상위권오답수,상위권오답률(%)',
      ...allQuestions.map((item) => {
        return `${item.question},${item.wrongCount},${statsData.gradedCount},${item.percentage.toFixed(1)},${item.topStudentWrongCount},${item.topStudentPercentage.toFixed(1)}`;
      })
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `문항별_오답률_${mainSubject}${subSubject ? '_' + subSubject : ''}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 샘플 통계 데이터 (실제로는 API에서 가져올 데이터)
  const statsData = {
    gradedCount: 28,
    average: 78.5,
    standardDeviation: 12.3,
    highestScore: 95,
    lowestScore: 45,
    scoreDistribution: [
      { range: '90-100', count: 3, percentage: 10.7 },
      { range: '80-89', count: 8, percentage: 28.6 },
      { range: '70-79', count: 10, percentage: 35.7 },
      { range: '60-69', count: 5, percentage: 17.9 },
      { range: '50-59', count: 1, percentage: 3.6 },
      { range: '0-49', count: 1, percentage: 3.6 }
    ],
    topWrongQuestions: [
      { question: 15, wrongCount: 22, percentage: 78.6 },
      { question: 8, wrongCount: 20, percentage: 71.4 },
      { question: 12, wrongCount: 18, percentage: 64.3 },
      { question: 23, wrongCount: 17, percentage: 60.7 },
      { question: 30, wrongCount: 16, percentage: 57.1 },
      { question: 5, wrongCount: 15, percentage: 53.6 },
      { question: 18, wrongCount: 14, percentage: 50.0 },
      { question: 33, wrongCount: 13, percentage: 46.4 },
      { question: 11, wrongCount: 12, percentage: 42.9 },
      { question: 41, wrongCount: 11, percentage: 39.3 }
    ],
    topStudentsWrongQuestions: [
      { question: 15, wrongCount: 2, percentage: 66.7 },
      { question: 8, wrongCount: 2, percentage: 66.7 },
      { question: 23, wrongCount: 1, percentage: 33.3 },
      { question: 12, wrongCount: 1, percentage: 33.3 },
      { question: 30, wrongCount: 1, percentage: 33.3 }
    ]
  };

  return (
    <SNarOCRLayout currentPage="results">
      <section className="space-y-6">
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-xl font-semibold">채점 결과</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {/* 채점 날짜 선택 */}
              <div className="space-y-1">
                <label className="text-sm font-medium">채점 날짜</label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsDateDropdownOpen(!isDateDropdownOpen);
                      setIsExamDropdownOpen(false);
                    }}
                    className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
                  >
                    <span>{selectedDate}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDateDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-60 overflow-y-auto">
                      {['2025년 9월 15일', '2025년 9월 14일', '2025년 9월 13일', '2025년 9월 12일', '2025년 9월 11일'].map((date) => (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setIsDateDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-neutral-50 border-b last:border-b-0"
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 시험지 선택 */}
              <div className="space-y-1">
                <label className="text-sm font-medium">시험지</label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsExamDropdownOpen(!isExamDropdownOpen);
                      setIsDateDropdownOpen(false);
                    }}
                    className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
                  >
                    <span>{selectedExam}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExamDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isExamDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-60 overflow-y-auto">
                      {['2025년도 9월 모의고사', '2025년도 6월 모의고사', '2025년도 3월 학력평가', '2024년도 11월 모의고사', '2024년도 9월 모의고사'].map((exam) => (
                        <button
                          key={exam}
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsExamDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-neutral-50 border-b last:border-b-0"
                        >
                          {exam}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 채점 학생 수 */}
            <div className="mt-3">
              <div className="rounded-xl border bg-blue-50 p-3 flex items-center gap-2">
                <div className="text-sm font-medium text-blue-700">
                  총 {gradedCount}명 채점 완료
                </div>
              </div>
            </div>
          </div>


          {/* 개별 결과 파일 */}
          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">개별 결과 (CSV)</h3>
              <p className="text-sm text-neutral-600 mt-1">과목을 선택하여 채점 결과를 다운로드하세요</p>
            </div>
            <div className="p-6">
              {/* 과목 선택 */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">과목 선택</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {mainSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => {
                        setMainSubject(subject.id);
                        setSubSubject('');
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mainSubject === subject.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>

                {/* 하위 과목 선택 (사탐, 과탐일 때만 표시) */}
                {(mainSubject === '사회탐구' || mainSubject === '과학탐구') && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-600 mb-2">개별 과목 선택:</div>
                    <div className="flex flex-wrap gap-2">
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
                  </div>
                )}
              </div>

              {/* CSV 파일 미리보기 */}
              <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 mb-4">
                <div className="text-sm font-medium mb-2">파일 형식</div>
                <div className="text-xs font-mono bg-white p-3 rounded border border-gray-300 overflow-x-auto">
                  <div className="whitespace-pre text-gray-700">
                    {`수험번호,이름,소속반,과목코드,총점,만점,총문제수,정답수,오답번호
20231001,홍길동,1반,KOR,85,100,45,42,3,7,9
20231002,김철수,1반,KOR,92,100,45,46,7
20231003,이영희,2반,KOR,78,100,45,39,1,3,5,9
20231004,박민수,2반,KOR,95,100,45,47,2`}
                  </div>
                </div>
              </div>

              {/* 다운로드 버튼 */}
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-xl border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium text-sm flex items-center gap-1">
                  <Download size={14} />
                  CSV 다운로드
                </button>
              </div>
            </div>
          </div>

          {/* 반별 점수 분석 */}
          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">{getDisplaySubject()} 반별 점수 분석</h3>
              <p className="text-sm text-neutral-600 mt-1">반별 채점 통계 및 점수 분포를 확인하세요</p>
            </div>
            <div className="p-6">
              {/* 통계 카드 */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="rounded-xl bg-blue-50 p-4 border-2 border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{statsData.gradedCount}</div>
                  <div className="text-xs text-blue-700 font-medium">채점인원</div>
                </div>
                <div className="rounded-xl bg-green-50 p-4 border-2 border-green-200">
                  <div className="text-2xl font-bold text-green-600">{statsData.average}</div>
                  <div className="text-xs text-green-700 font-medium">평균</div>
                </div>
                <div className="rounded-xl bg-orange-50 p-4 border-2 border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{statsData.standardDeviation.toFixed(1)}</div>
                  <div className="text-xs text-orange-700 font-medium">표준편차</div>
                </div>
                <div className="rounded-xl bg-purple-50 p-4 border-2 border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{statsData.highestScore}</div>
                  <div className="text-xs text-purple-700 font-medium">최고점</div>
                </div>
                <div className="rounded-xl bg-red-50 p-4 border-2 border-red-200">
                  <div className="text-2xl font-bold text-red-600">{statsData.lowestScore}</div>
                  <div className="text-xs text-red-700 font-medium">최저점</div>
                </div>
              </div>

              {/* 점수 분포 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">점수 분포</h4>
                <div className="space-y-2">
                  {statsData.scoreDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-16 text-xs font-medium">{item.range}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                        <div
                          className="h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-end pr-2"
                          style={{ width: `${item.percentage}%` }}
                        >
                          <span className="text-xs font-medium text-white">{item.count}명</span>
                        </div>
                      </div>
                      <div className="w-16 text-xs text-gray-600 text-right">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 오답률 분석 */}
          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{getDisplaySubject()} 오답률 분석</h3>
                  <p className="text-sm text-neutral-600 mt-1">전체 학생과 상위권 학생의 오답률을 비교하세요</p>
                </div>
                <button
                  onClick={downloadWrongAnswersCSV}
                  className="px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium text-sm flex items-center gap-1 whitespace-nowrap"
                >
                  <FileDown size={14} />
                  <span className="hidden sm:inline">문항별 오답률 CSV 다운로드</span>
                  <span className="sm:hidden">오답률 CSV</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* 전체 오답률 상위 10개 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">전체 학생 오답률 상위 10개</h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">순위</th>
                        <th className="px-4 py-2 text-left">문항</th>
                        <th className="px-4 py-2 text-left">오답 수</th>
                        <th className="px-4 py-2 text-left">오답률</th>
                        <th className="px-4 py-2 text-left w-32">그래프</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.topWrongQuestions.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2 font-medium">{idx + 1}</td>
                          <td className="px-4 py-2">{item.question}번</td>
                          <td className="px-4 py-2">{item.wrongCount}명</td>
                          <td className="px-4 py-2">{item.percentage}%</td>
                          <td className="px-4 py-2">
                            <div className="bg-gray-100 rounded-full h-4 relative">
                              <div
                                className="h-4 rounded-full bg-red-500"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 상위권 오답률 상위 5개 */}
              <div>
                <h4 className="text-sm font-semibold mb-3">상위권(10% 이내) 오답률 상위 5개</h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">순위</th>
                        <th className="px-4 py-2 text-left">문항</th>
                        <th className="px-4 py-2 text-left">오답 수</th>
                        <th className="px-4 py-2 text-left">오답률</th>
                        <th className="px-4 py-2 text-left w-32">그래프</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.topStudentsWrongQuestions.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2 font-medium">{idx + 1}</td>
                          <td className="px-4 py-2">{item.question}번</td>
                          <td className="px-4 py-2">{item.wrongCount}명</td>
                          <td className="px-4 py-2">{item.percentage}%</td>
                          <td className="px-4 py-2">
                            <div className="bg-gray-100 rounded-full h-4 relative">
                              <div
                                className="h-4 rounded-full bg-orange-500"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </SNarOCRLayout>
  );
}

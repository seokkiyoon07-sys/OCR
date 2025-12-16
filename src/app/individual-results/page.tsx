'use client';

import { useState } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { Download, ChevronDown, Printer } from 'lucide-react';

export default function SNarOCRIndividualResults() {
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [isMoreExamsModalOpen, setIsMoreExamsModalOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState('국어'); // 메인 과목 선택
  const [activeSubSubject, setActiveSubSubject] = useState(''); // 하위 과목 선택 (과탐, 사탐용)
  
  // 채점 결과 선택 상태
  const [selectedDate, setSelectedDate] = useState('2025년 9월 15일');
  const [selectedExam, setSelectedExam] = useState('2025학년도 9월 모의고사');
  
  // 드롭다운 상태
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  
  // 채점 학생 수 (샘플 데이터)
  const gradedCount = 28;

  // 메인 과목 탭 (성적표의 실제 과목 기준)
  const mainSubjects = [
    { id: '한국사', name: '한국사', color: 'gray' },
    { id: '국어', name: '국어', color: 'blue' },
    { id: '수학', name: '수학', color: 'green' },
    { id: '영어', name: '영어', color: 'purple' },
    { id: '생활과윤리', name: '생활과윤리', color: 'orange' },
    { id: '사회문화', name: '사회문화', color: 'red' }
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
                      {['2025학년도 9월 모의고사', '2025학년도 6월 모의고사', '2025학년도 3월 학력평가', '2024학년도 11월 모의고사', '2024학년도 9월 모의고사'].map((exam) => (
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
          </div>

          {/* 학생 성적표 */}
          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-2xl font-bold text-center mb-6">학생 성적표</h2>
              
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
                        ? `bg-${subject.color}-600 text-white`
                        : `bg-${subject.color}-100 text-${subject.color}-700 hover:bg-${subject.color}-200`
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
                  <div className="rounded-xl bg-blue-50 p-4 border-2 border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">{currentData.totalScore}</div>
                    <div className="text-sm text-blue-700 font-medium">총점</div>
                  </div>
                  <div className="rounded-xl bg-red-50 p-4 border-2 border-red-200">
                    <div className="text-3xl font-bold text-red-600">{currentData.wrongCount}</div>
                    <div className="text-sm text-red-700 font-medium">오답</div>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 border-2 border-green-200">
                    <div className="text-3xl font-bold text-green-600">{currentData.totalQuestions - currentData.wrongCount}</div>
                    <div className="text-sm text-green-700 font-medium">정답</div>
                  </div>
                </div>

                {/* 틀린 문항 목록 */}
                <div className="rounded-xl border-2 border-gray-200 p-4 bg-gray-50">
                  <div className="text-sm text-gray-600 mb-2 font-medium">틀린 문항:</div>
                  <div className="text-base font-bold text-red-600">
                    {currentData.wrongQuestions.join(', ')}
                  </div>
                </div>

                {/* 문항별 결과 그리드 */}
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-medium mb-3">문항별 결과</div>
                  <div className="grid grid-cols-10 gap-2">
                    {Array.from({ length: currentData.totalQuestions }, (_, i) => i + 1).map((num) => (
                      <div
                        key={num}
                        className={`p-2 text-center text-sm font-semibold rounded-lg border ${
                          currentData.wrongQuestions.includes(num)
                            ? 'bg-red-50 border-red-300 text-red-600'
                            : 'bg-green-50 border-green-300 text-green-600'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 상세 오답 정보 */}
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-medium mb-3">오답 상세 정보</div>
                  <div className="space-y-2">
                    {currentData.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className="font-medium text-red-600 w-8">{detail.question}번</span>
                        <span className="text-gray-600 w-20">{detail.type}</span>
                        <span className="text-gray-500">{detail.detail}</span>
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
                          exam.score >= 90 ? 'text-green-600' : 
                          exam.score >= 80 ? 'text-blue-600' : 
                          exam.score >= 70 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {exam.score}점
                        </div>
                        <div className="text-xs text-neutral-500">
                          {exam.score}/{exam.total}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        exam.subject === '국어' ? 'bg-blue-100 text-blue-800' :
                        exam.subject === '수학' ? 'bg-green-100 text-green-800' :
                        exam.subject === '영어' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.subject}
                      </span>
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            exam.score >= 90 ? 'bg-green-500' : 
                            exam.score >= 80 ? 'bg-blue-500' : 
                            exam.score >= 70 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${exam.score}%` }}
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
                          exam.score >= 90 ? 'text-green-600' : 
                          exam.score >= 80 ? 'text-blue-600' : 
                          exam.score >= 70 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {exam.score}점
                        </div>
                        <div className="text-xs text-neutral-500">
                          {exam.score}/{exam.total}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        exam.subject === '국어' ? 'bg-blue-100 text-blue-800' :
                        exam.subject === '수학' ? 'bg-green-100 text-green-800' :
                        exam.subject === '영어' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.subject}
                      </span>
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            exam.score >= 90 ? 'bg-green-500' : 
                            exam.score >= 80 ? 'bg-blue-500' : 
                            exam.score >= 70 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${exam.score}%` }}
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

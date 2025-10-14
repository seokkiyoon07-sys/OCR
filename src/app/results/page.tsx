'use client';

import { useState } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { Download } from 'lucide-react';

export default function SNarOCRResults() {
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [isMoreExamsModalOpen, setIsMoreExamsModalOpen] = useState(false);

  // 샘플 데이터
  const wrongQuestions = [3, 7, 12, 15, 18];
  const totalScore = 85;
  const wrongCount = 15;

  return (
    <SNarOCRLayout currentPage="results">
      <section className="space-y-6">
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-xl font-semibold">채점 결과</h2>
            <p className="text-sm text-neutral-600">총점과 문항별 정오표를 확인하세요</p>
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

          <div className="grid gap-6 lg:grid-cols-4">
            {/* 요약 섹션 */}
            <div className="lg:col-span-1 rounded-2xl border bg-white">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">요약</h3>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-blue-50 p-4 border-2 border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">{totalScore}</div>
                    <div className="text-sm text-blue-700 font-medium">총점</div>
                  </div>
                  <div className="rounded-xl bg-red-50 p-4 border-2 border-red-200">
                    <div className="text-3xl font-bold text-red-600">{wrongCount}</div>
                    <div className="text-sm text-red-700 font-medium">오답</div>
                  </div>
                </div>
                <div className="rounded-xl border-2 border-gray-200 p-4 bg-gray-50">
                  <div className="text-sm text-gray-600 mb-2 font-medium">틀린 문항:</div>
                  <div className="text-base font-bold text-red-600">
                    {wrongQuestions.join(', ')}
                  </div>
                </div>
                <div className="rounded-xl border p-3 text-xs text-neutral-600">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>문법</span>
                      <span className="text-red-600">3문항</span>
                    </div>
                    <div className="flex justify-between">
                      <span>독해</span>
                      <span className="text-red-600">2문항</span>
                    </div>
                    <div className="flex justify-between">
                      <span>미적분</span>
                      <span className="text-red-600">4문항</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium text-sm flex items-center gap-1">
                    <Download size={14} />
                    PDF
                  </button>
                  <button className="px-4 py-2 rounded-xl border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium text-sm flex items-center gap-1">
                    <Download size={14} />
                    CSV
                  </button>
                </div>
              </div>
            </div>

            {/* 문항별 결과 */}
            <div className="lg:col-span-3 rounded-2xl border bg-white">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">문항별 결과</h3>
              </div>
              <div className="p-6">
                {/* 문항 그리드 */}
                <div className="grid grid-cols-10 gap-2 mb-4">
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                    <div
                      key={num}
                      className={`p-2 text-center text-sm font-semibold rounded-lg border ${
                        wrongQuestions.includes(num)
                          ? 'bg-red-50 border-red-300 text-red-600'
                          : 'bg-green-50 border-green-300 text-green-600'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border p-4">
                  <div className="mb-2 text-sm font-medium">오답 하이라이트 (미리보기)</div>
                  <div className="grid h-40 place-items-center rounded-xl bg-neutral-100 text-xs text-neutral-500">
                    스캔 이미지에서 오답 영역 박스 오버레이 (와이어프레임)
                  </div>
                </div>
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

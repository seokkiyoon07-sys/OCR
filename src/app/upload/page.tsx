'use client';

import { useState } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { Upload, ChevronDown } from 'lucide-react';
import { useSNarOCRNavigation } from '@/hooks/useSNarOCRNavigation';
import { validateInput, validateFile, sanitizeInput } from '@/lib/security';
import { safeExecute, validateRequired, validateRange } from '@/lib/error-handling';

export default function SNarOCRUpload() {
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [isFindAnswerModalOpen, setIsFindAnswerModalOpen] = useState(false);
  const [isGradingRangeModalOpen, setIsGradingRangeModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('과목을 선택하세요');
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [answerModalTab, setAnswerModalTab] = useState<'answers' | 'scores'>('answers');
  const [selectedExam, setSelectedExam] = useState('시험을 선택하세요');
  const [customQuestionCount, setCustomQuestionCount] = useState('');
  const [customMultipleChoice, setCustomMultipleChoice] = useState('');
  const [customSubjective, setCustomSubjective] = useState('');

  // 시험 정보 입력 필드
  const [examYear, setExamYear] = useState('');
  const [examMonth, setExamMonth] = useState('');
  const [examOrganization, setExamOrganization] = useState('출제기관 선택');
  const [examOrganizationCustom, setExamOrganizationCustom] = useState('');
  const [examGrade, setExamGrade] = useState('');

  // 정답 입력 상태 (5문항씩 묶어서 관리)
  const [answers, setAnswers] = useState<string[]>([]);
  // 배점 입력 상태
  const [scores, setScores] = useState<string[]>([]);

  // 드롭다운 상태
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const { navigateTo } = useSNarOCRNavigation();

  // 파일 업로드 핸들러
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    const result = await safeExecute(async () => {
      // 파일 검증
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // 파일명 정리
      const sanitizedName = sanitizeInput(file.name);
      
      console.log('파일 업로드:', sanitizedName);
      
      // 실제 업로드 로직은 여기에 구현
      // await uploadFile(file);
      
      return { fileName: sanitizedName, fileSize: file.size };
    });

    setIsUploading(false);
    
    if (result.error) {
      setUploadError(result.error);
    } else {
      setUploadError('');
    }
  };

  const isCustomSubject = selectedSubject === '기타';
  const isCustomOrganization = examOrganization === '기타';

  // 과목별 문항 수 가져오기
  const getQuestionCount = () => {
    if (selectedSubject === '국어') return 45;
    if (selectedSubject === '수학') return 30;
    if (selectedSubject === '영어') return 45;
    if (selectedSubject === '탐구') return 20;
    if (selectedSubject === '기타') return parseInt(customQuestionCount) || 0;
    return 0;
  };

  const handleAnswerInput = (index: number, value: string, maxLength: number, inputRef?: HTMLInputElement) => {
    // 입력값 검증
    if (!validateInput(value, 'text')) {
      setUploadError('올바르지 않은 입력값입니다.');
      return;
    }

    const sanitizedValue = sanitizeInput(value);
    const newAnswers = [...answers];
    newAnswers[index] = sanitizedValue;
    setAnswers(newAnswers);

    // 입력이 최대 길이에 도달하면 다음 입력 필드로 자동 이동
    if (sanitizedValue.length === maxLength && inputRef) {
      // 다음 입력 필드를 찾기 위해 setTimeout 사용 (상태 업데이트 후 DOM 반영)
      setTimeout(() => {
        const form = inputRef.form;
        if (form) {
          const inputs = Array.from(form.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
          const currentIndex = inputs.indexOf(inputRef);
          if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
          }
        }
      }, 0);
    }
  };

  // 배점 입력 핸들러
  const handleScoreInput = (index: number, value: string, inputRef?: HTMLInputElement) => {
    // 숫자만 허용 (소수점 포함)
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // 소수점이 여러 개인 경우 처리
    const parts = numericValue.split('.');
    const sanitizedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : numericValue;

    const newScores = [...scores];
    newScores[index] = sanitizedValue;
    setScores(newScores);

    // 입력이 완료되면 다음 입력 필드로 자동 이동
    if (sanitizedValue && inputRef) {
      setTimeout(() => {
        const form = inputRef.form;
        if (form) {
          const inputs = Array.from(form.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
          const currentIndex = inputs.indexOf(inputRef);
          if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
          }
        }
      }, 0);
    }
  };

  const handleAnswerSave = () => {
    if (answerModalTab === 'answers') {
      // 정답 입력 완료 후 배점 입력 탭으로 이동
      setAnswerModalTab('scores');
    } else {
      // 배점 입력 완료 후 저장
      console.log('정답 및 배점 저장:', { answers, scores });
      setIsAnswerModalOpen(false);
      setAnswerModalTab('answers'); // 다음 사용을 위해 초기화
    }
  };

  const handleExamSave = () => {
    // 시험 정보 저장 로직
    const examInfo = [];
    if (examYear) examInfo.push(examYear);
    if (examMonth) examInfo.push(examMonth);

    const org = isCustomOrganization ? examOrganizationCustom : examOrganization;
    if (org && org !== '출제기관 선택') examInfo.push(org);

    if (examGrade) examInfo.push(examGrade);

    setSelectedExam(examInfo.length > 0 ? examInfo.join(' ') : '시험을 선택하세요');
    setIsExamModalOpen(false);
  };

  return (
    <SNarOCRLayout currentPage="upload">
      <section className="space-y-6">
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-xl font-semibold">채점 업로드</h2>
            <p className="text-sm text-neutral-600">이미지(JPG/PNG) 또는 PDF를 업로드하세요</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-2xl border bg-white">
              <div className="p-6 space-y-4">
                <div className="rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: '#f0f0f0' }}>
                  <Upload className="mx-auto mb-2 text-gray-300" size={40} />
                  <div className="mt-2 text-sm text-neutral-600">이미지나 PDF를 업로드 해주세요</div>
                  <div className="text-xs text-neutral-500 mt-1">파일을 여기로 끌어다 놓거나 클릭해서 선택</div>
                  <div className="mt-4">
                    <button className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800">파일 선택</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {/* 시험 선택 */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium">시험 선택</label>
                      <button
                        onClick={() => setIsExamModalOpen(true)}
                        className="w-full rounded-xl border px-3 py-2 text-sm text-left hover:bg-neutral-50"
                      >
                        {selectedExam}
                      </button>
                    </div>

                    {/* 과목 선택 */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium">과목 선택</label>
                      <div className="relative">
                        <button
                          onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                          className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
                        >
                          <span>{selectedSubject}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu - 과목별 분류 */}
                        {isSubjectDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-80 overflow-y-auto">
                            <button
                              onClick={() => {
                                setSelectedSubject('국어');
                                setIsSubjectDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                            >
                              <div className="font-medium text-sm">국어</div>
                              <div className="text-xs text-neutral-500 mt-0.5">45문항 (선택형 + 서답형)</div>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubject('수학');
                                setIsSubjectDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                            >
                              <div className="font-medium text-sm">수학</div>
                              <div className="text-xs text-neutral-500 mt-0.5">30문항 (22 + 단답형 8)</div>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubject('영어');
                                setIsSubjectDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                            >
                              <div className="font-medium text-sm">영어</div>
                              <div className="text-xs text-neutral-500 mt-0.5">45문항</div>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubject('탐구');
                                setIsSubjectDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                            >
                              <div className="font-medium text-sm">탐구</div>
                              <div className="text-xs text-neutral-500 mt-0.5">20문항 (과학탐구, 사회탐구, 한국사)</div>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubject('기타');
                                setIsSubjectDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-neutral-50"
                            >
                              <div className="font-medium text-sm">기타</div>
                              <div className="text-xs text-neutral-500 mt-0.5">직접 문항 수 입력</div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 기타 선택 시 문항 수 입력 필드 추가 - 과목 선택 바로 아래로 이동 */}
                  {isCustomSubject && (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">총 문항 수</label>
                          <input
                            type="number"
                            value={customQuestionCount}
                            onChange={(e) => {
                              const total = parseInt(e.target.value) || 0;
                              setCustomQuestionCount(e.target.value);
                              // 총 문항 수가 변경되면 객관식+주관식이 총합을 초과하지 않도록 체크
                              const mc = parseInt(customMultipleChoice) || 0;
                              const subj = parseInt(customSubjective) || 0;
                              if (mc + subj > total) {
                                setCustomMultipleChoice('');
                                setCustomSubjective('');
                              }
                            }}
                            className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="예: 50"
                            min="1"
                            max="100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">객관식 문항</label>
                          <input
                            type="number"
                            value={customMultipleChoice}
                            onChange={(e) => {
                              const mc = parseInt(e.target.value) || 0;
                              const total = parseInt(customQuestionCount) || 0;
                              if (mc <= total) {
                                setCustomMultipleChoice(e.target.value);
                                // 주관식 자동 계산
                                const remaining = total - mc;
                                if (remaining >= 0) {
                                  setCustomSubjective(remaining.toString());
                                }
                              }
                            }}
                            className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="예: 30"
                            min="0"
                            max={customQuestionCount || 100}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">주관식 문항</label>
                          <input
                            type="number"
                            value={customSubjective}
                            onChange={(e) => {
                              const subj = parseInt(e.target.value) || 0;
                              const total = parseInt(customQuestionCount) || 0;
                              if (subj <= total) {
                                setCustomSubjective(e.target.value);
                                // 객관식 자동 계산
                                const remaining = total - subj;
                                if (remaining >= 0) {
                                  setCustomMultipleChoice(remaining.toString());
                                }
                              }
                            }}
                            className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="예: 20"
                            min="0"
                            max={customQuestionCount || 100}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500">
                        * 객관식 또는 주관식 문항 수를 입력하면 나머지가 자동으로 계산됩니다
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">정답지</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsAnswerModalOpen(true);
                            setAnswerModalTab('answers'); // 탭 초기화
                          }}
                          className="px-3 py-2 rounded-xl border text-sm hover:bg-neutral-50"
                        >
                          정답 입력
                        </button>
                        <button 
                          onClick={() => setIsFindAnswerModalOpen(true)}
                          className="px-3 py-2 rounded-xl border text-sm hover:bg-neutral-50"
                        >
                          기존 입력된 정답 찾기
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">메모 (선택)</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="응시자 이름, 반, 비고 등"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 rounded-xl border hover:bg-neutral-50">샘플 파일 사용</button>
                  <button 
                    onClick={() => setIsGradingRangeModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"
                  >
                    채점 구간 설정
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">가이드</h3>
              </div>
              <div className="p-6 space-y-3 text-sm text-neutral-600">
                <p>• 곡률 없이 평평하게, 빛 반사 없이, 테두리가 선명하게 촬영해 주세요.</p>
                <p>• PDF는 300dpi 이상 권장, 다중 페이지 지원.</p>
                <p>• 객관식/서술형 혼합 시 서술형은 별도 검토 단계가 열립니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 시험 선택 모달 */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">시험 정보 입력</h3>
              <p className="text-sm text-neutral-600 mt-1">시험 정보를 입력하세요 (선택사항)</p>
            </div>

            <div className="p-6 space-y-4">
              {/* 시행년도 + 시행월 */}
              <div className="grid grid-cols-2 gap-3">
                {/* 시행년도 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">시행년도 (선택)</label>
                  <div className="relative">
                    <button
                      onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                      className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
                    >
                      <span>{examYear || '년도 선택'}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isYearDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-60 overflow-y-auto">
                        {['2025', '2024', '2023', '2022', '2021', '2020'].map((year) => (
                          <button
                            key={year}
                            onClick={() => {
                              setExamYear(year + '학년도');
                              setIsYearDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-neutral-50 border-b last:border-b-0"
                          >
                            {year}학년도
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 시행월 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">시행월 (선택)</label>
                  <div className="relative">
                    <button
                      onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                      className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
                    >
                      <span>{examMonth || '월 선택'}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMonthDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-60 overflow-y-auto">
                        {['3월', '6월', '9월', '11월'].map((month) => (
                          <button
                            key={month}
                            onClick={() => {
                              setExamMonth(month);
                              setIsMonthDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-neutral-50 border-b last:border-b-0"
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 출제기관 */}
              <div className="space-y-1">
                <label className="text-sm font-medium">출제기관 (선택)</label>
                <div className="relative">
                  <button
                    onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                    className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
                  >
                    <span>{examOrganization}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOrgDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg">
                      <button
                        onClick={() => {
                          setExamOrganization('한국교육과정평가원');
                          setIsOrgDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                      >
                        평가원 (한국교육과정평가원)
                      </button>
                      <button
                        onClick={() => {
                          setExamOrganization('교육청');
                          setIsOrgDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                      >
                        교육청
                      </button>
                      <button
                        onClick={() => {
                          setExamOrganization('기타');
                          setIsOrgDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50"
                      >
                        기타 (직접 입력)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 기타 출제기관 입력 */}
              {isCustomOrganization && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">출제기관 입력</label>
                  <input
                    type="text"
                    value={examOrganizationCustom}
                    onChange={(e) => setExamOrganizationCustom(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="출제기관 이름을 입력하세요"
                  />
                </div>
              )}

              {/* 학년 */}
              <div className="space-y-1">
                <label className="text-sm font-medium">학년 (선택)</label>
                <input
                  type="text"
                  value={examGrade}
                  onChange={(e) => setExamGrade(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 고3"
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
              >
                취소
              </button>
              <button
                onClick={handleExamSave}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정답 입력 모달 */}
      {isAnswerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">정답 및 배점 입력</h3>
              <p className="text-sm text-neutral-600 mt-1">
                {selectedSubject === '과목을 선택하세요'
                  ? '과목을 먼저 선택해주세요'
                  : `${selectedSubject} - ${getQuestionCount()}문항`}
              </p>
              
              {/* 탭 네비게이션 */}
              <div className="flex mt-4 bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setAnswerModalTab('answers')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    answerModalTab === 'answers'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  1단계: 정답 입력
                </button>
                <button
                  onClick={() => setAnswerModalTab('scores')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    answerModalTab === 'scores'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  2단계: 배점 입력
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {selectedSubject === '과목을 선택하세요' ? (
                <div className="text-center py-8 text-neutral-500">
                  과목을 먼저 선택해주세요
                </div>
              ) : answerModalTab === 'answers' ? (
                // 1단계: 정답 입력
                <div className="space-y-4">
                  <div className="text-center py-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">1단계: 정답을 입력해주세요</p>
                    <p className="text-xs text-blue-600 mt-1">객관식은 1-5번, 주관식은 답안을 입력하세요</p>
                  </div>
                  
                  {selectedSubject === '수학' ? (
                // 수학: 공통 객관식(1-15) + 공통 주관식(16-22) + 선택 객관식(23-28) + 선택 주관식(29-30)
                <>
                  {/* 공통 객관식 1-15번 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">공통 객관식 (1-15번)</h4>
                    {[0, 1, 2].map((groupIndex) => (
                      <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
                        <div className="text-sm text-neutral-600">
                          {groupIndex * 5 + 1}-{groupIndex * 5 + 5}번
                        </div>
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={answers[groupIndex] || ''}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              // 5글자 제한
                              if (value.length <= 5) {
                                handleAnswerInput(groupIndex, value, 5, e.target);
                              }
                            }}
                            className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            placeholder="예: 51234"
                            maxLength={5}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 공통 주관식 16-22번 */}
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">공통 주관식 (16-22번)</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {[0, 1, 2, 3, 4, 5, 6].map((subIndex) => (
                        <div key={subIndex} className="space-y-1">
                          <label className="text-xs text-neutral-600">{16 + subIndex}번</label>
                          <input
                            type="text"
                            value={answers[3 + subIndex] || ''}
                            onChange={(e) => handleAnswerInput(3 + subIndex, e.target.value, 10, e.target)}
                            className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="답"
                            maxLength={10}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 선택 객관식 23-28번 */}
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">선택 객관식 (23-28번)</h4>
                    <div className="grid grid-cols-6 gap-2 items-center">
                      <div className="text-sm text-neutral-600">23-28번</div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={answers[10] || ''}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            // 6글자 제한
                            if (value.length <= 6) {
                              handleAnswerInput(10, value, 6, e.target);
                            }
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                          placeholder="예: 512345"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 선택 주관식 29-30번 */}
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">선택 주관식 (29-30번)</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {[0, 1].map((subIndex) => (
                        <div key={subIndex} className="space-y-1">
                          <label className="text-xs text-neutral-600">{29 + subIndex}번</label>
                          <input
                            type="text"
                            value={answers[11 + subIndex] || ''}
                            onChange={(e) => handleAnswerInput(11 + subIndex, e.target.value, 10, e.target)}
                            className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="답"
                            maxLength={10}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : selectedSubject === '기타' ? (
                // 기타: 객관식 + 주관식 혼합
                <>
                  {/* 객관식 */}
                  {parseInt(customMultipleChoice) > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">객관식 (1-{customMultipleChoice}번)</h4>
                      {Array.from({ length: Math.ceil(parseInt(customMultipleChoice) / 5) }, (_, groupIndex) => {
                        const startNum = groupIndex * 5 + 1;
                        const endNum = Math.min(startNum + 4, parseInt(customMultipleChoice));
                        const questionCount = endNum - startNum + 1;

                        return (
                          <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
                            <div className="text-sm text-neutral-600">
                              {startNum}-{endNum}번
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={answers[groupIndex] || ''}
                                onChange={(e) => {
                                  const value = e.target.value.toUpperCase();
                                  // 문항 수 제한
                                  if (value.length <= questionCount) {
                                    handleAnswerInput(groupIndex, value, questionCount, e.target);
                                  }
                                }}
                                className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                placeholder={`예: ${'12345'.substring(0, questionCount)}`}
                                maxLength={questionCount}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 주관식 */}
                  {parseInt(customSubjective) > 0 && (
                    <div className={`space-y-3 ${parseInt(customMultipleChoice) > 0 ? 'border-t pt-4' : ''}`}>
                      <h4 className="font-medium text-sm">
                        주관식 ({parseInt(customMultipleChoice) + 1}-{getQuestionCount()}번)
                      </h4>
                      <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: parseInt(customSubjective) }, (_, subIndex) => {
                          const questionNum = parseInt(customMultipleChoice) + subIndex + 1;
                          const answerIndex = Math.ceil(parseInt(customMultipleChoice) / 5) + subIndex;

                          return (
                            <div key={subIndex} className="space-y-1">
                              <label className="text-xs text-neutral-600">{questionNum}번</label>
                              <input
                                type="text"
                                value={answers[answerIndex] || ''}
                                onChange={(e) => handleAnswerInput(answerIndex, e.target.value, 10, e.target)}
                                className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="답"
                                maxLength={10}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 문항 수 미설정 시 안내 */}
                  {!customQuestionCount && (
                    <div className="text-center py-8 text-neutral-500">
                      총 문항 수를 먼저 입력해주세요
                    </div>
                  )}
                </>
              ) : (
                // 국어/영어/탐구: 객관식만
                <div className="space-y-3">
                  {Array.from({ length: Math.ceil(getQuestionCount() / 5) }, (_, groupIndex) => {
                    const startNum = groupIndex * 5 + 1;
                    const endNum = Math.min(startNum + 4, getQuestionCount());
                    const questionCount = endNum - startNum + 1;

                    return (
                      <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
                        <div className="text-sm text-neutral-600">
                          {startNum}-{endNum}번
                        </div>
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={answers[groupIndex] || ''}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              // 문항 수 제한
                              if (value.length <= questionCount) {
                                handleAnswerInput(groupIndex, value, questionCount, e.target);
                              }
                            }}
                            className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            placeholder={`예: ${'12345'.substring(0, questionCount)}`}
                            maxLength={questionCount}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
                </div>
              ) : (
                // 2단계: 배점 입력
                <div className="space-y-4">
                  <div className="text-center py-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">2단계: 배점을 입력해주세요</p>
                    <p className="text-xs text-green-600 mt-1">각 문항별 배점을 입력하세요 (예: 2.0, 3.5)</p>
                  </div>
                  
                  {selectedSubject === '수학' ? (
                    // 수학 배점 입력
                    <>
                      {/* 공통 객관식 배점 */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">공통 객관식 배점 (1-15번)</h4>
                        {[0, 1, 2].map((groupIndex) => (
                          <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
                            <div className="text-sm text-neutral-600">
                              {groupIndex * 5 + 1}-{groupIndex * 5 + 5}번
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={scores[groupIndex] || ''}
                                onChange={(e) => handleScoreInput(groupIndex, e.target.value, e.target)}
                                className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="예: 2.0"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 공통 주관식 배점 */}
                      <div className="border-t pt-4 space-y-3">
                        <h4 className="font-medium text-sm">공통 주관식 배점 (16-22번)</h4>
                        <div className="grid grid-cols-4 gap-3">
                          {[0, 1, 2, 3, 4, 5, 6].map((subIndex) => (
                            <div key={subIndex} className="space-y-1">
                              <label className="text-xs text-neutral-600">{16 + subIndex}번</label>
                              <input
                                type="text"
                                value={scores[3 + subIndex] || ''}
                                onChange={(e) => handleScoreInput(3 + subIndex, e.target.value, e.target)}
                                className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="배점"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 선택 객관식 배점 */}
                      <div className="border-t pt-4 space-y-3">
                        <h4 className="font-medium text-sm">선택 객관식 배점 (23-28번)</h4>
                        <div className="grid grid-cols-6 gap-2 items-center">
                          <div className="text-sm text-neutral-600">23-28번</div>
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={scores[10] || ''}
                              onChange={(e) => handleScoreInput(10, e.target.value, e.target)}
                              className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="예: 2.0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 선택 주관식 배점 */}
                      <div className="border-t pt-4 space-y-3">
                        <h4 className="font-medium text-sm">선택 주관식 배점 (29-30번)</h4>
                        <div className="grid grid-cols-4 gap-3">
                          {[0, 1].map((subIndex) => (
                            <div key={subIndex} className="space-y-1">
                              <label className="text-xs text-neutral-600">{29 + subIndex}번</label>
                              <input
                                type="text"
                                value={scores[11 + subIndex] || ''}
                                onChange={(e) => handleScoreInput(11 + subIndex, e.target.value, e.target)}
                                className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="배점"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : selectedSubject === '기타' ? (
                    // 기타 배점 입력
                    <>
                      {/* 객관식 배점 */}
                      {parseInt(customMultipleChoice) > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">객관식 배점 (1-{customMultipleChoice}번)</h4>
                          {Array.from({ length: Math.ceil(parseInt(customMultipleChoice) / 5) }, (_, groupIndex) => {
                            const startNum = groupIndex * 5 + 1;
                            const endNum = Math.min(startNum + 4, parseInt(customMultipleChoice));

                            return (
                              <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
                                <div className="text-sm text-neutral-600">
                                  {startNum}-{endNum}번
                                </div>
                                <div className="col-span-5">
                                  <input
                                    type="text"
                                    value={scores[groupIndex] || ''}
                                    onChange={(e) => handleScoreInput(groupIndex, e.target.value, e.target)}
                                    className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="예: 2.0"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 주관식 배점 */}
                      {parseInt(customSubjective) > 0 && (
                        <div className={`space-y-3 ${parseInt(customMultipleChoice) > 0 ? 'border-t pt-4' : ''}`}>
                          <h4 className="font-medium text-sm">
                            주관식 배점 ({parseInt(customMultipleChoice) + 1}-{getQuestionCount()}번)
                          </h4>
                          <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: parseInt(customSubjective) }, (_, subIndex) => {
                              const questionNum = parseInt(customMultipleChoice) + subIndex + 1;
                              const answerIndex = Math.ceil(parseInt(customMultipleChoice) / 5) + subIndex;

                              return (
                                <div key={subIndex} className="space-y-1">
                                  <label className="text-xs text-neutral-600">{questionNum}번</label>
                                  <input
                                    type="text"
                                    value={scores[answerIndex] || ''}
                                    onChange={(e) => handleScoreInput(answerIndex, e.target.value, e.target)}
                                    className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="배점"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // 국어/영어/탐구 배점 입력
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">객관식 배점 (1-{getQuestionCount()}번)</h4>
                      {Array.from({ length: Math.ceil(getQuestionCount() / 5) }, (_, groupIndex) => {
                        const startNum = groupIndex * 5 + 1;
                        const endNum = Math.min(startNum + 4, getQuestionCount());

                        return (
                          <div key={groupIndex} className="grid grid-cols-6 gap-2 items-center">
                            <div className="text-sm text-neutral-600">
                              {startNum}-{endNum}번
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={scores[groupIndex] || ''}
                                onChange={(e) => handleScoreInput(groupIndex, e.target.value, e.target)}
                                className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="예: 2.0"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsAnswerModalOpen(false)}
                className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
              >
                취소
              </button>
              <button
                onClick={handleAnswerSave}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"
              >
                {answerModalTab === 'answers' ? '다음: 배점 입력' : '저장 완료'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기존 정답 찾기 모달 */}
      {isFindAnswerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">기존 입력된 정답 찾기</h3>
              <p className="text-sm text-neutral-600 mt-1">시험지명과 과목으로 정답을 찾아보세요</p>
            </div>

            <div className="p-6 space-y-4">
              {/* 시험지명 검색 */}
              <div className="space-y-1">
                <label className="text-sm font-medium">시험지명</label>
                <input
                  type="text"
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 2025학년도 9월 모의고사"
                />
              </div>

              {/* 과목 선택 */}
              <div className="space-y-1">
                <label className="text-sm font-medium">과목</label>
                <div className="relative">
                  <button
                    onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                    className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"
                  >
                    <span>{selectedSubject}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu - 과목별 분류 */}
                  {isSubjectDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-80 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedSubject('국어');
                          setIsSubjectDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                      >
                        <div className="font-medium text-sm">국어</div>
                        <div className="text-xs text-neutral-500 mt-0.5">45문항 (선택형 + 서답형)</div>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubject('수학');
                          setIsSubjectDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                      >
                        <div className="font-medium text-sm">수학</div>
                        <div className="text-xs text-neutral-500 mt-0.5">30문항 (22 + 단답형 8)</div>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubject('영어');
                          setIsSubjectDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
                      >
                        <div className="font-medium text-sm">영어</div>
                        <div className="text-xs text-neutral-500 mt-0.5">45문항</div>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubject('탐구');
                          setIsSubjectDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50"
                      >
                        <div className="font-medium text-sm">탐구</div>
                        <div className="text-xs text-neutral-500 mt-0.5">20문항 (과학탐구, 사회탐구, 한국사)</div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 검색 결과 */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">검색 결과</h4>
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                    <div className="font-medium text-sm">2025학년도 9월 모의고사 - 국어</div>
                    <div className="text-xs text-neutral-500">45문항 • 2025-09-15</div>
                  </div>
                  <div className="p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                    <div className="font-medium text-sm">2025학년도 6월 모의고사 - 국어</div>
                    <div className="text-xs text-neutral-500">45문항 • 2025-06-15</div>
                  </div>
                  <div className="p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                    <div className="font-medium text-sm">2025학년도 3월 학력평가 - 국어</div>
                    <div className="text-xs text-neutral-500">45문항 • 2025-03-15</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsFindAnswerModalOpen(false)}
                className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 정답 불러오기 로직
                  setIsFindAnswerModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"
              >
                정답 불러오기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 채점 구간 설정 모달 */}
      {isGradingRangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl shadow-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* 페이지 정보 헤더 */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">채점 구간 설정</h3>
                <button 
                  onClick={() => setIsGradingRangeModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 flex items-center gap-4">
                <div className="text-sm text-neutral-600">
                  파일: <span className="font-medium">2025학년도_9월_모의고사_국어.pdf</span>
                </div>
                <div className="text-sm text-neutral-600">
                  총 페이지: <span className="font-medium">156페이지</span>
                </div>
                <div className="text-sm text-neutral-600">
                  현재: <span className="font-medium text-blue-600">1/156</span>
                </div>
              </div>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex">
              {/* 왼쪽: 업로드된 시험지 */}
              <div className="flex-1 p-6">
                <div className="h-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">📄</div>
                    <div className="text-sm text-gray-600">PDF/PNG 파일 미리보기</div>
                    <div className="text-xs text-gray-500 mt-1">백엔드 연동 시 실제 파일 표시</div>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 페이지 네비게이션 및 채점 구간 선택 */}
              <div className="w-80 p-6 border-l">
                <div className="space-y-4">
                  {/* 페이지 네비게이션 - 맨 위로 이동 */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">페이지 네비게이션</h4>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50">
                        ← 이전
                      </button>
                      <input 
                        type="number" 
                        value="1" 
                        className="w-16 px-2 py-1 text-sm border rounded text-center"
                        min="1"
                        max="156"
                      />
                      <span className="text-sm text-gray-500">/ 156</span>
                      <button className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50">
                        다음 →
                      </button>
                    </div>
                  </div>

                  {/* 채점 구간 선택 */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">채점 구간 선택</h4>
                    <div className="space-y-3">
                      {/* 이름, 학번, 과목번호 */}
                      <div>
                        <div className="text-xs text-gray-600 mb-2">기본 정보 (2개까지 선택)</div>
                        <div className="space-y-1">
                          <label className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <span>이름</span>
                            </span>
                            <span className="text-xs text-gray-500">1/2</span>
                          </label>
                          <label className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <span>학번</span>
                            </span>
                            <span className="text-xs text-gray-500">2/2</span>
                          </label>
                          <label className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <span>과목번호</span>
                            </span>
                            <span className="text-xs text-gray-500">0/2</span>
                          </label>
                        </div>
                      </div>

                      {/* 객관식 영역 */}
                      <div>
                        <div className="text-xs text-gray-600 mb-2">객관식 영역</div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">객관식 블록</span>
                            <div className="flex items-center gap-2">
                              <button className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-200">
                                -
                              </button>
                              <span className="w-8 text-center text-sm font-medium">1</span>
                              <button className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-200">
                                +
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">(최대 10개)</div>
                        </div>
                      </div>

                      {/* 주관식 영역 */}
                      <div>
                        <div className="text-xs text-gray-600 mb-2">주관식 영역</div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">주관식 블록</span>
                            <div className="flex items-center gap-2">
                              <button className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-200">
                                -
                              </button>
                              <span className="w-8 text-center text-sm font-medium">1</span>
                              <button className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-200">
                                +
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">(최대 20개)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단: 채점 시작 버튼 */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  선택된 구간: 기본정보 2개, 객관식 블록 1개, 주관식 블록 1개
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsGradingRangeModalOpen(false)}
                    className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
                  >
                    취소
                  </button>
                  <button 
                    onClick={() => {
                      // 채점 시작 로직
                      setIsGradingRangeModalOpen(false);
                      navigateTo('results');
                    }}
                    className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"
                  >
                    채점 시작
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SNarOCRLayout>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import { Upload, ChevronDown, Download, Menu } from 'lucide-react';
import { validateFile } from '@/lib/security';
import LayoutCanvas from '@/components/upload/LayoutCanvas';
import BlockSidebar from '@/components/upload/BlockSidebar';
import AnswerEditor from '@/components/upload/AnswerEditor';
import type { Layout } from '@/types/omr';
import { useAuth, resolveApiUrl } from '@/contexts/AuthContext';
import { deriveSubjectInfo } from '@/lib/examMetadata';

interface UploadResponse {
  session_id: string;
  preview_url: string;
  filename: string;
}

interface GradeResponse {
  log?: string;
  csv_url?: string;
  json_url?: string;
  zip_url?: string;
  [key: string]: unknown;
}

const INITIAL_LAYOUT: Layout = {
  dpi: 300,
  blocks: [],
};

interface ExamMetaState {
  examYear: number | null;
  examMonth: number | null;
  providerName: string | null;
  gradeLevel: string | null;
}

interface ExamMetadataForApi {
  examYear: number | null;
  examMonth: number | null;
  providerName: string | null;
  gradeLevel: string | null;
  examCode: string | null;
  examLabel: string | null;
  subjectCode: string;
  subjectName: string;
  paperLabel: string | null;
}

export default function SNarOCRUpload() {
  const { isAuthenticated, userId } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [layout, setLayout] = useState<Layout>(INITIAL_LAYOUT);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateList, setTemplateList] = useState<string[]>([]);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [answerFileName, setAnswerFileName] = useState('');
  const [gradeLog, setGradeLog] = useState('');
  const [gradeResult, setGradeResult] = useState<GradeResponse | null>(null);
  const [threshold, setThreshold] = useState(0.05);
  const [tie, setTie] = useState(0.05);
  const [answerKey, setAnswerKey] = useState('{}');
  const [isGrading, setIsGrading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [isFindAnswerModalOpen, setIsFindAnswerModalOpen] = useState(false);
  const [isGradingRangeModalOpen, setIsGradingRangeModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGradeInfoModalOpen, setIsGradeInfoModalOpen] = useState(false);
  const [gradeInfo, setGradeInfo] = useState<Array<{
    score: number;
    standardScore: string;
    percentile: string;
    grade: string;
    testTakers: string;
  }>>([]);

  // 과목별 만점 정보
  const maxScoreBySubject = {
    '한국사': 50,
    '사회탐구': 50,
    '과학탐구': 50,
    '국어': 100,
    '수학': 100,
    '영어': 100
  };
  const [selectedSubject, setSelectedSubject] = useState('과목을 선택하세요');
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedExam, setSelectedExam] = useState('시험을 선택하세요');
  const [customQuestionCount, setCustomQuestionCount] = useState('');
  const [customMultipleChoice, setCustomMultipleChoice] = useState('');
  const [customSubjective, setCustomSubjective] = useState('');

  // 탐구 선택 관련 상태
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState('');
  const [selectedScienceCategory, setSelectedScienceCategory] = useState('');
  const [selectedSocialCategory, setSelectedSocialCategory] = useState('');
  const [selectedHistoryCategory, setSelectedHistoryCategory] = useState('');

  // 시험 정보 입력 필드
  const [examYear, setExamYear] = useState('');
  const [examMonth, setExamMonth] = useState('');
  const [examOrganization, setExamOrganization] = useState('출제기관 선택');
  const [examOrganizationCustom, setExamOrganizationCustom] = useState('');
  const [examGrade, setExamGrade] = useState('');

  const [examMeta, setExamMeta] = useState<ExamMetaState>({
    examYear: null,
    examMonth: null,
    providerName: null,
    gradeLevel: null,
  });


  // 드롭다운 상태
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const subjectInfo = useMemo(
    () =>
      deriveSubjectInfo({
        subject: selectedSubject,
        subjectCategory: selectedSubjectCategory,
        socialCategory: selectedSocialCategory,
        scienceCategory: selectedScienceCategory,
        historyCategory: selectedHistoryCategory,
      }),
    [
      selectedSubject,
      selectedSubjectCategory,
      selectedSocialCategory,
      selectedScienceCategory,
      selectedHistoryCategory,
    ],
  );

  const examMetadataForApi = useMemo<ExamMetadataForApi | null>(
    () => {
      if (!subjectInfo.subjectCode) return null;
      const label =
        selectedExam && selectedExam !== '시험을 선택하세요'
          ? selectedExam
          : fileName || null;
      return {
        examYear: examMeta.examYear,
        examMonth: examMeta.examMonth,
        providerName: examMeta.providerName,
        gradeLevel: examMeta.gradeLevel,
        examCode: fileName || null,
        examLabel: label,
        subjectCode: subjectInfo.subjectCode,
        subjectName: subjectInfo.subjectName,
        paperLabel: subjectInfo.paperLabel,
      };
    },
    [examMeta, fileName, selectedExam, subjectInfo],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) throw new Error('템플릿 목록을 불러오지 못했습니다.');
        const files = (await response.json()) as string[];
        if (mounted) setTemplateList(Array.isArray(files) ? files : []);
      } catch (error) {
        console.error(error);
        if (mounted) setTemplateList([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const templateOptions = useMemo(
    () =>
      templateList.map((name) => ({
        label: name.replace(/\.json$/, ''),
        value: name,
      })),
    [templateList],
  );

  const resetForNewUpload = () => {
    setLayout(INITIAL_LAYOUT);
    setSelectedBlockIndex(null);
    setAnswerFileName('');
    setGradeResult(null);
    setGradeLog('');
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const currentUserId = userId?.trim();
    if (!isAuthenticated || !currentUserId) {
      setUploadError('PDF를 업로드하려면 로그인이 필요합니다.');
      event.target.value = '';
      return;
    }

    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error ?? '업로드할 수 없는 파일입니다.');
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Create local preview for images immediately
      let localPreview: string | null = null;
      if (file.type.startsWith('image/')) {
        localPreview = URL.createObjectURL(file);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('template_path', templateName || '');
      formData.append('user_id', currentUserId);

      // Call mock API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`업로드 실패 (${response.status})`);
      }

      const data = (await response.json()) as UploadResponse;
      setSessionId(data.session_id);

      // Use local preview if available (better UX for images), 
      // otherwise use API provided preview (which handles PDF placeholder for mock)
      setPreviewUrl(localPreview || data.preview_url);
      setFileName(data.filename || file.name);

      resetForNewUpload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleTemplateLoad = async (value: string) => {
    setTemplateName(value);
    setIsTemplateDropdownOpen(false);
    if (!value) return;
    try {
      const response = await fetch(`/api/templates/${encodeURIComponent(value)}`);
      if (!response.ok) {
        throw new Error(`템플릿 로드 실패 (${response.status})`);
      }
      const json = await response.json();
      setLayout(json);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '템플릿 로드 중 오류가 발생했습니다.';
      setUploadError(message);
    }
  };

  const saveLayoutToFile = () => {
    const blob = new Blob([JSON.stringify(layout, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileName || 'layout'}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const saveLayoutToServer = async () => {
    if (!sessionId) throw new Error('세션이 없습니다. 먼저 PDF를 업로드하세요.');
    const response = await fetch('/api/layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        layout,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok === false) {
      const message = data?.message || `레이아웃 저장 실패 (${response.status})`;
      throw new Error(message);
    }
  };

  const handleStartGrading = async () => {
    if (!sessionId) {
      setUploadError('세션이 없습니다. 먼저 PDF를 업로드하세요.');
      return;
    }
    if (!examMetadataForApi) {
      setUploadError('시험 정보와 과목을 먼저 저장해주세요.');
      return;
    }

    let parsedAnswerKey: unknown = {};
    try {
      parsedAnswerKey = answerKey ? JSON.parse(answerKey) : {};
    } catch {
      setUploadError('answer_key 형식이 올바르지 않습니다. JSON 형식을 확인하세요.');
      return;
    }

    setIsGrading(true);
    setGradeLog('');
    setGradeResult(null);
    setUploadError('');

    try {
      await saveLayoutToServer();
      // Use Next.js API route with extended timeout (10 min) for grading
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          file_name: fileName,
          answer_name: answerFileName,
          T: threshold,
          tie,
          answer_key: parsedAnswerKey,
          exam_year: examMetadataForApi.examYear,
          exam_month: examMetadataForApi.examMonth,
          provider_name: examMetadataForApi.providerName,
          grade_level: examMetadataForApi.gradeLevel,
          exam_code: examMetadataForApi.examCode ?? fileName,
          subject_code: examMetadataForApi.subjectCode,
          subject_name: examMetadataForApi.subjectName,
          paper_label: examMetadataForApi.paperLabel ?? examMetadataForApi.subjectName,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `채점 실패 (${response.status})`);
      }
      const data = (await response.json()) as GradeResponse;
      setGradeResult(data);
      setGradeLog(data.log || '');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '채점 중 오류가 발생했습니다.';
      setUploadError(message);
    } finally {
      setIsGrading(false);
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

  const handleExamSave = () => {
    // 시험 정보 저장 로직
    const examInfo = [];
    if (examYear) examInfo.push(examYear);
    if (examMonth) examInfo.push(examMonth);

    const rawProvider = isCustomOrganization ? examOrganizationCustom : examOrganization;
    const providerName =
      rawProvider && rawProvider !== '출제기관 선택'
        ? rawProvider.trim()
        : '';
    if (providerName) examInfo.push(providerName);

    const gradeLabel = examGrade.trim();
    if (gradeLabel) examInfo.push(gradeLabel);

    const parsedYear = examYear ? parseInt(examYear.replace(/[^0-9]/g, ''), 10) : null;
    const parsedMonth = examMonth ? parseInt(examMonth.replace(/[^0-9]/g, ''), 10) : null;

    const normalizedYear =
      typeof parsedYear === 'number' && Number.isFinite(parsedYear) ? parsedYear : null;
    const normalizedMonth =
      typeof parsedMonth === 'number' && Number.isFinite(parsedMonth) ? parsedMonth : null;

    setExamMeta({
      examYear: normalizedYear,
      examMonth: normalizedMonth,
      providerName: providerName || null,
      gradeLevel: gradeLabel || null,
    });

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
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
                  <Upload className="mx-auto mb-2 text-gray-300" size={40} />
                  <div className="mt-2 text-sm text-neutral-600">이미지나 PDF를 업로드 해주세요</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    파일을 여기로 끌어다 놓거나 아래 버튼을 클릭해서 선택하세요
                  </div>
                  <div className="mt-4">
                    <button
                      className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? '업로드 중…' : '파일 선택'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  {fileName && (
                    <div className="mt-3 text-sm text-neutral-500">
                      <span className="font-medium text-neutral-700">선택된 파일:</span> {fileName}
                    </div>
                  )}
                  {sessionId && (
                    <div className="mt-1 text-xs text-neutral-500">세션 ID: {sessionId}</div>
                  )}
                  {uploadError && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                      {uploadError}
                    </div>
                  )}
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
                          <span>
                            {selectedSubject === '탐구' && selectedSubjectCategory === 'social' ? selectedSocialCategory :
                              selectedSubject === '탐구' && selectedSubjectCategory === 'science' ? selectedScienceCategory :
                                selectedSubject === '탐구' && selectedSubjectCategory === 'history' ? selectedHistoryCategory :
                                  selectedSubject === '탐구' ? '탐구' :
                                    selectedSubject}
                          </span>
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
                            <div className="border-b">
                              <button
                                onClick={() => {
                                  setSelectedSubject('탐구');
                                  setSelectedSubjectCategory(''); // 초기화
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-neutral-50"
                              >
                                <div className="font-medium text-sm">탐구</div>
                                <div className="text-xs text-neutral-500 mt-0.5">20문항</div>
                              </button>

                              {/* 탐구 선택 시 카테고리 선택 */}
                              {selectedSubject === '탐구' && (
                                <div className="pl-4 pb-2 space-y-2">
                                  <div className="relative">
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm rounded border bg-white hover:bg-neutral-50"
                                      onClick={() => {
                                        setSelectedSubjectCategory(selectedSubjectCategory === 'social' ? '' : 'social');
                                        if (selectedSubjectCategory !== 'social') {
                                          setSelectedScienceCategory('');
                                          setSelectedHistoryCategory('');
                                        }
                                      }}
                                    >
                                      {selectedSubjectCategory === 'social' ? '✓ ' : ''}사회탐구
                                    </button>

                                    {selectedSubjectCategory === 'social' && (
                                      <div className="mt-2 space-y-1 pl-2">
                                        {['생활과 윤리', '윤리와 사상', '한국지리', '세계지리', '동아시아사', '세계사', '경제', '정치와 법', '사회·문화'].map((subject) => (
                                          <button
                                            key={subject}
                                            className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-blue-50 border"
                                            onClick={() => {
                                              setSelectedSocialCategory(subject);
                                              setIsSubjectDropdownOpen(false);
                                            }}
                                          >
                                            {selectedSocialCategory === subject ? '✓ ' : ''}{subject}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="relative">
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm rounded border bg-white hover:bg-neutral-50"
                                      onClick={() => {
                                        setSelectedSubjectCategory(selectedSubjectCategory === 'science' ? '' : 'science');
                                        if (selectedSubjectCategory !== 'science') {
                                          setSelectedSocialCategory('');
                                          setSelectedHistoryCategory('');
                                        }
                                      }}
                                    >
                                      {selectedSubjectCategory === 'science' ? '✓ ' : ''}과학탐구
                                    </button>

                                    {selectedSubjectCategory === 'science' && (
                                      <div className="mt-2 space-y-1 pl-2">
                                        {['물리학I', '화학I', '생명과학I', '지구과학I', '물리학II', '화학II', '생명과학II', '지구과학II'].map((subject) => (
                                          <button
                                            key={subject}
                                            className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-blue-50 border"
                                            onClick={() => {
                                              setSelectedScienceCategory(subject);
                                              setIsSubjectDropdownOpen(false);
                                            }}
                                          >
                                            {selectedScienceCategory === subject ? '✓ ' : ''}{subject}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="relative">
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm rounded border bg-white hover:bg-neutral-50"
                                      onClick={() => {
                                        setSelectedSubjectCategory(selectedSubjectCategory === 'history' ? '' : 'history');
                                        if (selectedSubjectCategory !== 'history') {
                                          setSelectedSocialCategory('');
                                          setSelectedScienceCategory('');
                                        }
                                        setSelectedHistoryCategory('한국사');
                                        setIsSubjectDropdownOpen(false);
                                      }}
                                    >
                                      {selectedSubjectCategory === 'history' ? '✓ ' : ''}한국사
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
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
                          onClick={() => setIsAnswerModalOpen(true)}
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
                  <button className="px-4 py-2 rounded-xl border hover:bg-neutral-50">정답, 배점 csv 파일 업로드</button>
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
                        {['2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020'].map((year) => (
                          <button
                            key={year}
                            onClick={() => {
                              setExamYear(year + '년도');
                              setIsYearDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-neutral-50 border-b last:border-b-0"
                          >
                            {year}년도
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
                        {['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'].map((month) => (
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">채점 결과</h3>
            <p className="text-sm text-neutral-500">
              레이아웃과 정답을 저장한 뒤 채점을 실행하면 결과 파일을 내려받을 수 있습니다.
            </p>
          </div>
          {gradeResult ? (
            <div className="space-y-2">
              {gradeResult.csv_url && (
                <a
                  href={gradeResult.csv_url as string}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <Download size={14} /> 결과 CSV 다운로드
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
              아직 채점 결과가 없습니다. 좌측에서 PDF를 업로드하고 채점을 실행하세요.
            </div>
          )}
          {gradeLog && (
            <div className="rounded-xl bg-neutral-900 px-3 py-3 text-xs text-green-400">
              <pre className="whitespace-pre-wrap break-words">{gradeLog}</pre>
            </div>
          )}
        </div>
      </div>

      {/* 정답 입력 모달 (AnswerEditor.tsx) */}
      {isAnswerModalOpen && (
        <AnswerEditor
          open={isAnswerModalOpen}
          onClose={() => setIsAnswerModalOpen(false)}
          layout={layout}
          sessionId={sessionId}
          fileName={fileName}
          onAnswerFileNameChange={setAnswerFileName}
          subjectPreset={{
            subject: selectedSubject,
            subjectCategory: selectedSubjectCategory || selectedSocialCategory || selectedScienceCategory || selectedHistoryCategory || '',
            customQuestionCount: customQuestionCount ? Number(customQuestionCount) : null,
            customMultipleChoice: customMultipleChoice ? Number(customMultipleChoice) : null,
            customSubjective: customSubjective ? Number(customSubjective) : null,
          }}
          examMetadata={examMetadataForApi}
        />
      )}
      {/* 기존 정답 찾기 모달 (기존 LoadLayoutButton.tsx)*/}
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

      {/* 채점 구간 설정 모달 (기존 LayoutCanvas.tsx, BlockSidebar.tsx) */}
      {isGradingRangeModalOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* 페이지 정보 헤더 */}
          <div className="p-4 border-b shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">채점 구간 설정</h3>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <div className="px-2 py-0.5 bg-neutral-100 rounded">
                  파일: <span className="font-medium">{fileName ? `${fileName}.pdf` : '업로드된 파일 없음'}</span>
                </div>
                <div>
                  세션: <span className="font-medium">{sessionId ?? '-'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={saveLayoutToFile}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!layout.blocks?.length}
              >
                레이아웃 저장(JSON)
              </button>
              <button
                onClick={() => setIsGradingRangeModalOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-full text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">닫기</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 왼쪽: 업로드된 시험지 (기존 Layoutcanvas)*/}
            <div className="flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center">
              {/* 사이드바 닫혔을 때 여는 버튼 */}
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white rounded-lg shadow-md hover:bg-neutral-50 border text-neutral-600"
                >
                  <Menu size={20} />
                </button>
              )}

              <div className="w-full h-full flex items-center justify-center">
                {previewUrl ? (
                  <LayoutCanvas
                    imageUrl={previewUrl}
                    layout={layout}
                    onChange={setLayout}
                    selected={selectedBlockIndex}
                    onSelect={setSelectedBlockIndex}
                    hideControls
                    className="w-full h-full"
                    canvasClassName="w-full h-auto shadow-lg border border-neutral-200 bg-white"
                  />
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    <div className="mb-2 text-3xl">📄</div>
                    PDF를 업로드하면 미리보기가 표시됩니다.
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 페이지 네비게이션 및 블록 목록 (기존 구현된 바 없음) */}
            {isSidebarOpen && (
              <div className="w-96 p-6 border-l bg-white overflow-y-auto">
                <div className="space-y-4">
                  {/* 페이지 네비게이션 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">페이지 네비게이션</h4>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1 hover:bg-neutral-100 rounded text-neutral-500"
                        title="사이드바 접기"
                      >
                        <Menu size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50">
                        ← 이전
                      </button>
                      <input
                        type="number"
                        defaultValue="1"
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

                  {/* 템플릿 선택 (LoadLayoutButton.tsx 참고) */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">템플릿 선택</h4>
                    <div className="space-y-2">
                      <div className="relative">
                        <button
                          onClick={() => setIsTemplateDropdownOpen((prev) => !prev)}
                          className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <span>
                            {templateName
                              ? templateName.replace(/\.json$/, '')
                              : '템플릿을 선택하세요'}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition ${isTemplateDropdownOpen ? 'rotate-180' : ''
                              }`}
                          />
                        </button>
                        {isTemplateDropdownOpen && (
                          <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border bg-white shadow-lg">
                            {templateOptions.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-neutral-500">
                                사용 가능한 템플릿이 없습니다.
                              </div>
                            ) : (
                              templateOptions.map((option) => (
                                <button
                                  key={option.value}
                                  className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-neutral-50"
                                  onClick={() => handleTemplateLoad(option.value)}
                                >
                                  <span>{option.label}</span>
                                  {templateName === option.value && (
                                    <span className="text-xs text-blue-600">선택됨</span>
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        미리 정의된 템플릿을 사용하여 빠르게 설정할 수 있습니다
                      </div>
                    </div>
                  </div>

                  {/* 블록 목록 (BlockSidebar.tsx)*/}
                  <div>
                    <BlockSidebar
                      layout={layout}
                      onChange={setLayout}
                      selected={selectedBlockIndex}
                      setSelected={setSelectedBlockIndex}
                      className="space-y-4"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 하단: 채점 시작 버튼 (GradeRunner.tsx 참고)*/}
          {/* 하단: 채점 시작/결과 버튼 */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                총 {layout.blocks?.length ?? 0}개 블록 선택됨
              </div>
              <div className="flex items-center gap-2">
                {gradeResult ? (
                  <>
                    <div className="flex items-center text-green-600 font-medium mr-2">
                      <span className="mr-1">✓</span> 채점 완료
                    </div>
                    <button
                      onClick={() => setIsGradingRangeModalOpen(false)}
                      className="px-4 py-2 rounded-xl border hover:bg-neutral-50 text-gray-600"
                    >
                      닫기
                    </button>
                    {gradeResult.csv_url && (
                      <a
                        href={gradeResult.csv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                      >
                        <Download size={16} />
                        CSV 다운로드
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsGradingRangeModalOpen(false)}
                      className="px-4 py-2 rounded-xl border hover:bg-neutral-50 disabled:opacity-50"
                      disabled={isGrading}
                    >
                      취소
                    </button>
                    <button
                      onClick={() => void handleStartGrading()}
                      className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
                      disabled={isGrading || !sessionId}
                    >
                      {isGrading && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {isGrading ? '채점 진행 중...' : '채점 시작'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 성적표 정보 입력 모달 */}
      {
        isGradeInfoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
            <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">성적표 정보 입력</h3>
                <p className="text-sm text-neutral-600 mt-1">원점수별 표준점수, 백분위, 등급, 응시자수를 입력하세요</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {/* CSV 업로드 */}
                  <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <label className="text-sm font-medium mb-2 block">CSV 파일로 업로드</label>
                    <p className="text-xs text-gray-600 mb-3">표준점수, 백분위, 등급 정보가 포함된 CSV 파일을 업로드하세요</p>
                    <input
                      type="file"
                      accept=".csv"
                      className="w-full text-sm text-gray-600"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const csvText = event.target?.result as string;
                          const lines = csvText.split('\n');

                          if (lines.length < 2) {
                            alert('CSV 파일 형식이 올바르지 않습니다.');
                            return;
                          }

                          const headers = lines[0].split(',');
                          const newGradeInfo = [];

                          for (let i = 1; i < lines.length; i++) {
                            if (!lines[i].trim()) continue;
                            const values = lines[i].split(',');
                            const rawScore = parseInt(values[0].trim());

                            if (!isNaN(rawScore)) {
                              newGradeInfo.push({
                                score: rawScore,
                                standardScore: values[1]?.trim() || '',
                                percentile: values[2]?.trim() || '',
                                grade: values[3]?.trim() || '',
                                testTakers: values[4]?.trim() || ''
                              });
                            }
                          }

                          setGradeInfo(newGradeInfo);
                          alert('CSV 파일이 업로드되었습니다.');
                        };
                        reader.readAsText(file);
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">CSV 형식: 원점수,표준점수,백분위,등급,응시자수</p>
                  </div>

                  {/* 응시자수 입력 (단 한 번만) */}
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">전체 응시자수</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 1000"
                      onChange={(e) => {
                        const newGradeInfo = [...gradeInfo];
                        newGradeInfo[0] = { ...newGradeInfo[0], testTakers: e.target.value };
                        setGradeInfo(newGradeInfo);
                      }}
                    />
                  </div>

                  {/* 성적표 정보 입력 테이블 */}
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 text-sm table-fixed">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="border border-gray-300 p-2 text-center w-24">원점수</th>
                          <th className="border border-gray-300 p-2 text-center w-32">표준점수</th>
                          <th className="border border-gray-300 p-2 text-center w-32">백분위 (1-100)</th>
                          <th className="border border-gray-300 p-2 text-center w-32">등급 (1-9)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // 생활과 윤리, 사회문화 등 모든 사회탐구는 50점 만점
                          const isSocialSubject = selectedSubject === '탐구' && selectedSubjectCategory === 'social';
                          const isScienceSubject = selectedSubject === '탐구' && selectedSubjectCategory === 'science';
                          const isHistorySubject = selectedSubject === '탐구' && selectedSubjectCategory === 'history';
                          const maxScore = (isSocialSubject || isScienceSubject || isHistorySubject) ? 50 : 100;
                          return Array.from({ length: maxScore + 1 }, (_, i) => i).reverse().map((score) => (
                            <tr key={score}>
                              <td className="border border-gray-300 p-2 text-center bg-gray-100 font-bold">
                                {score}
                              </td>
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="number"
                                  step="0.1"
                                  className="w-full border-none focus:ring-0 text-center text-sm"
                                  onChange={(e) => {
                                    const newGradeInfo = [...gradeInfo];
                                    const existingIndex = newGradeInfo.findIndex(item => item.score === score);
                                    if (existingIndex >= 0) {
                                      newGradeInfo[existingIndex].standardScore = e.target.value;
                                    } else {
                                      newGradeInfo.push({
                                        score,
                                        standardScore: e.target.value,
                                        percentile: '',
                                        grade: '',
                                        testTakers: ''
                                      });
                                    }
                                    setGradeInfo(newGradeInfo);
                                  }}
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  className="w-full border-none focus:ring-0 text-center text-sm"
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value >= 1 && value <= 100) {
                                      const newGradeInfo = [...gradeInfo];
                                      const existingIndex = newGradeInfo.findIndex(item => item.score === score);
                                      if (existingIndex >= 0) {
                                        newGradeInfo[existingIndex].percentile = e.target.value;
                                      } else {
                                        newGradeInfo.push({
                                          score,
                                          standardScore: '',
                                          percentile: e.target.value,
                                          grade: '',
                                          testTakers: ''
                                        });
                                      }
                                      setGradeInfo(newGradeInfo);
                                    }
                                  }}
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="number"
                                  min="1"
                                  max="9"
                                  className="w-full border-none focus:ring-0 text-center text-sm"
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value >= 1 && value <= 9) {
                                      const newGradeInfo = [...gradeInfo];
                                      const existingIndex = newGradeInfo.findIndex(item => item.score === score);
                                      if (existingIndex >= 0) {
                                        newGradeInfo[existingIndex].grade = e.target.value;
                                      } else {
                                        newGradeInfo.push({
                                          score,
                                          standardScore: '',
                                          percentile: '',
                                          grade: e.target.value,
                                          testTakers: ''
                                        });
                                      }
                                      setGradeInfo(newGradeInfo);
                                    }
                                  }}
                                />
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 하단: 저장 버튼 */}
              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      const csvData = [];
                      csvData.push('원점수,표준점수,백분위,등급,응시자수');

                      // 50점 또는 100점 만점에 따라 데이터 생성
                      const isSocialSubject = selectedSubject === '탐구' && selectedSubjectCategory === 'social';
                      const isScienceSubject = selectedSubject === '탐구' && selectedSubjectCategory === 'science';
                      const isHistorySubject = selectedSubject === '탐구' && selectedSubjectCategory === 'history';
                      const maxScore = (isSocialSubject || isScienceSubject || isHistorySubject) ? 50 : 100;

                      for (let i = maxScore; i >= 0; i--) {
                        const item = gradeInfo.find(g => g.score === i);
                        const standardScore = item?.standardScore || '';
                        const percentile = item?.percentile || '';
                        const grade = item?.grade || '';
                        const testTakers = item?.testTakers || (gradeInfo[0]?.testTakers || '');
                        csvData.push(`${i},${standardScore},${percentile},${grade},${testTakers}`);
                      }

                      const csvContent = csvData.join('\n');
                      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      const url = URL.createObjectURL(blob);
                      link.setAttribute('href', url);

                      const subjectName = selectedSubject === '탐구' && selectedSubjectCategory === 'social' ? selectedSocialCategory :
                        selectedSubject === '탐구' && selectedSubjectCategory === 'science' ? selectedScienceCategory :
                          selectedSubject === '탐구' && selectedSubjectCategory === 'history' ? selectedHistoryCategory :
                            selectedSubject;
                      link.setAttribute('download', `성적표정보_${subjectName}_${new Date().toISOString().split('T')[0]}.csv`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-4 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <Download size={14} />
                    CSV로 다운로드
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsGradeInfoModalOpen(false)}
                      className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        console.log('성적표 정보 저장:', gradeInfo);
                        setIsGradeInfoModalOpen(false);
                        setIsGradingRangeModalOpen(true); // 채점 구간 설정 모달로 이동
                      }}
                      className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"
                    >
                      저장 및 다음
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </SNarOCRLayout >
  );
}

'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Upload, ChevronDown, Download, AlertTriangle } from 'lucide-react';
import SNarOCRLayout from '@/components/SNarOCRLayout';
import AnswerEditor from '@/components/upload/AnswerEditor';
import NameCorrectionModal from '@/components/upload/NameCorrectionModal';
import OverwriteConfirmModal from '@/components/upload/OverwriteConfirmModal';
import {
  ExamModal,
  FindAnswerModal,
  TemplateSelectModal,
  GradingRangeModal,
} from '@/components/upload/modals';
import { useAuth } from '@/contexts/AuthContext';
import type {
  NameIssuesData,
  GradingReport,
  GradeResponse,
  GradingProgress,
  ExamMetaState,
  ExamMetadataForApi,
  SavedAnswerData,
  GradeInfoItem,
} from '@/types/upload';

// 레이아웃 타입 정의
interface LayoutBlock {
  type: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  [key: string]: unknown;
}

interface Layout {
  blocks: LayoutBlock[];
  [key: string]: unknown;
}

export default function UploadPage() {
  // ============================================
  // 인증 정보
  // ============================================
  const { userId } = useAuth();

  // ============================================
  // 1. 세션/파일 관련 상태
  // ============================================
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ============================================
  // 2. 레이아웃 관련 상태
  // ============================================
  const [layout, setLayout] = useState<Layout>({ blocks: [] });
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateList, setTemplateList] = useState<string[]>([]);

  // ============================================
  // 3. 페이지 네비게이션 상태
  // ============================================
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ============================================
  // 4. 시험 정보 상태
  // ============================================
  const [examYear, setExamYear] = useState('');
  const [examMonth, setExamMonth] = useState('');
  const [examOrganization, setExamOrganization] = useState('출제기관 선택');
  const [examOrganizationCustom, setExamOrganizationCustom] = useState('');
  const [examGrade, setExamGrade] = useState('');
  const [selectedExam, setSelectedExam] = useState('시험을 선택하세요');
  const [examMeta, setExamMeta] = useState<ExamMetaState>({
    examYear: null,
    examMonth: null,
    providerName: null,
    gradeLevel: null,
  });

  // ============================================
  // 5. 과목 선택 상태
  // ============================================
  const [selectedSubject, setSelectedSubject] = useState('과목 선택');
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState('');
  const [selectedMathCategory, setSelectedMathCategory] = useState('');
  const [selectedSocialCategory, setSelectedSocialCategory] = useState('');
  const [selectedScienceCategory, setSelectedScienceCategory] = useState('');
  const [selectedHistoryCategory, setSelectedHistoryCategory] = useState('');
  const [customQuestionCount, setCustomQuestionCount] = useState('');
  const [customMultipleChoice, setCustomMultipleChoice] = useState('');
  const [customSubjective, setCustomSubjective] = useState('');

  // ============================================
  // 6. 정답 관련 상태
  // ============================================
  const [answerKey, setAnswerKey] = useState('');
  const [answerFileName, setAnswerFileName] = useState('');
  const [savedAnswerData, setSavedAnswerData] = useState<SavedAnswerData | null>(null);
  const [threshold] = useState(100);
  const [tie] = useState(5);

  // ============================================
  // 7. 채점 상태
  // ============================================
  const [isGrading, setIsGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState<GradingProgress>({
    current: 0,
    total: 0,
    status: '',
  });
  const [gradeResult, setGradeResult] = useState<GradeResponse | null>(null);
  const [gradeLog, setGradeLog] = useState('');
  const [gradingError, setGradingError] = useState<string | null>(null);

  // ============================================
  // 8. 성명 이슈 상태
  // ============================================
  const [nameIssues, setNameIssues] = useState<NameIssuesData | null>(null);
  const [namesCorrected, setNamesCorrected] = useState(false);
  const [isNameCorrectionOpen, setIsNameCorrectionOpen] = useState(false);
  const [gradingReport, setGradingReport] = useState<GradingReport | null>(null);

  // ============================================
  // 9. 덮어쓰기 모달 상태
  // ============================================
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
  const [overwriteModalType, setOverwriteModalType] = useState<'exam' | 'answer'>('exam');
  const [existingDataCount, setExistingDataCount] = useState(0);
  const [pendingGradingAction, setPendingGradingAction] = useState(false);

  // ============================================
  // 10. 모달 열림 상태
  // ============================================
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [isFindAnswerModalOpen, setIsFindAnswerModalOpen] = useState(false);
  const [isGradingRangeModalOpen, setIsGradingRangeModalOpen] = useState(false);
  const [isGradeInfoModalOpen, setIsGradeInfoModalOpen] = useState(false);
  const [isTemplateSelectModalOpen, setIsTemplateSelectModalOpen] = useState(false);

  // ============================================
  // 11. 드롭다운 열림 상태
  // ============================================
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  // ============================================
  // 12. 템플릿/업로드 상태
  // ============================================
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedUploadTemplate, setSelectedUploadTemplate] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ============================================
  // 13. 성적표 정보
  // ============================================
  const [gradeInfo, setGradeInfo] = useState<GradeInfoItem[]>([]);

  // ============================================
  // 파생 상태
  // ============================================
  const isCustomSubject = selectedSubject === '기타';
  const isCustomOrganization = examOrganization === '기타';

  // API용 메타데이터 계산
  const examMetadataForApi = useMemo<ExamMetadataForApi | null>(() => {
    let subjectCode = '';
    let subjectName = selectedSubject;
    let paperLabel: string | null = null;

    if (selectedSubject === '국어') {
      subjectCode = 'KOR';
    } else if (selectedSubject === '수학') {
      subjectCode = 'MATH';
      if (selectedMathCategory) {
        paperLabel = selectedMathCategory;
        subjectName = `수학 ${selectedMathCategory}`;
      }
    } else if (selectedSubject === '영어') {
      subjectCode = 'ENG';
    } else if (selectedSubject === '한국사') {
      subjectCode = 'HIST';
    } else if (selectedSubject === '탐구') {
      if (selectedSubjectCategory === 'social') {
        subjectCode = 'SOC';
        paperLabel = selectedSocialCategory;
        subjectName = selectedSocialCategory || '사회탐구';
      } else if (selectedSubjectCategory === 'science') {
        subjectCode = 'SCI';
        paperLabel = selectedScienceCategory;
        subjectName = selectedScienceCategory || '과학탐구';
      } else if (selectedSubjectCategory === 'history') {
        subjectCode = 'HIST';
        paperLabel = selectedHistoryCategory;
        subjectName = selectedHistoryCategory || '한국사';
      }
    } else if (selectedSubject === '기타') {
      subjectCode = 'ETC';
    }

    if (!subjectCode) return null;

    let examCode: string | null = null;
    let examLabel: string | null = null;

    if (examMeta.examYear || examMeta.examMonth || examMeta.providerName) {
      const parts = [];
      if (examMeta.examYear) parts.push(examMeta.examYear);
      if (examMeta.examMonth) parts.push(examMeta.examMonth);
      if (examMeta.providerName) parts.push(examMeta.providerName);
      examCode = parts.join('_');
      examLabel = selectedExam !== '시험을 선택하세요' ? selectedExam : null;
    }

    return {
      examYear: examMeta.examYear,
      examMonth: examMeta.examMonth,
      providerName: examMeta.providerName,
      gradeLevel: examMeta.gradeLevel,
      examCode,
      examLabel,
      subjectCode,
      subjectName,
      paperLabel,
    };
  }, [
    examMeta,
    selectedExam,
    selectedSubject,
    selectedSubjectCategory,
    selectedMathCategory,
    selectedSocialCategory,
    selectedScienceCategory,
    selectedHistoryCategory,
  ]);

  // subjectPreset 계산
  const subjectPreset = useMemo(() => ({
    subject: selectedSubject,
    subjectCategory: selectedSubjectCategory || selectedSocialCategory || selectedScienceCategory || selectedHistoryCategory || '',
    customQuestionCount: customQuestionCount ? Number(customQuestionCount) : null,
    customMultipleChoice: customMultipleChoice ? Number(customMultipleChoice) : null,
    customSubjective: customSubjective ? Number(customSubjective) : null,
  }), [
    selectedSubject,
    selectedSubjectCategory,
    selectedSocialCategory,
    selectedScienceCategory,
    selectedHistoryCategory,
    customQuestionCount,
    customMultipleChoice,
    customSubjective,
  ]);

  // ============================================
  // 초기화: 템플릿 목록 로드
  // ============================================
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const resp = await fetch('/api/templates');
        if (resp.ok) {
          const data = await resp.json();
          // 백엔드가 배열 직접 반환 또는 { templates: [] } 형태 지원
          if (Array.isArray(data)) {
            setTemplateList(data);
          } else if (data.templates) {
            setTemplateList(data.templates);
          }
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, []);

  // ============================================
  // 레이아웃 핸들러
  // ============================================
  const saveLayoutToServer = useCallback(async () => {
    if (!sessionId || !layout.blocks?.length) return;
    try {
      await fetch('/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, file_name: fileName, layout }),
      });
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  }, [sessionId, fileName, layout]);

  const saveLayoutToFile = useCallback(() => {
    if (!layout.blocks?.length) return;
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout_${fileName || 'unnamed'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [layout, fileName]);

  // ============================================
  // 페이지 네비게이션
  // ============================================
  const navigateToPage = useCallback(async (pageNum: number) => {
    if (!sessionId || pageNum < 1 || pageNum > totalPages) return;
    try {
      const resp = await fetch(`/api/preview?session_id=${encodeURIComponent(sessionId)}&page=${pageNum}`);
      if (resp.ok) {
        const blob = await resp.blob();
        const newUrl = URL.createObjectURL(blob);
        setPreviewUrl(newUrl);
        setCurrentPageNum(pageNum);

        const layoutResp = await fetch(`/api/layout?session_id=${encodeURIComponent(sessionId)}&page=${pageNum}`);
        if (layoutResp.ok) {
          const layoutData = await layoutResp.json();
          if (layoutData.layout) {
            setLayout(layoutData.layout);
          }
        }
      }
    } catch (error) {
      console.error('Failed to navigate to page:', error);
    }
  }, [sessionId, totalPages]);

  // ============================================
  // 파일 업로드 핸들러
  // ============================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);
    setIsTemplateSelectModalOpen(true);
  };

  const handleUploadWithTemplate = useCallback(async (template: string) => {
    if (!pendingFile) return;

    const effectiveUserId = userId || 'developer';
    
    setIsTemplateSelectModalOpen(false);
    setIsUploading(true);
    setUploadStatus('파일 업로드 중...');
    setUploadError('');
    setUploadProgress({ current: 0, total: 0 });

    try {
      const formData = new FormData();
      formData.append('file', pendingFile);
      formData.append('template_path', template === '기타' ? '' : template);
      formData.append('user_id', effectiveUserId);

      // Use SSE streaming endpoint for progress updates
      const response = await fetch('/api/upload-stream', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `업로드 실패 (${response.status})`);
      }

      // Process SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('스트림을 읽을 수 없습니다');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let uploadedSessionId: string | null = null;
      let uploadedNumPages = 1;
      let uploadedFilename = pendingFile.name.replace(/\.[^/.]+$/, '');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.status === 'processing' || data.status === 'uploading') {
                setUploadStatus(data.message || `처리 중... (${data.current}/${data.total})`);
                if (data.current !== undefined && data.total !== undefined) {
                  setUploadProgress({ current: data.current, total: data.total });
                }
              } else if (data.status === 'done') {
                setUploadStatus('등록 완료');
                if (data.total) {
                  setUploadProgress({ current: data.total, total: data.total });
                }
              } else if (data.status === 'error') {
                throw new Error(data.message || '처리 중 오류가 발생했습니다');
              } else if (data.status === 'complete') {
                uploadedSessionId = data.session_id;
                uploadedNumPages = data.num_pages || 1;
                if (data.filename) {
                  uploadedFilename = data.filename;
                }
              }
            } catch (e) {
              if (e instanceof SyntaxError) {
                console.warn('SSE JSON parse error:', line);
              } else {
                throw e;
              }
            }
          }
        }
      }

      if (!uploadedSessionId) {
        throw new Error('세션 ID를 받지 못했습니다');
      }

      setSessionId(uploadedSessionId);
      setFileName(uploadedFilename);
      setTotalPages(uploadedNumPages);
      setCurrentPageNum(1);
      setTemplateName(template === '기타' ? '' : template);

      // 미리보기 이미지 로드
      const previewResp = await fetch(`/api/preview?session_id=${encodeURIComponent(uploadedSessionId)}&page=1`);
      if (previewResp.ok) {
        const blob = await previewResp.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      }

      // 템플릿이 있으면 레이아웃 로드
      if (template && template !== '기타') {
        try {
          const layoutResp = await fetch(`/api/layout?session_id=${encodeURIComponent(uploadedSessionId)}&page=1`);
          if (layoutResp.ok) {
            const layoutData = await layoutResp.json();
            if (layoutData.blocks) {
              setLayout(layoutData);
            }
          }
        } catch (layoutErr) {
          console.warn('레이아웃 로드 실패:', layoutErr);
        }
      }

      setUploadStatus('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.';
      setUploadError(message);
      setUploadStatus('');
    } finally {
      setIsUploading(false);
      setPendingFile(null);
      setUploadProgress({ current: 0, total: 0 });
    }
  }, [pendingFile, userId]);

  // ============================================
  // 시험 정보 저장
  // ============================================
  const handleExamSave = useCallback(() => {
    const examInfo = [];
    if (examYear) examInfo.push(examYear);
    if (examMonth) examInfo.push(examMonth);

    const rawProvider = isCustomOrganization ? examOrganizationCustom : examOrganization;
    const providerName = rawProvider && rawProvider !== '출제기관 선택' ? rawProvider.trim() : '';
    if (providerName) examInfo.push(providerName);

    const gradeLabel = examGrade.trim();
    if (gradeLabel) examInfo.push(gradeLabel);

    const parsedYear = examYear ? parseInt(examYear.replace(/[^0-9]/g, ''), 10) : null;
    const parsedMonth = examMonth ? parseInt(examMonth.replace(/[^0-9]/g, ''), 10) : null;

    setExamMeta({
      examYear: typeof parsedYear === 'number' && Number.isFinite(parsedYear) ? parsedYear : null,
      examMonth: typeof parsedMonth === 'number' && Number.isFinite(parsedMonth) ? parsedMonth : null,
      providerName: providerName || null,
      gradeLevel: gradeLabel || null,
    });

    setSelectedExam(examInfo.length > 0 ? examInfo.join(' ') : '시험을 선택하세요');
    setIsExamModalOpen(false);
  }, [examYear, examMonth, examOrganization, examOrganizationCustom, examGrade, isCustomOrganization]);

  // ============================================
  // 기존 데이터 확인
  // ============================================
  const checkExistingData = useCallback(async () => {
    if (!examMetadataForApi) return { hasExamRecords: false, examRecordCount: 0 };

    try {
      const response = await fetch('/api/exams/check-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_code: examMetadataForApi.examCode,
          subject_code: examMetadataForApi.subjectCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          hasExamRecords: data.has_exam_records || false,
          examRecordCount: data.exam_record_count || 0,
        };
      }
    } catch (error) {
      console.error('Failed to check existing data:', error);
    }

    return { hasExamRecords: false, examRecordCount: 0 };
  }, [examMetadataForApi]);

  // ============================================
  // 채점 실행
  // ============================================
  const executeGrading = useCallback(async () => {
    if (!sessionId || !examMetadataForApi) return;

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
    setGradingError(null);
    setGradingProgress({ current: 0, total: 0, status: '채점 준비 중...' });

    try {
      await saveLayoutToServer();
      setGradingProgress({ current: 0, total: 0, status: '레이아웃 저장 완료, 채점 시작...' });

      // SSE 스트리밍 채점 요청
      console.log('[SSE] Starting grade-stream request...');
      const response = await fetch('/api/grade-stream', {
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
        console.log('[SSE] Response not OK:', response.status, text);
        throw new Error(text || `채점 실패 (${response.status})`);
      }
      
      console.log('[SSE] Response OK, starting stream read...');

      // SSE 스트림 읽기
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Stream not available');
      }

      interface GradingSSEData {
        status: string;
        current?: number;
        total?: number;
        message?: string;
        log?: string;
        csv_url?: string;
        json_url?: string;
        zip_url?: string;
        name_issues?: NameIssuesData | null;
        grading_report?: GradingReport | null;
        error?: string;
      }

      let finalData: GradingSSEData | null = null;
      let buffer = '';
      let accumulatedLog = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        console.log('[SSE] Received chunk, lines:', lines.length);
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as GradingSSEData;
              console.log('[SSE] Parsed data:', data.status, data.current, data.total);

              if (data.status === 'processing' && data.current !== undefined && data.total !== undefined) {
                console.log('[SSE] Before setGradingProgress:', data.current, data.total);
                setGradingProgress((prev) => {
                  console.log('[SSE] Inside setGradingProgress, prev:', prev, 'new:', data.current, data.total);
                  return {
                    current: data.current!,
                    total: data.total!,
                    status: `페이지 채점 중 (${data.current}/${data.total})`,
                  };
                });
                if (data.message) {
                  accumulatedLog += data.message + '\n';
                  setGradeLog(accumulatedLog);
                }
              } else if (data.status === 'loading') {
                setGradingProgress({ current: 0, total: 0, status: '파일 로드 중...' });
              } else if (data.status === 'initializing') {
                setGradingProgress({ current: 0, total: data.total || 0, status: '채점 초기화 중...' });
              } else if (data.status === 'saving') {
                setGradingProgress(prev => ({ ...prev, status: '결과 저장 중...' }));
              } else if (data.status === 'complete') {
                finalData = data;
                setGradingProgress(prev => ({ ...prev, status: '채점 완료!' }));
              } else if (data.status === 'error') {
                throw new Error(data.error || data.message || '채점 중 오류 발생');
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
                console.error('Failed to parse grading SSE data:', e);
              }
            }
          }
        }
      }

      // 최종 결과 처리
      if (finalData) {
        setGradeResult({
          log: finalData.log || accumulatedLog,
          csv_url: finalData.csv_url,
          json_url: finalData.json_url,
          zip_url: finalData.zip_url,
          name_issues: finalData.name_issues,
          grading_report: finalData.grading_report,
        });
        setGradeLog(finalData.log || accumulatedLog);

        if (finalData.grading_report) {
          setGradingReport(finalData.grading_report);
          setNamesCorrected(finalData.grading_report.names_corrected || false);
        }

        if (finalData.name_issues && finalData.name_issues.issues_found > 0) {
          setNameIssues(finalData.name_issues);
          setIsNameCorrectionOpen(true);
          setNamesCorrected(false);
        } else {
          setNameIssues(null);
          setNamesCorrected(true);
        }
      } else {
        // fallback: 기존 API 사용
        const fallbackResponse = await fetch('/api/grade', {
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
        if (!fallbackResponse.ok) {
          const text = await fallbackResponse.text();
          throw new Error(text || `채점 실패 (${fallbackResponse.status})`);
        }
        const data = (await fallbackResponse.json()) as GradeResponse;
        setGradeResult(data);
        setGradeLog(data.log || '');

        if (data.grading_report) {
          setGradingReport(data.grading_report);
          setNamesCorrected(data.grading_report.names_corrected || false);
        }

        if (data.name_issues && data.name_issues.issues_found > 0) {
          setNameIssues(data.name_issues);
          setIsNameCorrectionOpen(true);
          setNamesCorrected(false);
        } else {
          setNameIssues(null);
          setNamesCorrected(true);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '채점 중 오류가 발생했습니다.';
      setUploadError(message);
      setGradingError(message);
      setGradingProgress(prev => ({ ...prev, status: `오류: ${message}` }));
    } finally {
      setIsGrading(false);
    }
  }, [sessionId, examMetadataForApi, answerKey, fileName, answerFileName, threshold, tie, saveLayoutToServer]);

  const handleStartGrading = async () => {
    if (!sessionId) {
      setUploadError('세션이 없습니다. 먼저 PDF를 업로드하세요.');
      setIsGradingRangeModalOpen(false);
      return;
    }
    if (!examMetadataForApi) {
      setUploadError('시험 정보와 과목을 먼저 저장해주세요.');
      setIsGradingRangeModalOpen(false);
      return;
    }
    
    // 필수 시험 정보 검증
    const missingFields: string[] = [];
    if (!examMetadataForApi.examYear) missingFields.push('시험 연도');
    if (!examMetadataForApi.examMonth) missingFields.push('시험 월');
    if (!examMetadataForApi.subjectCode) missingFields.push('과목');
    
    if (missingFields.length > 0) {
      setUploadError(`채점을 진행하려면 다음 정보를 입력해주세요: ${missingFields.join(', ')}`);
      setIsGradingRangeModalOpen(false);
      return;
    }

    const existingData = await checkExistingData();

    if (existingData.hasExamRecords) {
      setOverwriteModalType('exam');
      setExistingDataCount(existingData.examRecordCount);
      setIsOverwriteModalOpen(true);
      setPendingGradingAction(true);
      return;
    }

    await executeGrading();
  };

  const handleOverwriteConfirm = async () => {
    setIsOverwriteModalOpen(false);
    if (pendingGradingAction) {
      setPendingGradingAction(false);
      await executeGrading();
    }
  };

  const handleOverwriteCancel = () => {
    setIsOverwriteModalOpen(false);
    setPendingGradingAction(false);
  };

  // ============================================
  // 정답 불러오기 핸들러
  // ============================================
  const handleAnswerSelected = useCallback((data: SavedAnswerData, subjectCode?: string) => {
    setSavedAnswerData(data);

    // Auto-populate subject from answer data
    if (subjectCode) {
      const subjectMap: Record<string, string> = {
        'KOR': '국어',
        'MATH': '수학',
        'ENG': '영어',
        'HIST': '한국사',
        'SOC': '탐구',
        'SCI': '탐구',
      };
      const mappedSubject = subjectMap[subjectCode];
      if (mappedSubject) {
        setSelectedSubject(mappedSubject);
      }
    }

    // Auto-populate exam year from answer data
    if (data.examYear) {
      setExamYear(`${data.examYear}년`);
    }

    // Auto-populate exam month from answer data  
    if (data.examMonth) {
      setExamMonth(`${data.examMonth}월`);
    }

    // Auto-populate provider/organization from answer data
    if (data.providerName) {
      // Check if it matches a preset organization, otherwise set as custom
      const presetOrganizations = ['평가원', '교육청', '서프', '더프', 'EBS'];
      if (presetOrganizations.includes(data.providerName)) {
        setExamOrganization(data.providerName);
      } else {
        setExamOrganization('기타');
        setExamOrganizationCustom(data.providerName);
      }
    }

    setIsAnswerModalOpen(true);
  }, []);

  // ============================================
  // 렌더링
  // ============================================
  return (
    <SNarOCRLayout currentPage="upload">
      <section className="space-y-6">
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-xl font-semibold">채점 업로드</h2>
            <p className="text-sm text-neutral-600">이미지(JPG/PNG) 또는 PDF를 업로드하세요</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* 왼쪽: 업로드 영역 */}
            <div className="md:col-span-2 rounded-2xl border bg-white">
              <div className="p-6 space-y-4">
                {/* 파일 업로드 드롭존 */}
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
                  <Upload className="mx-auto mb-2 text-gray-300" size={40} />
                  <div className="mt-2 text-sm text-neutral-600">이미지나 PDF를 업로드 해주세요</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    파일을 여기로 끌어다 놓거나 아래 버튼을 클릭해서 선택하세요
                  </div>
                  <div className="mt-4">
                    <button
                      className={`rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 ${isUploading ? 'animate-pulse' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (uploadStatus || '업로드 중…') : '파일 선택'}
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

                {/* 시험/과목 선택 */}
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

                        {isSubjectDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-80 overflow-y-auto">
                            {[
                              { key: '국어', label: '국어', desc: '45문항 (선택형 + 서답형)' },
                              { key: '수학', label: '수학', desc: '30문항 (22 + 단답형 8) - 선택과목은 정답 입력에서 선택' },
                              { key: '영어', label: '영어', desc: '45문항' },
                              { key: '한국사', label: '한국사', desc: '20문항' },
                              { key: '탐구', label: '탐구', desc: '20문항 (사탐/과탐) - 과목은 정답 입력에서 선택' },
                              { key: '기타', label: '기타', desc: '직접 문항 수 입력' },
                            ].map(({ key, label, desc }) => (
                              <button
                                key={key}
                                onClick={() => {
                                  setSelectedSubject(key);
                                  if (key === '수학') setSelectedMathCategory('');
                                  if (key === '탐구') {
                                    setSelectedSubjectCategory('');
                                    setSelectedSocialCategory('');
                                    setSelectedScienceCategory('');
                                  }
                                  setIsSubjectDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b last:border-b-0"
                              >
                                <div className="font-medium text-sm">{label}</div>
                                <div className="text-xs text-neutral-500 mt-0.5">{desc}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 기타 선택 시 문항 수 입력 */}
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

                  {/* 정답지 버튼 */}
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

                  {/* 메모 */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">메모 (선택)</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="응시자 이름, 반, 비고 등"
                    />
                  </div>
                </div>

                {/* 채점 버튼 */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsGradingRangeModalOpen(true)}
                    disabled={isGrading}
                    className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGrading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {isGrading ? `채점 중... (${gradingProgress.current}/${gradingProgress.total})` : '채점 구간 설정'}
                  </button>
                </div>
              </div>
            </div>

            {/* 오른쪽: 가이드 */}
            <div className="rounded-2xl border bg-white">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">가이드</h3>
              </div>
              <div className="p-6 space-y-3 text-sm text-neutral-600">
                <p>• 곡률 없이 평평하게, 빛 반사 없이, 테두리가 선명하게 촬영해 주세요.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 채점 결과 섹션 */}
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
              {nameIssues && nameIssues.issues_found > 0 && (
                <button
                  onClick={() => setIsNameCorrectionOpen(true)}
                  className="w-full flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 hover:bg-amber-100"
                >
                  <AlertTriangle size={14} />
                  <span>{nameIssues.issues_found}건의 성명 인식 오류가 있습니다. 클릭하여 수정</span>
                </button>
              )}
              {gradingReport && gradingReport.missing_pages.length > 0 && (
                <div className="w-full flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertTriangle size={14} />
                  <span>
                    누락된 페이지: {gradingReport.missing_pages.join(', ')}
                    (전체 {gradingReport.total_pages}페이지 중 {gradingReport.processed_pages}페이지 처리됨)
                  </span>
                </div>
              )}
              {gradeResult.csv_url && (
                namesCorrected ? (
                  <a
                    href={gradeResult.csv_url as string}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <Download size={14} /> 결과 CSV 다운로드
                  </a>
                ) : (
                  <button
                    onClick={() => setIsNameCorrectionOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 hover:bg-amber-100 cursor-pointer"
                  >
                    <AlertTriangle size={14} /> 성명 수정 후 CSV 다운로드 가능
                  </button>
                )
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

      {/* ============================================ */}
      {/* 모달들 */}
      {/* ============================================ */}

      {/* 시험 선택 모달 */}
      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        onSave={handleExamSave}
        examYear={examYear}
        setExamYear={setExamYear}
        examMonth={examMonth}
        setExamMonth={setExamMonth}
        examOrganization={examOrganization}
        setExamOrganization={setExamOrganization}
        examOrganizationCustom={examOrganizationCustom}
        setExamOrganizationCustom={setExamOrganizationCustom}
        examGrade={examGrade}
        setExamGrade={setExamGrade}
        isCustomOrganization={isCustomOrganization}
      />

      {/* 정답 입력 모달 */}
      {isAnswerModalOpen && (
        <AnswerEditor
          open={isAnswerModalOpen}
          onClose={() => setIsAnswerModalOpen(false)}
          layout={layout}
          sessionId={sessionId}
          fileName={fileName}
          onAnswerFileNameChange={setAnswerFileName}
          onAnswersChange={setSavedAnswerData}
          subjectPreset={subjectPreset}
          examMetadata={examMetadataForApi}
          initialAnswers={savedAnswerData}
        />
      )}

      {/* 기존 정답 찾기 모달 */}
      <FindAnswerModal
        isOpen={isFindAnswerModalOpen}
        onClose={() => setIsFindAnswerModalOpen(false)}
        onAnswerSelected={handleAnswerSelected}
      />

      {/* 템플릿 선택 모달 */}
      <TemplateSelectModal
        isOpen={isTemplateSelectModalOpen}
        onClose={() => {
          setIsTemplateSelectModalOpen(false);
          setPendingFile(null);
        }}
        templateList={templateList}
        selectedTemplate={selectedUploadTemplate}
        setSelectedTemplate={setSelectedUploadTemplate}
        onUpload={() => {
          if (selectedUploadTemplate) {
            handleUploadWithTemplate(selectedUploadTemplate);
          }
        }}
        isUploading={isUploading}
      />

      {/* 채점 구간 설정 모달 */}
      <GradingRangeModal
        isOpen={isGradingRangeModalOpen}
        onClose={() => setIsGradingRangeModalOpen(false)}
        fileName={fileName}
        sessionId={sessionId}
        previewUrl={previewUrl}
        layout={layout}
        setLayout={setLayout}
        selectedBlockIndex={selectedBlockIndex}
        setSelectedBlockIndex={setSelectedBlockIndex}
        templateName={templateName}
        currentPageNum={currentPageNum}
        totalPages={totalPages}
        navigateToPage={navigateToPage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isGrading={isGrading}
        gradingProgress={gradingProgress}
        gradingError={gradingError}
        gradeResult={gradeResult}
        namesCorrected={namesCorrected}
        saveLayoutToFile={saveLayoutToFile}
        handleStartGrading={handleStartGrading}
        setIsNameCorrectionOpen={setIsNameCorrectionOpen}
      />

      {/* Name Correction Modal */}
      <NameCorrectionModal
        isOpen={isNameCorrectionOpen}
        onClose={() => setIsNameCorrectionOpen(false)}
        sessionId={sessionId || ''}
        nameIssues={nameIssues}
        onCorrectionsSaved={() => {
          setNamesCorrected(true);
          if (sessionId) {
            fetch(`/api/grade/name-issues?session_id=${sessionId}`)
              .then((res) => res.json())
              .then((data) => setNameIssues(data))
              .catch(() => {});
          }
        }}
      />

      {/* Overwrite Confirm Modal */}
      <OverwriteConfirmModal
        isOpen={isOverwriteModalOpen}
        onClose={handleOverwriteCancel}
        onConfirm={handleOverwriteConfirm}
        title="이미 채점된 데이터가 있습니다"
        message="이미 채점된 데이터가 있습니다. 수정하시겠습니까?"
        existingCount={existingDataCount}
        type={overwriteModalType}
      />
    </SNarOCRLayout>
  );
}

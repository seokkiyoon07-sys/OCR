'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  NameIssuesData,
  GradingReport,
  GradeResponse,
  GradingProgress,
  ExamMetadataForApi,
} from '@/types/upload';

interface GradingContextValue {
  // 채점 상태
  isGrading: boolean;
  setIsGrading: (grading: boolean) => void;
  
  // 채점 진행 상황
  gradingProgress: GradingProgress;
  setGradingProgress: (progress: GradingProgress | ((prev: GradingProgress) => GradingProgress)) => void;
  
  // 채점 결과
  gradeResult: GradeResponse | null;
  setGradeResult: (result: GradeResponse | null) => void;
  gradeLog: string;
  setGradeLog: (log: string) => void;
  gradingError: string | null;
  setGradingError: (error: string | null) => void;
  
  // 성명 이슈
  nameIssues: NameIssuesData | null;
  setNameIssues: (issues: NameIssuesData | null) => void;
  namesCorrected: boolean;
  setNamesCorrected: (corrected: boolean) => void;
  isNameCorrectionOpen: boolean;
  setIsNameCorrectionOpen: (open: boolean) => void;
  
  // 채점 리포트
  gradingReport: GradingReport | null;
  setGradingReport: (report: GradingReport | null) => void;
  
  // 덮어쓰기 모달
  isOverwriteModalOpen: boolean;
  setIsOverwriteModalOpen: (open: boolean) => void;
  overwriteModalType: 'exam' | 'answer';
  setOverwriteModalType: (type: 'exam' | 'answer') => void;
  existingDataCount: number;
  setExistingDataCount: (count: number) => void;
  pendingGradingAction: boolean;
  setPendingGradingAction: (pending: boolean) => void;
  
  // 채점 실행
  executeGrading: (params: {
    sessionId: string;
    fileName: string;
    answerFileName: string;
    answerKey: string;
    threshold: number;
    tie: number;
    examMetadataForApi: ExamMetadataForApi;
    saveLayoutToServer: () => Promise<void>;
    setUploadError: (error: string) => void;
  }) => Promise<void>;
  
  // 기존 데이터 확인
  checkExistingData: (examMetadataForApi: ExamMetadataForApi) => Promise<{
    hasExamRecords: boolean;
    examRecordCount: number;
  }>;
  
  // 상태 초기화
  resetGradingState: () => void;
}

const GradingContext = createContext<GradingContextValue | null>(null);

export function GradingProvider({ children }: { children: ReactNode }) {
  // 채점 상태
  const [isGrading, setIsGrading] = useState(false);
  
  // 채점 진행 상황
  const [gradingProgress, setGradingProgress] = useState<GradingProgress>({
    current: 0,
    total: 0,
    status: '',
  });
  
  // 채점 결과
  const [gradeResult, setGradeResult] = useState<GradeResponse | null>(null);
  const [gradeLog, setGradeLog] = useState('');
  const [gradingError, setGradingError] = useState<string | null>(null);
  
  // 성명 이슈
  const [nameIssues, setNameIssues] = useState<NameIssuesData | null>(null);
  const [namesCorrected, setNamesCorrected] = useState(false);
  const [isNameCorrectionOpen, setIsNameCorrectionOpen] = useState(false);
  
  // 채점 리포트
  const [gradingReport, setGradingReport] = useState<GradingReport | null>(null);
  
  // 덮어쓰기 모달
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
  const [overwriteModalType, setOverwriteModalType] = useState<'exam' | 'answer'>('exam');
  const [existingDataCount, setExistingDataCount] = useState(0);
  const [pendingGradingAction, setPendingGradingAction] = useState(false);

  // 기존 데이터 확인
  const checkExistingData = useCallback(async (examMetadataForApi: ExamMetadataForApi) => {
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
  }, []);

  // 채점 실행
  const executeGrading = useCallback(async ({
    sessionId,
    fileName,
    answerFileName,
    answerKey,
    threshold,
    tie,
    examMetadataForApi,
    saveLayoutToServer,
    setUploadError,
  }: {
    sessionId: string;
    fileName: string;
    answerFileName: string;
    answerKey: string;
    threshold: number;
    tie: number;
    examMetadataForApi: ExamMetadataForApi;
    saveLayoutToServer: () => Promise<void>;
    setUploadError: (error: string) => void;
  }) => {
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
        throw new Error(text || `채점 실패 (${response.status})`);
      }

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
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as GradingSSEData;
              
              if (data.status === 'processing' && data.current !== undefined && data.total !== undefined) {
                setGradingProgress({ 
                  current: data.current, 
                  total: data.total, 
                  status: `페이지 채점 중 (${data.current}/${data.total})` 
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
      const message =
        error instanceof Error ? error.message : '채점 중 오류가 발생했습니다.';
      setUploadError(message);
      setGradingError(message);
      setGradingProgress(prev => ({ ...prev, status: `오류: ${message}` }));
    } finally {
      setIsGrading(false);
    }
  }, []);

  // 상태 초기화
  const resetGradingState = useCallback(() => {
    setIsGrading(false);
    setGradingProgress({ current: 0, total: 0, status: '' });
    setGradeResult(null);
    setGradeLog('');
    setGradingError(null);
    setNameIssues(null);
    setNamesCorrected(false);
    setGradingReport(null);
  }, []);

  const value: GradingContextValue = {
    isGrading,
    setIsGrading,
    gradingProgress,
    setGradingProgress,
    gradeResult,
    setGradeResult,
    gradeLog,
    setGradeLog,
    gradingError,
    setGradingError,
    nameIssues,
    setNameIssues,
    namesCorrected,
    setNamesCorrected,
    isNameCorrectionOpen,
    setIsNameCorrectionOpen,
    gradingReport,
    setGradingReport,
    isOverwriteModalOpen,
    setIsOverwriteModalOpen,
    overwriteModalType,
    setOverwriteModalType,
    existingDataCount,
    setExistingDataCount,
    pendingGradingAction,
    setPendingGradingAction,
    executeGrading,
    checkExistingData,
    resetGradingState,
  };

  return (
    <GradingContext.Provider value={value}>
      {children}
    </GradingContext.Provider>
  );
}

export function useGradingContext() {
  const context = useContext(GradingContext);
  if (!context) {
    throw new Error('useGradingContext must be used within a GradingProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import type { ExamMetaState, ExamMetadataForApi, SavedAnswerData, SubjectPreset } from '@/types/upload';

interface ExamMetadataContextValue {
  // 시험 정보
  examYear: string;
  setExamYear: (year: string) => void;
  examMonth: string;
  setExamMonth: (month: string) => void;
  examOrganization: string;
  setExamOrganization: (org: string) => void;
  examOrganizationCustom: string;
  setExamOrganizationCustom: (org: string) => void;
  examGrade: string;
  setExamGrade: (grade: string) => void;
  selectedExam: string;
  setSelectedExam: (exam: string) => void;
  
  // 과목 선택
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  selectedSubjectCategory: string;
  setSelectedSubjectCategory: (category: string) => void;
  selectedMathCategory: string;
  setSelectedMathCategory: (category: string) => void;
  selectedSocialCategory: string;
  setSelectedSocialCategory: (category: string) => void;
  selectedScienceCategory: string;
  setSelestedScienceCategory: (category: string) => void;
  selectedHistoryCategory: string;
  setSelectedHistoryCategory: (category: string) => void;
  
  // 사용자 정의 문항 수
  customQuestionCount: string;
  setCustomQuestionCount: (count: string) => void;
  customMultipleChoice: string;
  setCustomMultipleChoice: (count: string) => void;
  customSubjective: string;
  setCustomSubjective: (count: string) => void;
  
  // 정답 관련
  answerKey: string;
  setAnswerKey: (key: string) => void;
  answerFileName: string;
  setAnswerFileName: (name: string) => void;
  savedAnswerData: SavedAnswerData | null;
  setSavedAnswerData: (data: SavedAnswerData | null) => void;
  
  // 채점 파라미터
  threshold: number;
  setThreshold: (threshold: number) => void;
  tie: number;
  setTie: (tie: number) => void;
  
  // 계산된 값
  examMeta: ExamMetaState;
  setExamMeta: (meta: ExamMetaState) => void;
  examMetadataForApi: ExamMetadataForApi | null;
  subjectPreset: SubjectPreset;
  
  // 유틸리티 함수
  getQuestionCount: () => number;
  isCustomSubject: boolean;
  isCustomOrganization: boolean;
  
  // 핸들러
  handleExamSave: () => void;
  resetExamMetadata: () => void;
}

const ExamMetadataContext = createContext<ExamMetadataContextValue | null>(null);

export function ExamMetadataProvider({ children }: { children: ReactNode }) {
  // 시험 정보
  const [examYear, setExamYear] = useState('');
  const [examMonth, setExamMonth] = useState('');
  const [examOrganization, setExamOrganization] = useState('출제기관 선택');
  const [examOrganizationCustom, setExamOrganizationCustom] = useState('');
  const [examGrade, setExamGrade] = useState('');
  const [selectedExam, setSelectedExam] = useState('시험을 선택하세요');
  
  // 과목 선택
  const [selectedSubject, setSelectedSubject] = useState('과목 선택');
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState('');
  const [selectedMathCategory, setSelectedMathCategory] = useState('');
  const [selectedSocialCategory, setSelectedSocialCategory] = useState('');
  const [selectedScienceCategory, setSelectedScienceCategory] = useState('');
  const [selectedHistoryCategory, setSelectedHistoryCategory] = useState('');
  
  // 사용자 정의 문항 수
  const [customQuestionCount, setCustomQuestionCount] = useState('');
  const [customMultipleChoice, setCustomMultipleChoice] = useState('');
  const [customSubjective, setCustomSubjective] = useState('');
  
  // 정답 관련
  const [answerKey, setAnswerKey] = useState('');
  const [answerFileName, setAnswerFileName] = useState('');
  const [savedAnswerData, setSavedAnswerData] = useState<SavedAnswerData | null>(null);
  
  // 채점 파라미터
  const [threshold, setThreshold] = useState(100);
  const [tie, setTie] = useState(5);
  
  // examMeta 상태
  const [examMeta, setExamMeta] = useState<ExamMetaState>({
    examYear: null,
    examMonth: null,
    providerName: null,
    gradeLevel: null,
  });

  // 파생 상태 계산
  const isCustomSubject = selectedSubject === '기타';
  const isCustomOrganization = examOrganization === '기타';

  // 과목별 문항 수
  const getQuestionCount = useCallback(() => {
    if (selectedSubject === '국어') return 45;
    if (selectedSubject === '수학') return 30;
    if (selectedSubject === '영어') return 45;
    if (selectedSubject === '한국사') return 20;
    if (selectedSubject === '탐구') return 20;
    if (selectedSubject === '기타') return parseInt(customQuestionCount) || 0;
    return 0;
  }, [selectedSubject, customQuestionCount]);

  // subjectPreset 계산
  const subjectPreset = useMemo<SubjectPreset>(() => ({
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

  // API용 메타데이터 계산
  const examMetadataForApi = useMemo<ExamMetadataForApi | null>(() => {
    // 과목 코드 결정
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

    // 시험 코드 생성
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

  // 시험 정보 저장
  const handleExamSave = useCallback(() => {
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
  }, [examYear, examMonth, examOrganization, examOrganizationCustom, examGrade, isCustomOrganization]);

  // 상태 초기화
  const resetExamMetadata = useCallback(() => {
    setExamYear('');
    setExamMonth('');
    setExamOrganization('출제기관 선택');
    setExamOrganizationCustom('');
    setExamGrade('');
    setSelectedExam('시험을 선택하세요');
    setSelectedSubject('과목 선택');
    setSelectedSubjectCategory('');
    setSelectedMathCategory('');
    setSelectedSocialCategory('');
    setSelectedScienceCategory('');
    setSelectedHistoryCategory('');
    setCustomQuestionCount('');
    setCustomMultipleChoice('');
    setCustomSubjective('');
    setAnswerKey('');
    setAnswerFileName('');
    setSavedAnswerData(null);
    setExamMeta({
      examYear: null,
      examMonth: null,
      providerName: null,
      gradeLevel: null,
    });
  }, []);

  const value: ExamMetadataContextValue = {
    examYear,
    setExamYear,
    examMonth,
    setExamMonth,
    examOrganization,
    setExamOrganization,
    examOrganizationCustom,
    setExamOrganizationCustom,
    examGrade,
    setExamGrade,
    selectedExam,
    setSelectedExam,
    selectedSubject,
    setSelectedSubject,
    selectedSubjectCategory,
    setSelectedSubjectCategory,
    selectedMathCategory,
    setSelectedMathCategory,
    selectedSocialCategory,
    setSelectedSocialCategory,
    selectedScienceCategory,
    setSelestedScienceCategory: setSelectedScienceCategory,
    selectedHistoryCategory,
    setSelectedHistoryCategory,
    customQuestionCount,
    setCustomQuestionCount,
    customMultipleChoice,
    setCustomMultipleChoice,
    customSubjective,
    setCustomSubjective,
    answerKey,
    setAnswerKey,
    answerFileName,
    setAnswerFileName,
    savedAnswerData,
    setSavedAnswerData,
    threshold,
    setThreshold,
    tie,
    setTie,
    examMeta,
    setExamMeta,
    examMetadataForApi,
    subjectPreset,
    getQuestionCount,
    isCustomSubject,
    isCustomOrganization,
    handleExamSave,
    resetExamMetadata,
  };

  return (
    <ExamMetadataContext.Provider value={value}>
      {children}
    </ExamMetadataContext.Provider>
  );
}

export function useExamMetadataContext() {
  const context = useContext(ExamMetadataContext);
  if (!context) {
    throw new Error('useExamMetadataContext must be used within an ExamMetadataProvider');
  }
  return context;
}

/**
 * Exam presets and subject configuration
 * 
 * This file contains all exam-related preset data that is shared across:
 * - upload page (과목 선택, 문항 수, 배점 등)
 * - admin-exams (시험 정답 관리)
 * - results (채점 결과)
 * - individual-results (개별 성적표)
 */

// ============================================================================
// Subject Codes and Names
// ============================================================================

/**
 * Subject code to name mapping
 * Used for API communication and display
 */
export const SUBJECT_CODE_MAP: Record<string, string> = {
  // 주요 과목
  'KOR': '국어',
  'MATH': '수학',
  'ENG': '영어',
  'HIST': '한국사',
  
  // 국어 세부
  '1000': '국어',
  '1001': '화법과 작문',
  '1002': '언어와 매체',
  
  // 수학 세부
  '2000': '수학',
  '2001': '확률과 통계',
  '2002': '미적분',
  '2003': '기하',
  
  // 영어
  '3000': '영어',
  
  // 한국사
  '4000': '한국사',
  
  // 사회탐구
  '4111': '생활과 윤리',
  '4112': '윤리와 사상',
  '4113': '한국지리',
  '4114': '세계지리',
  '4115': '동아시아사',
  '4116': '세계사',
  '4117': '경제',
  '4118': '정치와 법',
  '4119': '사회·문화',
  
  // 과학탐구
  '4220': '물리학I',
  '4221': '화학I',
  '4222': '생명과학I',
  '4223': '지구과학I',
  '4224': '물리학II',
  '4225': '화학II',
  '4226': '생명과학II',
  '4227': '지구과학II',
};

/**
 * Name to subject code mapping (reverse lookup)
 */
export const SUBJECT_NAME_TO_CODE: Record<string, string> = {
  '국어': 'KOR',
  '수학': 'MATH',
  '영어': 'ENG',
  '한국사': 'HIST',
  '화법과 작문': '1001',
  '언어와 매체': '1002',
  '확률과 통계': '2001',
  '미적분': '2002',
  '기하': '2003',
  '생활과 윤리': '4111',
  '윤리와 사상': '4112',
  '한국지리': '4113',
  '세계지리': '4114',
  '동아시아사': '4115',
  '세계사': '4116',
  '경제': '4117',
  '정치와 법': '4118',
  '사회·문화': '4119',
  '물리학I': '4220',
  '화학I': '4221',
  '생명과학I': '4222',
  '지구과학I': '4223',
  '물리학II': '4224',
  '화학II': '4225',
  '생명과학II': '4226',
  '지구과학II': '4227',
};

// ============================================================================
// Subject Categories
// ============================================================================

export const MAIN_SUBJECTS = ['국어', '수학', '영어', '한국사', '탐구'] as const;
export type MainSubject = typeof MAIN_SUBJECTS[number];

export const SOCIAL_STUDIES = [
  '생활과 윤리',
  '윤리와 사상',
  '한국지리',
  '세계지리',
  '동아시아사',
  '세계사',
  '경제',
  '정치와 법',
  '사회·문화',
] as const;

export const SCIENCE_STUDIES = [
  '물리학I',
  '화학I',
  '생명과학I',
  '지구과학I',
  '물리학II',
  '화학II',
  '생명과학II',
  '지구과학II',
] as const;

export type SocialStudySubject = typeof SOCIAL_STUDIES[number];
export type ScienceStudySubject = typeof SCIENCE_STUDIES[number];

// ============================================================================
// Exam Configuration Types
// ============================================================================

export interface SubjectConfig {
  /** Total number of questions */
  questionCount: number;
  /** Number of multiple choice questions */
  multipleChoice: number;
  /** Number of subjective (short answer) questions */
  subjective: number;
  /** Maximum possible score */
  maxScore: number;
  /** Default points per question */
  defaultPoints: number;
  /** Question numbers that have 3 points (for 수능 style) */
  threePointQuestions?: number[];
  /** Subjective question numbers */
  subjectiveQuestions?: number[];
  /** Description for UI display */
  description: string;
}

export interface ExamTypeConfig {
  국어: SubjectConfig;
  수학: SubjectConfig;
  영어: SubjectConfig;
  한국사: SubjectConfig;
  탐구: SubjectConfig;
  기타: SubjectConfig;
}

// ============================================================================
// Exam Presets by Type
// ============================================================================

/**
 * 수능/모의평가 형식 - 평가원, 수능
 * KICE = Korea Institute for Curriculum and Evaluation (한국교육과정평가원)
 */
export const KICE_EXAM_PRESET: ExamTypeConfig = {
  국어: {
    questionCount: 45,
    multipleChoice: 45,
    subjective: 0,
    maxScore: 100,
    defaultPoints: 2,
    threePointQuestions: [1, 2, 3, 7, 10, 15, 16, 17, 24, 25, 31, 34, 38, 40, 42],
    description: '45문항 (객관식)',
  },
  수학: {
    questionCount: 30,
    multipleChoice: 22,
    subjective: 8,
    maxScore: 100,
    defaultPoints: 2,
    threePointQuestions: [3, 6, 9, 14, 15, 21, 26, 28, 29],
    subjectiveQuestions: [23, 24, 25, 26, 27, 28, 29, 30],
    description: '30문항 (객관식 22 + 단답형 8)',
  },
  영어: {
    questionCount: 45,
    multipleChoice: 45,
    subjective: 0,
    maxScore: 100,
    defaultPoints: 2,
    threePointQuestions: [21, 22, 23, 24, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
    description: '45문항 (객관식)',
  },
  한국사: {
    questionCount: 20,
    multipleChoice: 20,
    subjective: 0,
    maxScore: 50,
    defaultPoints: 2,
    threePointQuestions: [11, 12, 15, 16, 19, 20],
    description: '20문항 (객관식)',
  },
  탐구: {
    questionCount: 20,
    multipleChoice: 20,
    subjective: 0,
    maxScore: 50,
    defaultPoints: 2,
    threePointQuestions: [9, 11, 16, 17, 20],
    description: '20문항 (객관식)',
  },
  기타: {
    questionCount: 0,
    multipleChoice: 0,
    subjective: 0,
    maxScore: 100,
    defaultPoints: 2,
    description: '직접 문항 수 입력',
  },
};

/**
 * 교육청 모의고사 형식
 * Similar to KICE but may have slight variations
 */
export const EDU_OFFICE_EXAM_PRESET: ExamTypeConfig = {
  ...KICE_EXAM_PRESET,
};

/**
 * 사설 모의고사 형식 (대성, 이투스, 메가스터디 등)
 */
export const PRIVATE_EXAM_PRESET: ExamTypeConfig = {
  국어: {
    questionCount: 45,
    multipleChoice: 45,
    subjective: 0,
    maxScore: 100,
    defaultPoints: 2,
    threePointQuestions: [6, 8, 10, 12, 17, 20, 22, 27, 32, 35, 37, 40, 43, 44, 45],
    description: '45문항 (객관식)',
  },
  수학: {
    questionCount: 30,
    multipleChoice: 22,
    subjective: 8,
    maxScore: 100,
    defaultPoints: 2,
    threePointQuestions: [3, 6, 9, 14, 15, 21, 26, 28, 29],
    subjectiveQuestions: [23, 24, 25, 26, 27, 28, 29, 30],
    description: '30문항 (객관식 22 + 단답형 8)',
  },
  영어: {
    questionCount: 45,
    multipleChoice: 45,
    subjective: 0,
    maxScore: 100,
    defaultPoints: 2,
    threePointQuestions: [21, 22, 23, 24, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
    description: '45문항 (객관식)',
  },
  한국사: {
    questionCount: 20,
    multipleChoice: 20,
    subjective: 0,
    maxScore: 50,
    defaultPoints: 2,
    threePointQuestions: [11, 12, 15, 16, 19, 20],
    description: '20문항 (객관식)',
  },
  탐구: {
    questionCount: 20,
    multipleChoice: 20,
    subjective: 0,
    maxScore: 50,
    defaultPoints: 2,
    threePointQuestions: [9, 11, 16, 17, 20],
    description: '20문항 (객관식)',
  },
  기타: {
    questionCount: 0,
    multipleChoice: 0,
    subjective: 0,
    maxScore: 100,
    defaultPoints: 2,
    description: '직접 문항 수 입력',
  },
};

// ============================================================================
// Exam Provider Configuration
// ============================================================================

export type ExamProvider = 
  | '한국교육과정평가원'
  | '평가원'
  | '수능'
  | '교육청'
  | '대성'
  | '이투스'
  | '메가스터디'
  | '종로'
  | '진학사'
  | '유웨이'
  | 'SN'
  | '기타';

export const EXAM_PROVIDERS: { value: ExamProvider; label: string }[] = [
  { value: '한국교육과정평가원', label: '평가원 (한국교육과정평가원)' },
  { value: '수능', label: '수능' },
  { value: '교육청', label: '교육청' },
  { value: '대성', label: '대성' },
  { value: '이투스', label: '이투스' },
  { value: '메가스터디', label: '메가스터디' },
  { value: '종로', label: '종로' },
  { value: '진학사', label: '진학사' },
  { value: '유웨이', label: '유웨이' },
  { value: 'SN', label: 'SN' },
  { value: '기타', label: '기타 (직접 입력)' },
];

/**
 * Get exam preset based on provider
 */
export function getExamPresetByProvider(provider: string | null): ExamTypeConfig {
  if (!provider) return KICE_EXAM_PRESET;
  
  const normalizedProvider = provider.toLowerCase();
  
  // 평가원/수능 형식
  if (
    normalizedProvider.includes('평가원') ||
    normalizedProvider.includes('kice') ||
    normalizedProvider.includes('수능') ||
    normalizedProvider.includes('한국교육과정평가원')
  ) {
    return KICE_EXAM_PRESET;
  }
  
  // 교육청 형식
  if (normalizedProvider.includes('교육청')) {
    return EDU_OFFICE_EXAM_PRESET;
  }
  
  // 사설 모의고사
  if (
    normalizedProvider.includes('대성') ||
    normalizedProvider.includes('이투스') ||
    normalizedProvider.includes('메가') ||
    normalizedProvider.includes('종로') ||
    normalizedProvider.includes('진학사') ||
    normalizedProvider.includes('유웨이')
  ) {
    return PRIVATE_EXAM_PRESET;
  }
  
  // 기본값
  return KICE_EXAM_PRESET;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get subject configuration based on subject name and provider
 */
export function getSubjectConfig(
  subject: string,
  provider?: string | null
): SubjectConfig {
  const preset = getExamPresetByProvider(provider ?? null);
  
  // 탐구 과목 확인
  if (
    SOCIAL_STUDIES.includes(subject as SocialStudySubject) ||
    SCIENCE_STUDIES.includes(subject as ScienceStudySubject)
  ) {
    return preset.탐구;
  }
  
  // 주요 과목
  if (subject in preset) {
    return preset[subject as keyof ExamTypeConfig];
  }
  
  return preset.기타;
}

/**
 * Calculate points for each question based on preset
 */
export function getQuestionPoints(
  questionNumber: number,
  subject: string,
  provider?: string | null
): number {
  const config = getSubjectConfig(subject, provider);
  
  if (config.threePointQuestions?.includes(questionNumber)) {
    return 3;
  }
  
  // Special handling for 4-point questions (수학 29, 30번)
  if (subject === '수학' && [29, 30].includes(questionNumber)) {
    return 4;
  }
  
  return config.defaultPoints;
}

/**
 * Check if a question is subjective (short answer)
 */
export function isSubjectiveQuestion(
  questionNumber: number,
  subject: string,
  provider?: string | null
): boolean {
  const config = getSubjectConfig(subject, provider);
  return config.subjectiveQuestions?.includes(questionNumber) ?? false;
}

/**
 * Get subject code from name
 */
export function getSubjectCode(subjectName: string): string {
  return SUBJECT_NAME_TO_CODE[subjectName] || subjectName;
}

/**
 * Get subject name from code
 */
export function getSubjectName(subjectCode: string): string {
  return SUBJECT_CODE_MAP[subjectCode] || subjectCode;
}

/**
 * Generate default questions array for a subject
 */
export function generateDefaultQuestions(
  subject: string,
  provider?: string | null
): Array<{ number: number; points: number; correctAnswer: string; isSubjective: boolean }> {
  const config = getSubjectConfig(subject, provider);
  
  return Array.from({ length: config.questionCount }, (_, i) => {
    const num = i + 1;
    return {
      number: num,
      points: getQuestionPoints(num, subject, provider),
      correctAnswer: '',
      isSubjective: isSubjectiveQuestion(num, subject, provider),
    };
  });
}

/**
 * Get max score for a subject
 */
export function getMaxScore(subject: string, provider?: string | null): number {
  const config = getSubjectConfig(subject, provider);
  return config.maxScore;
}

/**
 * Get question count for a subject
 */
export function getQuestionCount(subject: string, provider?: string | null): number {
  const config = getSubjectConfig(subject, provider);
  return config.questionCount;
}

// ============================================================================
// Default Grade Cutoffs
// ============================================================================

export interface GradeCutoff {
  grade: number;
  minScore: number;
  standardScore: number;
  percentile?: number;
}

/**
 * Default grade cutoffs (can be customized per exam)
 */
export const DEFAULT_GRADE_CUTOFFS: GradeCutoff[] = [
  { grade: 1, minScore: 90, standardScore: 130 },
  { grade: 2, minScore: 80, standardScore: 120 },
  { grade: 3, minScore: 70, standardScore: 110 },
  { grade: 4, minScore: 60, standardScore: 100 },
  { grade: 5, minScore: 50, standardScore: 90 },
  { grade: 6, minScore: 40, standardScore: 80 },
  { grade: 7, minScore: 30, standardScore: 70 },
  { grade: 8, minScore: 20, standardScore: 60 },
  { grade: 9, minScore: 0, standardScore: 50 },
];

// ============================================================================
// Select Options for UI
// ============================================================================

export const SUBJECT_OPTIONS = [
  { value: '국어', label: '국어' },
  { value: '수학', label: '수학' },
  { value: '영어', label: '영어' },
  { value: '한국사', label: '한국사' },
  { value: '탐구', label: '탐구' },
  { value: '기타', label: '기타' },
] as const;

export const SOCIAL_STUDY_OPTIONS = SOCIAL_STUDIES.map(s => ({
  value: s,
  label: s,
}));

export const SCIENCE_STUDY_OPTIONS = SCIENCE_STUDIES.map(s => ({
  value: s,
  label: s,
}));

export const YEAR_OPTIONS = [
  '2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020'
].map(y => ({ value: `${y}년도`, label: `${y}년도` }));

export const MONTH_OPTIONS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
].map(m => ({ value: m, label: m }));

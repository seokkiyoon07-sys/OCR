// Admin Exams types
export interface GradeCutoff {
  grade: number;
  minScore: number;
  standardScore: number;
}

export interface QuestionMetadata {
  electiveSubject?: string;
  [key: string]: string | undefined;
}

export interface ExamQuestion {
  questionNumber: number;
  correctAnswer: string;
  points: number;
  metadata?: QuestionMetadata | null;
}

export interface ExamSubject {
  subjectCode: string;
  subjectName: string;
  questionCount: number | null;
  studentCount: number;
}

export interface Exam {
  id: string;
  name: string;
  examType: '모의고사' | '일반시험';
  subject: string;
  subjectCode?: string;
  providerName?: string;
  examYear?: number;
  examMonth?: number;
  examCode?: string;
  gradeLevel?: string;
  date: string;
  totalQuestions: number | null;
  studentCount?: number;
  questions: ExamQuestion[];
  gradeCutoffs: GradeCutoff[];
  createdAt?: string;
  // 계층적 구조를 위한 과목 목록
  subjects?: ExamSubject[];
}

// API 응답 타입 - 평탄한 구조 (기존 호환)
export interface ExamFromAPI {
  id: string;
  name: string;
  providerName?: string;
  examYear?: number;
  examMonth?: number;
  examCode?: string;
  gradeLevel?: string;
  subjectCode?: string;
  subjectName?: string;
  totalQuestions: number | null;
  studentCount?: number;
  createdAt?: string;
}

// API 응답 타입 - 그룹화된 계층 구조
export interface ExamGroupedFromAPI {
  id: string;
  name: string;
  providerName?: string;
  examYear?: number;
  examMonth?: number;
  examCode?: string;
  gradeLevel?: string;
  createdAt?: string;
  subjects: ExamSubject[];
  totalQuestions: number;
  totalStudents: number;
}

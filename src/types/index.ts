/**
 * 애플리케이션 전체에서 사용되는 타입 정의
 */

// 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// 시험 관련 타입
export interface Exam {
  id: string;
  title: string;
  subject: string;
  year: number;
  month: number;
  organization: string;
  grade: number;
  questionCount: number;
  multipleChoiceCount: number;
  subjectiveCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 채점 결과 타입
export interface GradingResult {
  id: string;
  examId: string;
  studentId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  answers: AnswerResult[];
  createdAt: Date;
}

export interface AnswerResult {
  questionNumber: number;
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  score: number;
  type: 'multiple' | 'subjective';
}

// 파일 업로드 타입
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 폼 상태 타입
export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// 모달 상태 타입
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

// 드롭다운 상태 타입
export interface DropdownState {
  isOpen: boolean;
  selectedValue: string;
  options: DropdownOption[];
}

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// 검색 필터 타입
export interface SearchFilters {
  subject?: string;
  year?: number;
  month?: number;
  organization?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 통계 타입
export interface Statistics {
  totalExams: number;
  totalGradings: number;
  averageScore: number;
  accuracy: number;
  monthlyGrowth: number;
}

// 설정 타입
export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    dataRetention: number; // days
    shareAnalytics: boolean;
  };
}

// 에러 타입
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// 이벤트 타입
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

// 유틸리티 타입
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 업로드 페이지 관련 타입 정의

export interface NameIssue {
  file_name: string;
  recognized_name: string | null;
  issue_type: string;
  affected_syllables: number[];
  block_image_path?: string;
  corrected_name?: string;
}

export interface NameIssuesData {
  total_files: number;
  issues_found: number;
  issues: NameIssue[];
}

export interface GradingReport {
  total_pages: number;
  processed_pages: number;
  csv_rows: number;
  missing_pages: number[];
  names_corrected: boolean;
}

export interface GradeResponse {
  log?: string;
  csv_url?: string;
  json_url?: string;
  zip_url?: string;
  name_issues?: NameIssuesData | null;
  grading_report?: GradingReport | null;
  [key: string]: unknown;
}

export interface ExamMetaState {
  examYear: number | null;
  examMonth: number | null;
  providerName: string | null;
  gradeLevel: string | null;
}

export interface ExamMetadataForApi {
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

export interface GradingProgress {
  current: number;
  total: number;
  status: string;
}

export interface SavedAnswerData {
  answers: Record<string, string>;
  scores: Record<string, string>;
  mathElectiveAnswers?: Record<string, { answers: Record<string, string>; scores: Record<string, string> }>;
  explorationAnswers?: Record<string, { answers: Record<string, string>; scores: Record<string, string> }>;
  selectedMathElective?: string;
  selectedExplorationSubject?: string;
  // Exam metadata - auto-populated when loading from DB
  examYear?: number | null;
  examMonth?: number | null;
  providerName?: string | null;
  examCode?: string | null;
  subjectCode?: string;
  subjectName?: string;
}

export interface GradeInfoItem {
  score: number;
  standardScore: string;
  percentile: string;
  grade: string;
  testTakers: string;
}

export interface FindAnswerResult {
  subjectCode: string;
  subjectName: string;
  examCode: string | null;
  examLabel: string | null;
  providerName: string | null;
  examYear: number | null;
  examMonth: number | null;
  questionCount: number;
}

export interface SubjectPreset {
  subject: string;
  subjectCategory: string;
  customQuestionCount: number | null;
  customMultipleChoice: number | null;
  customSubjective: number | null;
}

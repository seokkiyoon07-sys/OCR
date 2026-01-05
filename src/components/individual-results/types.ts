// Types for individual-results components

export interface Student {
  id: string;
  studentNumber: string;
  username: string;
  name: string;
  grade: string | null;
  studyRoom: string | null;
  seat: string | null;
  track: string | null;
  academicYear: number | null;
  hasExamResults: boolean;
  examCount: number;
}

export interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  rawScore: number | null;
  standardScore: number | null;
  grade: number | null;
  percentile: number | null;
  correctCount: number;
  totalQuestions: number;
}

export interface ExamResult {
  providerName: string;
  examCode: string;
  gradeLevel: string;
  examYear: number;
  examMonth: number;
  subjects: SubjectResult[];
}

export interface MonthData {
  month: string;
  year: number;
  monthNum: number;
  exams: ExamResult[];
}

export interface StudentSummary {
  studentId: string;
  months: MonthData[];
  subjectLatest: Record<string, SubjectResult & { examMonth: string }>;
  totalExamCount: number;
}

export interface QuestionResponse {
  number: number;
  markedChoice: number | null;
  markedText: string | null;
  correctChoice: number | null;
  correctText: string | null;
  points: number | null;
  isCorrect: boolean;
  examCode: string;
  subjectCode: string;
  subjectName: string;
}

export interface ExamInfo {
  name: string;
  providerName: string;
  examYear: number;
  examMonth: number;
  examCode: string;
  gradeLevel: string;
  subjectCode: string;
  subjectName: string;
  studentCount: number;
  avgScore: number | null;
  lastUpdated: string | null;
}

export interface ExamMonthGroup {
  month: string;
  year: number;
  monthNum: number;
  exams: ExamInfo[];
}

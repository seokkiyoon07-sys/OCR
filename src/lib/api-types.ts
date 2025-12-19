/**
 * API 응답 타입 정의 및 검증
 */

// 기본 API 응답 타입
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  userId: string;
  message?: string;
}

// 파일 업로드 응답 타입
export interface UploadResponse {
  id: string;
  fileName: string;
  size: number;
  status: 'processing' | 'completed' | 'failed';
}

// 채점 결과 응답 타입
export interface GradingResult {
  studentId: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: Array<{
    questionNumber: number;
    studentAnswer: string;
    correctAnswer: string;
  }>;
}

// 타입 가드 함수들
export function isLoginResponse(data: any): data is LoginResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.userId === 'string' &&
    data.userId.trim().length > 0
  );
}

export function isUploadResponse(data: any): data is UploadResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.fileName === 'string' &&
    typeof data.size === 'number' &&
    ['processing', 'completed', 'failed'].includes(data.status)
  );
}

export function isGradingResult(data: any): data is GradingResult {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.studentId === 'string' &&
    typeof data.subject === 'string' &&
    typeof data.score === 'number' &&
    typeof data.totalQuestions === 'number' &&
    typeof data.correctAnswers === 'number' &&
    Array.isArray(data.wrongAnswers)
  );
}

// API 응답 검증 헬퍼
export function validateApiResponse<T>(
  response: any,
  validator?: (data: any) => data is T
): ApiResponse<T> {
  if (typeof response !== 'object' || response === null) {
    return {
      ok: false,
      error: 'Invalid response format'
    };
  }

  // 기본 응답 구조 검증
  if (typeof response.ok !== 'boolean') {
    return {
      ok: false,
      error: 'Invalid response structure'
    };
  }

  // 데이터 검증
  if (response.ok && response.data && validator) {
    if (!validator(response.data)) {
      return {
        ok: false,
        error: 'Invalid response data format'
      };
    }
  }

  return response;
}

// 안전한 fetch 래퍼
export async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  validator?: (data: any) => data is T
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      return {
        ok: false,
        error: data.message || data.error || `HTTP ${response.status}`,
      };
    }

    // 성공 응답을 ApiResponse 형태로 변환
    const apiResponse = {
      ok: true,
      data: data,
      message: data.message,
    };

    return validateApiResponse(apiResponse, validator);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
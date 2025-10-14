/**
 * 에러 핸들링 및 안정성 관련 유틸리티
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 에러 타입 정의
export type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UPLOAD_ERROR'
  | 'PROCESSING_ERROR'
  | 'UNKNOWN_ERROR';

// 에러 메시지 매핑
export const ERROR_MESSAGES: Record<ErrorType, string> = {
  VALIDATION_ERROR: '입력값이 올바르지 않습니다.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  UPLOAD_ERROR: '파일 업로드 중 오류가 발생했습니다.',
  PROCESSING_ERROR: '처리 중 오류가 발생했습니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};

// 안전한 함수 실행 래퍼
export async function safeExecute<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    console.error('Safe execute error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: fallback
    };
  }
}

// 재시도 로직
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

// 입력 검증
export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw new AppError(
      `${fieldName}은(는) 필수 입력 항목입니다.`,
      'VALIDATION_ERROR',
      400
    );
  }
}

export function validateRange(
  value: number, 
  min: number, 
  max: number, 
  fieldName: string
): void {
  if (value < min || value > max) {
    throw new AppError(
      `${fieldName}은(는) ${min}~${max} 범위 내에서 입력해주세요.`,
      'VALIDATION_ERROR',
      400
    );
  }
}

// 타입 가드
export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

// 안전한 JSON 파싱
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

// 안전한 JSON 직렬화
export function safeJsonStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}

// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 쓰로틀 함수
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

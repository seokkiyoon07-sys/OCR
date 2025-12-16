/**
 * 보안 관련 유틸리티 함수들
 */

// XSS 방지를 위한 HTML 이스케이프
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 입력 값 검증
export function validateInput(input: string, type: 'email' | 'text' | 'number'): boolean {
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input) && input.length <= 254;
    
    case 'text':
      return input.length <= 1000 && !/<script|javascript:|on\w+=/i.test(input);
    
    case 'number':
      const num = Number(input);
      return !isNaN(num) && num >= 0 && num <= 1000000;
    
    default:
      return false;
  }
}

// 파일 업로드 검증
export function validateFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (file.size > maxSize) {
    return { isValid: false, error: '파일 크기는 100MB를 초과할 수 없습니다.' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'JPG, PNG, PDF 파일만 업로드 가능합니다.' };
  }
  
  return { isValid: true };
}

// SQL 인젝션 방지를 위한 입력 정리
export function sanitizeInput(input: string): string {
  return input
    .replace(/['"`;\\]/g, '') // 위험한 문자 제거
    .trim()
    .substring(0, 1000); // 길이 제한
}

// CSRF 토큰 생성 (클라이언트 사이드)
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 안전한 로컬 스토리지 사용
export function safeLocalStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {
    console.warn('LocalStorage is not available');
  }
  return null;
}

// 안전한 세션 스토리지 사용
export function safeSessionStorage() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage;
    }
  } catch (e) {
    console.warn('SessionStorage is not available');
  }
  return null;
}

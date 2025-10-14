/**
 * 접근성 관련 유틸리티 함수들
 */

// ARIA 라벨 생성
export function generateAriaLabel(element: string, context?: string): string {
  if (context) {
    return `${element}, ${context}`;
  }
  return element;
}

// 키보드 네비게이션을 위한 키 코드
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

// 포커스 관리
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

// 스크린 리더를 위한 라이브 영역
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// 색상 대비 검사
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  isAccessible: boolean;
  level: 'AA' | 'AAA' | 'FAIL';
} {
  // 간단한 대비 계산 (실제로는 더 정교한 알고리즘 필요)
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  let level: 'AA' | 'AAA' | 'FAIL';
  if (ratio >= 7) level = 'AAA';
  else if (ratio >= 4.5) level = 'AA';
  else level = 'FAIL';
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    isAccessible: ratio >= 4.5,
    level
  };
}

// 헥스 색상을 RGB로 변환
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// 키보드 접근성을 위한 이벤트 핸들러
export function createKeyboardHandler(
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void
) {
  return (e: React.KeyboardEvent) => {
    switch (e.key) {
      case KEYBOARD_KEYS.ENTER:
        onEnter?.();
        break;
      case KEYBOARD_KEYS.SPACE:
        e.preventDefault();
        onSpace?.();
        break;
      case KEYBOARD_KEYS.ESCAPE:
        onEscape?.();
        break;
    }
  };
}

// 스크린 리더 전용 텍스트
export function createScreenReaderText(text: string): JSX.Element {
  return (
    <span className="sr-only" aria-live="polite">
      {text}
    </span>
  );
}

// 접근성 검증
export function validateAccessibility(element: HTMLElement): {
  hasLabel: boolean;
  hasRole: boolean;
  isKeyboardAccessible: boolean;
  hasColorContrast: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // 라벨 검사
  const hasLabel = !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.querySelector('label')
  );
  
  if (!hasLabel) {
    issues.push('요소에 접근 가능한 라벨이 없습니다.');
  }
  
  // 역할 검사
  const hasRole = !!element.getAttribute('role');
  
  // 키보드 접근성 검사
  const isKeyboardAccessible = !(
    element.getAttribute('tabindex') === '-1' ||
    element.hasAttribute('disabled')
  );
  
  if (!isKeyboardAccessible) {
    issues.push('키보드로 접근할 수 없습니다.');
  }
  
  // 색상 대비 검사 (간단한 버전)
  const computedStyle = window.getComputedStyle(element);
  const color = computedStyle.color;
  const backgroundColor = computedStyle.backgroundColor;
  
  const contrast = checkColorContrast(color, backgroundColor);
  const hasColorContrast = contrast.isAccessible;
  
  if (!hasColorContrast) {
    issues.push(`색상 대비가 부족합니다. (현재: ${contrast.ratio}:1, 권장: 4.5:1 이상)`);
  }
  
  return {
    hasLabel,
    hasRole,
    isKeyboardAccessible,
    hasColorContrast,
    issues
  };
}

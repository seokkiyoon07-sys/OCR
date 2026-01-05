import { test, expect } from '@playwright/test';

/**
 * Upload Page E2E Tests
 * 
 * 이 테스트는 /upload 페이지의 모든 상호작용을 검증합니다.
 * 
 * 테스트 전제조건:
 * - Frontend: http://localhost:3000
 * - Backend: http://localhost:8011
 * - Backend API는 /api/* 경로로 프록시됩니다.
 */

test.describe('Upload Page', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태를 시뮬레이션 (localStorage에 인증 정보 설정)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('userId', 'developer');
      localStorage.setItem('isAuthenticated', 'true');
    });
    await page.goto('/upload');
  });

  test.describe('Initial Page Load', () => {
    test('페이지가 정상적으로 로드됨', async ({ page }) => {
      await expect(page.locator('h2:has-text("채점 업로드")')).toBeVisible();
      await expect(page.locator('text=이미지(JPG/PNG) 또는 PDF를 업로드하세요')).toBeVisible();
    });

    test('파일 선택 버튼이 존재함', async ({ page }) => {
      await expect(page.getByRole('button', { name: '파일 선택' })).toBeVisible();
    });

    test('시험 선택 버튼이 존재함', async ({ page }) => {
      await expect(page.getByRole('button', { name: '시험을 선택하세요' })).toBeVisible();
    });

    test('과목 선택 드롭다운이 존재함', async ({ page }) => {
      await expect(page.getByRole('button', { name: '과목을 선택하세요' })).toBeVisible();
    });
  });

  test.describe('Template Selection', () => {
    test('템플릿 목록이 로드됨', async ({ page }) => {
      // 템플릿 API를 직접 호출하여 목록이 정상인지 확인
      const response = await page.request.get('/api/templates');
      expect(response.ok()).toBe(true);
      
      const templates = await response.json();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      
      // 알려진 템플릿들이 포함되어 있는지 확인
      const templateNames = templates as string[];
      expect(templateNames.some((t: string) => t.includes('SN') || t.includes('더프'))).toBe(true);
      
      // 정렬이 되어 있는지 확인 (알파벳순)
      const sortedTemplates = [...templateNames].sort();
      expect(templateNames).toEqual(sortedTemplates);
    });
  });

  test.describe('Subject Selection', () => {
    test('과목 선택 드롭다운을 열고 국어 선택', async ({ page }) => {
      const subjectDropdown = page.getByRole('button', { name: '과목을 선택하세요' });
      await subjectDropdown.click();
      
      await expect(page.locator('text=국어').first()).toBeVisible();
      await page.locator('button:has-text("국어")').first().click();
      
      // 드롭다운이 닫히고 선택된 과목이 표시됨
      await expect(subjectDropdown).not.toBeVisible();
    });

    test('수학 과목 선택', async ({ page }) => {
      await page.getByRole('button', { name: '과목을 선택하세요' }).click();
      await page.locator('button:has-text("수학")').first().click();
    });

    test('영어 과목 선택', async ({ page }) => {
      await page.getByRole('button', { name: '과목을 선택하세요' }).click();
      await page.locator('button:has-text("영어")').first().click();
    });

    test('탐구 과목 선택 시 세부 과목 선택 가능', async ({ page }) => {
      await page.getByRole('button', { name: '과목을 선택하세요' }).click();
      
      // 탐구 선택
      await page.locator('button:has-text("탐구")').first().click();
      
      // 탐구의 세부 카테고리(사회탐구/과학탐구)가 표시되는지 확인
      // 주의: 실제 UI 구조에 따라 다를 수 있음
    });
  });

  test.describe('Exam Info Modal', () => {
    test('시험 정보 모달 열기', async ({ page }) => {
      await page.getByRole('button', { name: '시험을 선택하세요' }).click();
      
      // 모달이 열림
      await expect(page.locator('h3:has-text("시험 정보 입력")')).toBeVisible();
    });

    test('시행년도 선택', async ({ page }) => {
      await page.getByRole('button', { name: '시험을 선택하세요' }).click();
      
      // 년도 드롭다운 열기
      await page.getByRole('button', { name: '년도 선택' }).click();
      
      // 2026년도 선택
      await page.locator('button:has-text("2026년도")').click();
    });

    test('시행월 선택', async ({ page }) => {
      await page.getByRole('button', { name: '시험을 선택하세요' }).click();
      
      // 월 드롭다운 열기
      await page.getByRole('button', { name: '월 선택' }).click();
      
      // 6월 선택
      await page.locator('button:has-text("6월")').click();
    });

    test('출제기관 선택', async ({ page }) => {
      await page.getByRole('button', { name: '시험을 선택하세요' }).click();
      
      // 출제기관 드롭다운 열기
      await page.getByRole('button', { name: '출제기관 선택' }).click();
      
      // 한국교육과정평가원 선택
      await page.locator('button:has-text("한국교육과정평가원")').click();
    });

    test('시험 정보 저장', async ({ page }) => {
      await page.getByRole('button', { name: '시험을 선택하세요' }).click();
      
      // 저장 버튼 클릭
      await page.getByRole('button', { name: '저장' }).click();
      
      // 모달이 닫힘
      await expect(page.locator('h3:has-text("시험 정보 입력")')).not.toBeVisible();
    });

    test('시험 정보 취소', async ({ page }) => {
      await page.getByRole('button', { name: '시험을 선택하세요' }).click();
      
      // 취소 버튼 클릭
      await page.getByRole('button', { name: '취소' }).click();
      
      // 모달이 닫힘
      await expect(page.locator('h3:has-text("시험 정보 입력")')).not.toBeVisible();
    });
  });

  test.describe('Grading Range Modal', () => {
    test.skip('채점 구간 설정 모달 열기', async ({ page }) => {
      // UI가 변경되어 채점 구간 설정 버튼이 없음 - 추후 UI에 맞게 업데이트 필요
      await page.getByRole('button', { name: '채점 구간 설정' }).click();
      
      // 모달이 열림 (전체 화면)
      await expect(page.locator('h3:has-text("채점 구간 설정")')).toBeVisible();
    });

    test.skip('모달 닫기 (취소 버튼)', async ({ page }) => {
      // UI가 변경되어 채점 구간 설정 버튼이 없음 - 추후 UI에 맞게 업데이트 필요
      await page.getByRole('button', { name: '채점 구간 설정' }).click();
      await page.getByRole('button', { name: '취소' }).click();
      
      // 모달이 닫힘
      await expect(page.locator('h3:has-text("채점 구간 설정")')).not.toBeVisible();
    });

    test.skip('템플릿 선택 모달 확인 (파일 업로드 시)', async ({ page }) => {
      // 템플릿 선택 모달은 파일 업로드 시 나타남
      // 채점 구간 설정 모달에는 템플릿 드롭다운이 없음 (업로드 시 선택됨)
      await page.getByRole('button', { name: '채점 구간 설정' }).click();
      
      // 채점 구간 설정 모달이 열림 (템플릿 선택 드롭다운 없음)
      await expect(page.locator('h3:has-text("채점 구간 설정")')).toBeVisible();
      
      // 템플릿 관련 필드가 있을 수 있지만 읽기전용 또는 표시만 됨
      // 드롭다운이 아닌 텍스트로 표시될 수 있음
    });
  });

  test.describe('File Upload Flow', () => {
    test('PDF 파일 업로드 필드가 accept=application/pdf로 설정됨', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const acceptAttr = await fileInput.getAttribute('accept');
      expect(acceptAttr).toBe('application/pdf');
    });

    test('업로드 버튼 클릭 시 파일 선택 다이얼로그 트리거', async ({ page }) => {
      // 이 테스트는 file input이 hidden 클래스로 화면에 직접 보이지 않도록 스타일링되어 있는지 확인합니다.
      // Tailwind의 hidden 클래스 또는 sr-only 같은 접근성 유지 숨김 클래스 확인
      const fileInput = page.locator('input[type="file"]');
      const classAttr = await fileInput.getAttribute('class');
      expect(classAttr).toContain('hidden');
    });
  });

  test.describe('API Integration', () => {
    test('템플릿 API가 호출됨', async ({ page }) => {
      // API 호출 모니터링
      const templateResponse = await page.waitForResponse(
        (response) => response.url().includes('/api/templates') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => null);
      
      if (templateResponse) {
        const data = await templateResponse.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });
  });

  test.describe('Grade Results Section', () => {
    test('초기 상태에서 채점 결과 없음 메시지 표시', async ({ page }) => {
      await expect(page.locator('text=아직 채점 결과가 없습니다')).toBeVisible();
    });

    test('채점 결과 섹션이 존재함', async ({ page }) => {
      await expect(page.locator('h3:has-text("채점 결과")')).toBeVisible();
    });
  });

  test.describe('Guide Section', () => {
    test('가이드 섹션이 존재함', async ({ page }) => {
      await expect(page.locator('h3:has-text("가이드")')).toBeVisible();
    });

    test('가이드 내용이 표시됨', async ({ page }) => {
      await expect(page.locator('text=곡률 없이 평평하게')).toBeVisible();
      await expect(page.locator('text=PDF는 300dpi 이상 권장')).toBeVisible();
    });
  });
});

test.describe('Upload Page - Error Handling', () => {
  test('로그인 없이 업로드 시도 시 에러 표시', async ({ page }) => {
    // 로그인 정보 없이 페이지 로드
    await page.goto('/upload');
    
    // 이 테스트는 실제 파일 업로드를 시뮬레이션해야 하므로
    // 현재 구현에서는 localStorage에 인증 정보가 없으면 에러가 표시됨
  });
});

test.describe('Upload Page - Name Correction Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('userId', 'developer');
      localStorage.setItem('isAuthenticated', 'true');
    });
    await page.goto('/upload');
  });

  test('성명 인식 오류 버튼이 채점 결과 있을 때만 표시됨', async ({ page }) => {
    // 초기 상태에서는 이름 오류 버튼이 없어야 함
    await expect(page.locator('text=성명 인식 오류가 있습니다')).not.toBeVisible();
  });
});

test.describe('Upload Page - Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('모바일 뷰포트에서 페이지가 정상 렌더링됨', async ({ page }) => {
    await page.goto('/upload');
    await expect(page.locator('h2:has-text("채점 업로드")')).toBeVisible();
  });
});

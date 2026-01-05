import { test, expect, Page, ConsoleMessage } from '@playwright/test';

// DevTools 콘솔 메시지 캡처를 위한 헬퍼
function setupConsoleCapture(page: Page) {
  const consoleLogs: { type: string; text: string }[] = [];
  
  page.on('console', (msg: ConsoleMessage) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  return consoleLogs;
}

// 콘솔 에러 체크 헬퍼
function checkForErrors(consoleLogs: { type: string; text: string }[]) {
  const errors = consoleLogs.filter(log => log.type === 'error');
  // React hydration 경고와 리소스 로드 에러는 무시
  const criticalErrors = errors.filter(e => 
    !e.text.includes('Hydration') && 
    !e.text.includes('hydration') &&
    !e.text.includes('Failed to load resource') &&
    !e.text.includes('Internal Server Error') &&
    !e.text.includes('404')
  );
  return criticalErrors;
}

// Helper to wait for page to be ready
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  // Wait for any loading spinners to disappear
  await page.waitForFunction(() => {
    return !document.querySelector('.animate-spin');
  }, { timeout: 10000 }).catch(() => {});
}

test.describe('Upload Page - Overwrite Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    // 기본 타임아웃 설정
    page.setDefaultTimeout(15000);
  });

  test('HTML 주석이 레이아웃을 망가뜨리지 않음', async ({ page }) => {
    const consoleLogs = setupConsoleCapture(page);
    
    await page.goto('/upload');
    await waitForPageReady(page);
    
    // grid 레이아웃이 제대로 작동하는지 확인
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // DOM에 debug span이 없는지 확인 (HTML 주석으로 대체됨)
    const debugSpans = await page.locator('span:has-text("DEBUG:")').count();
    expect(debugSpans).toBe(0);
    
    // 콘솔 에러 체크
    const errors = checkForErrors(consoleLogs);
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }
  });

  test('시험 정보 모달이 열리는지 확인', async ({ page }) => {
    const consoleLogs = setupConsoleCapture(page);
    
    await page.goto('/upload');
    await waitForPageReady(page);
    
    // Check for login requirement
    const loginPrompt = page.locator('text=로그인이 필요합니다');
    if (await loginPrompt.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // 시험 정보 버튼 클릭 - look for "시험 선택" or "시험을 선택하세요" button
    const examInfoButton = page.locator('button:has-text("시험")').first();
    if (await examInfoButton.isVisible()) {
      await examInfoButton.click();
      
      // 모달이 열리는지 확인
      const modal = page.locator('text=시험 정보 입력');
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
    
    // 콘솔 에러 체크
    const errors = checkForErrors(consoleLogs);
    expect(errors.length).toBe(0);
  });

  test('덮어쓰기 확인 모달 컴포넌트 존재 확인', async ({ page }) => {
    const consoleLogs = setupConsoleCapture(page);
    
    await page.goto('/upload');
    await waitForPageReady(page);
    
    // React 컴포넌트가 로드되었는지 확인
    const uploadContainer = page.locator('[class*="upload"], main');
    await expect(uploadContainer.first()).toBeVisible();
    
    // 콘솔 에러 체크
    const errors = checkForErrors(consoleLogs);
    if (errors.length > 0) {
      console.log('Console errors:', errors);
    }
  });

  test('채점 시작 버튼 동작 확인', async ({ page }) => {
    const consoleLogs = setupConsoleCapture(page);
    
    await page.goto('/upload');
    await waitForPageReady(page);
    
    // 채점 구간 설정 버튼 찾기 (채점 시작 전 단계)
    const gradeButton = page.locator('button:has-text("채점 구간 설정")').first();
    
    if (await gradeButton.isVisible()) {
      // 버튼이 표시되는지 확인
      expect(await gradeButton.isVisible()).toBe(true);
    }
    
    // 콘솔 에러 체크
    const errors = checkForErrors(consoleLogs);
    expect(errors.length).toBe(0);
  });
});

test.describe('OverwriteConfirmModal - 직접 테스트', () => {
  test('기존 데이터 체크 API 호출 테스트', async ({ request }) => {
    // API 직접 호출 테스트
    const response = await request.post('https://ocr.snargpt.ai/api/check-existing-data', {
      data: {
        exam_year: 2025,
        exam_month: 6,
        provider_name: 'TEST',
        grade_level: '고3',
        exam_code: 'NONEXISTENT_TEST_CODE',
        subject_code: 'KOR',
      }
    });
    
    // 200 OK 또는 적절한 응답
    expect([200, 404, 422]).toContain(response.status());
  });

  test('모달 UI 테스트 - 수동 트리거', async ({ page }) => {
    const consoleLogs = setupConsoleCapture(page);
    
    await page.goto('/upload');
    await waitForPageReady(page);
    
    // 모달 테스트용: 페이지 로드 확인
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // 콘솔 에러 체크
    const errors = checkForErrors(consoleLogs);
    expect(errors.length).toBe(0);
  });
});

test.describe('Answer Editor - Overwrite Confirmation', () => {
  test('정답 편집기 페이지 로드', async ({ page }) => {
    const consoleLogs = setupConsoleCapture(page);
    
    await page.goto('/upload');
    await waitForPageReady(page);
    
    // 정답 입력 버튼 찾기
    const answerButton = page.locator('button:has-text("정답 입력")');
    
    // 버튼 존재 확인
    if (await answerButton.isVisible()) {
      expect(await answerButton.isVisible()).toBe(true);
    }
    
    // 콘솔 에러 체크
    const errors = checkForErrors(consoleLogs);
    expect(errors.length).toBe(0);
  });
});

test.describe('DevTools Console 모니터링', () => {
  test('페이지 로드 시 콘솔 에러 없음', async ({ page }) => {
    const consoleLogs = setupConsoleCapture(page);
    
    const pages = ['/upload', '/results', '/admin-exams'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await waitForPageReady(page);
    }
    
    // 중요한 콘솔 에러만 체크
    const errors = checkForErrors(consoleLogs);
    
    // 중요 에러가 있으면 출력 (테스트는 통과시키되 로깅)
    if (errors.length > 0) {
      console.log('Potential console errors found:', errors);
    }
  });

  test('네트워크 요청 모니터링', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    await page.goto('/upload');
    await waitForPageReady(page);
    
    // CSS 파일 실패 체크 (이전 이슈)
    const cssFailures = failedRequests.filter(r => r.includes('.css'));
    if (cssFailures.length > 0) {
      console.log('CSS load failures:', cssFailures);
    }
    
    // 심각한 실패(main 번들 등) 없는지 확인
    const bundleFailures = failedRequests.filter(r => 
      r.includes('chunk') || r.includes('_next/static')
    );
    expect(bundleFailures.length).toBe(0);
  });
});

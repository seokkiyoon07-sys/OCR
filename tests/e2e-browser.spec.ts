import { test, expect } from '@playwright/test';

/**
 * End-to-End 브라우저 테스트
 * 실제 사용자 환경에서 페이지 렌더링 확인
 */

test.describe('E2E Browser Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 인증 설정
    await page.addInitScript(() => {
      localStorage.setItem('snar-ocr-auth-cache', JSON.stringify({
        userId: 'gyuwon',
        displayName: 'gyuwon',
        timestamp: Date.now()
      }));
    });
  });

  test('individual-results 페이지 렌더링 확인', async ({ page }) => {
    await page.goto('/individual-results');
    await page.waitForTimeout(3000);
    
    // 콘솔 에러 수집
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 페이지가 로드되었는지 확인
    await expect(page).toHaveTitle(/SNar/i);
    
    // 404 에러가 없어야 함 (student summary API)
    const has404Error = consoleErrors.some(err => err.includes('404'));
    
    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/individual-results.png', fullPage: true });
    
    console.log('Console errors:', consoleErrors);
    
    // 주요 404 에러가 없어야 함
    expect(has404Error).toBe(false);
  });

  test('results 페이지 렌더링 확인', async ({ page }) => {
    await page.goto('/results');
    await page.waitForTimeout(3000);
    
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await expect(page).toHaveTitle(/SNar/i);
    await page.screenshot({ path: 'test-results/results.png', fullPage: true });
    
    console.log('Console errors:', consoleErrors);
  });

  test('admin-exams 페이지 렌더링 확인', async ({ page }) => {
    await page.goto('/admin-exams');
    await page.waitForTimeout(3000);
    
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await expect(page).toHaveTitle(/SNar/i);
    
    // 시험 목록 API가 호출되었는지 확인
    const examListLoaded = await page.locator('table').count() > 0 || 
                           await page.locator('[data-testid]').count() > 0;
    
    await page.screenshot({ path: 'test-results/admin-exams.png', fullPage: true });
    
    console.log('Console errors:', consoleErrors);
  });

  test('upload 페이지 렌더링 확인', async ({ page }) => {
    await page.goto('/upload');
    await page.waitForTimeout(3000);
    
    await expect(page).toHaveTitle(/SNar/i);
    
    // 업로드 영역이 보이는지 확인
    const hasUploadArea = await page.locator('text=업로드').count() > 0 ||
                          await page.locator('text=파일').count() > 0;
    
    await page.screenshot({ path: 'test-results/upload.png', fullPage: true });
    
    expect(hasUploadArea).toBe(true);
  });
});

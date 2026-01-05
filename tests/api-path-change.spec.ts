import { test, expect } from '@playwright/test';

test.describe('API 경로 변경 테스트', () => {
  test('individual-results 페이지에서 /api/ 경로로 API 호출 확인', async ({ page }) => {
    // API 요청 가로채기
    const apiRequests: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/') || url.includes('/backend/')) {
        apiRequests.push(url);
        console.log('API Request:', url);
      }
    });

    // individual-results 페이지 방문
    await page.goto('https://ocr.snargpt.ai/individual-results');
    
    // 페이지 로드 대기
    await page.waitForTimeout(2000);
    
    // /api/ 경로로 요청이 있는지 확인
    const hasApiRequests = apiRequests.some(url => url.includes('/api/'));
    const hasBackendRequests = apiRequests.some(url => url.includes('/backend/'));
    
    console.log('All API requests:', apiRequests);
    console.log('Has /api/ requests:', hasApiRequests);
    console.log('Has /backend/ requests:', hasBackendRequests);
    
    expect(hasApiRequests).toBe(true);
    expect(hasBackendRequests).toBe(false);
  });

  test('results 페이지에서 /api/ 경로로 API 호출 확인', async ({ page }) => {
    const apiRequests: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/') || url.includes('/backend/')) {
        apiRequests.push(url);
      }
    });

    await page.goto('https://ocr.snargpt.ai/results');
    await page.waitForTimeout(2000);
    
    const hasApiRequests = apiRequests.some(url => url.includes('/api/'));
    const hasBackendRequests = apiRequests.some(url => url.includes('/backend/'));
    
    console.log('Results page API requests:', apiRequests);
    
    expect(hasApiRequests).toBe(true);
    expect(hasBackendRequests).toBe(false);
  });

  test('admin-exams 페이지에서 /api/ 경로로 API 호출 확인', async ({ page }) => {
    const apiRequests: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/') || url.includes('/backend/')) {
        apiRequests.push(url);
      }
    });

    await page.goto('https://ocr.snargpt.ai/admin-exams');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const hasApiRequests = apiRequests.some(url => url.includes('/api/'));
    const hasBackendRequests = apiRequests.some(url => url.includes('/backend/'));
    
    console.log('Admin-exams page API requests:', apiRequests);
    
    // admin-exams는 인증이 필요하므로 API 요청이 없을 수도 있음
    // 대신 /backend/ 요청이 없는지만 확인
    expect(hasBackendRequests).toBe(false);
  });
});

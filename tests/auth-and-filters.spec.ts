import { test, expect } from '@playwright/test';

test.describe('Auth and Filters Tests', () => {
  /**
   * Test results page renders correctly
   * When authenticated: shows exam results or "등록된 시험이 없습니다"
   * When not authenticated: shows "로그인이 필요합니다"
   */
  test('results page renders correctly (with or without auth)', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://ocr.snargpt.ai/results');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const pageText = await page.textContent('body');
    
    // Page should show either login prompt OR actual content
    const hasLoginPrompt = pageText?.includes('로그인이 필요합니다');
    const hasContent = pageText?.includes('채점결과') || 
                       pageText?.includes('등록된 시험이 없습니다') ||
                       pageText?.includes('학력평가');
    
    expect(hasLoginPrompt || hasContent).toBe(true);
    
    await context.close();
  });

  /**
   * Test individual-results page renders correctly
   */
  test('individual-results page renders correctly (with or without auth)', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://ocr.snargpt.ai/individual-results');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const pageText = await page.textContent('body');
    
    // Page should show either login prompt OR actual content
    const hasLoginPrompt = pageText?.includes('로그인이 필요합니다');
    const hasContent = pageText?.includes('개별 채점 결과') || 
                       pageText?.includes('채점결과') ||
                       pageText?.includes('학생 목록');
    
    expect(hasLoginPrompt || hasContent).toBe(true);
    
    await context.close();
  });

  test('API returns students with short year format (25)', async ({ request }) => {
    // After the change, the API uses raw academic_year values (25, not 2025)
    const response = await request.get('https://ocr.snargpt.ai/api/students?academic_year=25');
    const data = await response.json();
    
    expect(data.students).toBeDefined();
    expect(data.students.length).toBeGreaterThan(100); // Should have 294 students
    
    // Check grades distribution
    const grades = new Set(data.students.map((s: any) => s.grade));
    expect(grades.has(4)).toBe(true);
    expect(grades.has(5)).toBe(true);
    expect(grades.has(6)).toBe(true);
  });

  test('API returns correct academic years', async ({ request }) => {
    const response = await request.get('https://ocr.snargpt.ai/api/students/academic-years');
    const data = await response.json();
    
    expect(data.years).toBeDefined();
    expect(data.years).toContain(2025);
    expect(data.years).toContain(2026);
  });
});

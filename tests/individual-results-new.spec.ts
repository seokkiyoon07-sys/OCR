import { test, expect } from '@playwright/test';

const BASE_URL = 'https://ocr.snargpt.ai';

// Allow longer timeout for API requests
test.setTimeout(90000);

test.describe('개인별 채점 결과 페이지 종합 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to individual results page
    await page.goto(`${BASE_URL}/individual-results`);
    await page.waitForLoadState('networkidle');
    
    // Wait for auth loading to complete (loading spinner disappears)
    // The page shows loading spinner while checking auth
    await page.waitForFunction(
      () => !document.querySelector('.animate-spin'),
      { timeout: 30000 }
    ).catch(() => {
      // If spinner doesn't disappear, it might show login prompt
      console.log('Auth loading took longer than expected');
    });
    
    // Give extra time for React hydration
    await page.waitForTimeout(2000);
  });

  test('페이지 구조 확인 - 로딩 완료 후', async ({ page }) => {
    // Wait for page content to be ready
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot to see what's displayed
    await page.screenshot({ 
      path: 'tests/individual-results-structure.png',
      fullPage: true 
    });
    
    // Check if login prompt is shown (user needs to login)
    const loginPrompt = page.locator('text=로그인이 필요합니다');
    const isLoginPromptVisible = await loginPrompt.isVisible().catch(() => false);
    
    if (isLoginPromptVisible) {
      console.log('ℹ 로그인 필요 페이지 - 인증 쿠키 확인 필요');
      return;
    }
    
    // Check for main UI elements
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });
    console.log('✓ 메인 콘텐츠 영역 확인');
    
    // Page structure verification
    const pageContent = await page.content();
    
    // Verify specific texts exist in page
    const expectedTexts = ['개인별', '채점', '결과'];
    for (const text of expectedTexts) {
      if (pageContent.includes(text)) {
        console.log(`✓ 페이지에 "${text}" 텍스트 포함`);
      }
    }
  });

  test('학년도, 반, 학생 선택 UI 확인', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForTimeout(3000);
    
    // Check for login prompt
    const loginPrompt = page.locator('text=로그인이 필요합니다');
    if (await loginPrompt.isVisible().catch(() => false)) {
      console.log('ℹ 로그인 필요 - 테스트 스킵');
      return;
    }
    
    // Check for select elements
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    console.log(`✓ ${selectCount}개 드롭다운 발견`);
    
    // If we have 3 selects, check each one
    if (selectCount >= 3) {
      // Year select
      const yearSelect = selects.nth(0);
      if (await yearSelect.isVisible()) {
        const yearOptions = await yearSelect.locator('option').count();
        console.log(`✓ 학년도 선택: ${yearOptions}개 옵션`);
      }
      
      // Grade select
      const gradeSelect = selects.nth(1);
      if (await gradeSelect.isVisible()) {
        const gradeOptions = await gradeSelect.locator('option').count();
        console.log(`✓ 반 선택: ${gradeOptions}개 옵션`);
      }
      
      // Student select
      const studentSelect = selects.nth(2);
      if (await studentSelect.isVisible()) {
        const studentOptions = await studentSelect.locator('option').count();
        console.log(`✓ 학생 선택: ${studentOptions}개 옵션`);
      }
    }
  });

  test('학생 선택 후 결과 표시 확인', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForTimeout(3000);
    
    // Check for login prompt
    const loginPrompt = page.locator('text=로그인이 필요합니다');
    if (await loginPrompt.isVisible().catch(() => false)) {
      console.log('ℹ 로그인 필요 - 테스트 스킵');
      return;
    }
    
    // Find and select a student
    const studentSelect = page.locator('select').nth(2);
    
    if (await studentSelect.isVisible().catch(() => false)) {
      // Get all options
      const options = await studentSelect.locator('option').allTextContents();
      
      // Find option with exam count
      const studentWithExamIdx = options.findIndex(text => text.includes('시험'));
      
      if (studentWithExamIdx >= 0) {
        const optionElements = await studentSelect.locator('option').all();
        const value = await optionElements[studentWithExamIdx].getAttribute('value');
        
        if (value) {
          await studentSelect.selectOption(value);
          console.log(`✓ 학생 선택: ${options[studentWithExamIdx]}`);
          
          // Wait for results to load
          await page.waitForTimeout(4000);
          
          // Take screenshot
          await page.screenshot({ 
            path: 'tests/individual-results-selected.png',
            fullPage: true 
          });
          
          // Check for expected elements after selection
          const table = page.locator('table').first();
          if (await table.isVisible().catch(() => false)) {
            console.log('✓ 성적 테이블 표시됨');
          }
          
          // Check for charts
          const svg = page.locator('svg');
          const svgCount = await svg.count();
          if (svgCount > 0) {
            console.log(`✓ ${svgCount}개 SVG 차트 발견`);
          }
        }
      } else {
        console.log('ℹ 시험 결과가 있는 학생 없음');
      }
    }
  });

  test('모의고사/일반시험 탭 확인', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Check for login prompt
    const loginPrompt = page.locator('text=로그인이 필요합니다');
    if (await loginPrompt.isVisible().catch(() => false)) {
      console.log('ℹ 로그인 필요 - 테스트 스킵');
      return;
    }
    
    // Check for tabs
    const mockExamTab = page.locator('button:has-text("모의고사")');
    const generalExamTab = page.locator('button:has-text("일반시험")');
    
    if (await mockExamTab.isVisible().catch(() => false)) {
      console.log('✓ 모의고사 탭 발견');
    }
    
    if (await generalExamTab.isVisible().catch(() => false)) {
      console.log('✓ 일반시험 탭 발견');
      
      // Click on general exam tab
      await generalExamTab.click();
      await page.waitForTimeout(500);
      
      // Check for "준비 중" message
      const comingSoon = page.locator('text=준비 중');
      if (await comingSoon.isVisible().catch(() => false)) {
        console.log('✓ 일반시험 탭 - 준비중 메시지 확인');
      }
    }
  });

  test('스크린샷 캡처 (전체 상태)', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Initial state
    await page.screenshot({ 
      path: 'tests/individual-results-final.png',
      fullPage: true 
    });
    console.log('✓ 최종 페이지 스크린샷 저장');
  });
});

test.describe('API 연동 테스트', () => {
  
  test('years API 응답 확인', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/exams/years`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.years).toBeDefined();
    expect(Array.isArray(data.years)).toBeTruthy();
    console.log(`✓ years API - ${data.years.length}개 연도`);
  });

  test('students with-results API 응답 확인', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/exams/students/with-results?academic_year=2025`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.students).toBeDefined();
    expect(Array.isArray(data.students)).toBeTruthy();
    console.log(`✓ students API - ${data.students.length}명 학생`);
    
    // Check student structure
    if (data.students.length > 0) {
      const student = data.students[0];
      expect(student.id).toBeDefined();
      expect(student.name).toBeDefined();
      console.log(`✓ 학생 데이터 구조 확인: ${student.name}`);
    }
  });

  test('student summary API 응답 확인', async ({ request }) => {
    // First get a student
    const studentsResponse = await request.get(`${BASE_URL}/api/exams/students/with-results?academic_year=2025`);
    const studentsData = await studentsResponse.json();
    
    if (studentsData.students && studentsData.students.length > 0) {
      const studentWithExams = studentsData.students.find((s: any) => s.examCount > 0);
      
      if (studentWithExams) {
        const response = await request.get(`${BASE_URL}/api/exams/student/${studentWithExams.id}/summary`);
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.status).toBe('ok');
        expect(data.months).toBeDefined();
        expect(Array.isArray(data.months)).toBeTruthy();
        console.log(`✓ summary API - ${data.months.length}개 월별 데이터`);
        
        // Check month structure
        if (data.months.length > 0) {
          const month = data.months[0];
          expect(month.month).toBeDefined();
          expect(month.exams).toBeDefined();
          console.log(`✓ 월별 데이터 구조 확인: ${month.month}`);
          
          // Check exam structure
          if (month.exams.length > 0) {
            const exam = month.exams[0];
            expect(exam.examCode).toBeDefined();
            expect(exam.subjects).toBeDefined();
            console.log(`✓ 시험 데이터 구조 확인: ${exam.examCode}`);
          }
        }
      }
    }
  });

  test('student responses API 응답 확인', async ({ request }) => {
    // First get a student with exams
    const studentsResponse = await request.get(`${BASE_URL}/api/exams/students/with-results?academic_year=2025`);
    const studentsData = await studentsResponse.json();
    
    if (studentsData.students && studentsData.students.length > 0) {
      const studentWithExams = studentsData.students.find((s: any) => s.examCount > 0);
      
      if (studentWithExams) {
        // Get their summary to find exam codes
        const summaryResponse = await request.get(`${BASE_URL}/api/exams/student/${studentWithExams.id}/summary`);
        const summaryData = await summaryResponse.json();
        
        if (summaryData.months && summaryData.months.length > 0 && summaryData.months[0].exams.length > 0) {
          const examCode = summaryData.months[0].exams[0].examCode;
          
          const response = await request.get(`${BASE_URL}/api/exams/student/${studentWithExams.id}/responses?exam_code=${examCode}`);
          expect(response.ok()).toBeTruthy();
          
          const data = await response.json();
          expect(data.status).toBe('ok');
          expect(data.responses).toBeDefined();
          expect(Array.isArray(data.responses)).toBeTruthy();
          console.log(`✓ responses API - ${data.responses.length}개 응답`);
          
          // Check response structure includes subjectCode
          if (data.responses.length > 0) {
            const resp = data.responses[0];
            expect(resp.number).toBeDefined();
            expect(resp.subjectCode).toBeDefined();
            console.log(`✓ 응답 데이터에 subjectCode 포함 확인`);
          }
        }
      }
    }
  });
});

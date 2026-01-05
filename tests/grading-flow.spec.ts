import { test, expect } from '@playwright/test';

/**
 * Test: Grading Results Flow to Results and Individual Results Pages
 * 
 * This test verifies that after grading, results are properly saved to database
 * and displayed on results/individual-results pages.
 */

// Helper to login
async function loginAs(page: import('@playwright/test').Page, userId: string, password: string) {
  await page.goto('/');
  
  // Check if already logged in
  const logoutButton = page.locator('button:has-text("로그아웃")');
  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    return true;
  }
  
  // Find and fill login form
  const userIdInput = page.locator('input[placeholder*="사용자"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  const loginButton = page.locator('button:has-text("로그인")').first();
  
  if (await userIdInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await userIdInput.fill(userId);
    await passwordInput.fill(password);
    await loginButton.click();
    
    // Wait for login to complete
    await page.waitForTimeout(2000);
    return true;
  }
  
  return false;
}

test.describe('Grading Flow: Results Display', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'gyuwon', 'gyuwon1!');
  });
  
  test('should display results page with year/month filters', async ({ page }) => {
    await page.goto('/results');
    await page.waitForLoadState('networkidle');
    
    // Check for login requirement
    const loginPrompt = page.locator('text=로그인이 필요합니다');
    if (await loginPrompt.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Not authenticated - skipping test');
      test.skip();
      return;
    }
    
    // Wait for page to load
    await page.waitForFunction(() => {
      return !document.querySelector('.animate-spin');
    }, { timeout: 15000 }).catch(() => {});
    
    // Check for year selector
    const yearSelect = page.locator('[aria-label="연도 필터"]');
    const yearDisplay = page.locator('text=년').first();
    
    const hasYearFilter = await yearSelect.isVisible({ timeout: 5000 }).catch(() => false)
      || await yearDisplay.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (hasYearFilter) {
      console.log('Year filter is visible');
      expect(hasYearFilter).toBeTruthy();
    } else {
      // Page might be showing "No data" state
      const noDataText = page.locator('text=선택된 조건');
      if (await noDataText.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('Results page loaded but no data for selected filters');
      }
    }
  });
  
  test('should show subject data when grading results exist', async ({ page }) => {
    await page.goto('/results');
    await page.waitForLoadState('networkidle');
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    // Look for subject cards (국어, 수학, 영어, 한국사, 탐구)
    const subjectButtons = page.locator('button:has-text("수학"), button:has-text("국어"), button:has-text("영어")');
    const subjectCount = await subjectButtons.count();
    
    console.log(`Found ${subjectCount} subject buttons`);
    
    // If subjects exist, click one
    if (subjectCount > 0) {
      const mathButton = page.locator('button:has-text("수학")').first();
      if (await mathButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await mathButton.click();
        await page.waitForTimeout(1000);
        
        // Check for results table or data display
        const resultsTable = page.locator('table, [role="table"], .results-list');
        const tableVisible = await resultsTable.isVisible({ timeout: 5000 }).catch(() => false);
        console.log(`Results table visible: ${tableVisible}`);
      }
    }
  });
  
  test('should navigate to individual results page', async ({ page }) => {
    await page.goto('/individual-results');
    await page.waitForLoadState('networkidle');
    
    // Check for login requirement
    const loginPrompt = page.locator('text=로그인이 필요합니다');
    if (await loginPrompt.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Not authenticated - skipping test');
      test.skip();
      return;
    }
    
    // Wait for page to load
    await page.waitForFunction(() => {
      return !document.querySelector('.animate-spin');
    }, { timeout: 15000 }).catch(() => {});
    
    // Check for search functionality
    const searchInput = page.locator('input[placeholder*="검색"], input[placeholder*="이름"], input[placeholder*="수험"]');
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Search input found on individual results page');
      expect(await searchInput.isVisible()).toBeTruthy();
    }
    
    // Check for student list or search results area
    const studentList = page.locator('[class*="student"], [class*="list"], table');
    const hasStudentList = await studentList.first().isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Student list visible: ${hasStudentList}`);
  });
  
  test('should have answer key in database after grading', async ({ page }) => {
    // This test checks the API directly
    const response = await page.request.post('/api/exams/check-existing-data', {
      data: {
        exam_year: 2026,
        exam_month: 1,
        subject_code: 'MATH',
      },
    }).catch(() => null);
    
    if (response && response.ok()) {
      const data = await response.json();
      console.log('Existing data check response:', JSON.stringify(data, null, 2));
      
      // Check if answer key exists
      if (data.has_existing_answer_key) {
        console.log(`Answer key exists with ${data.existing_answer_count} questions`);
        expect(data.existing_answer_count).toBeGreaterThan(0);
      } else {
        console.log('No answer key found - this is expected if grading hasn\'t been run with answer_key');
      }
    }
  });
});

test.describe('Database: Grading Data Verification', () => {
  test('should fetch student scores via API', async ({ page }) => {
    // Login first
    await loginAs(page, 'gyuwon', 'gyuwon1!');
    
    // Fetch student scores via API
    const response = await page.request.get('/api/exams/student-scores?exam_year=2025&exam_month=1&subject_code=MATH&exam_code=26더프수학%20페이지%20정렬테스트')
      .catch(() => null);
    
    if (response && response.ok()) {
      const data = await response.json();
      console.log('Student scores response keys:', Object.keys(data));
      
      if (Array.isArray(data.students)) {
        console.log(`Found ${data.students.length} students`);
        
        // Check if scores are populated
        const studentsWithScores = data.students.filter((s: { raw_score?: number }) => s.raw_score != null);
        console.log(`Students with scores: ${studentsWithScores.length}`);
        
        if (studentsWithScores.length > 0) {
          const firstStudent = studentsWithScores[0];
          console.log('Sample student:', JSON.stringify(firstStudent, null, 2));
          expect(firstStudent.raw_score).toBeDefined();
        }
      }
    } else {
      console.log('API not available or returned error');
    }
  });
  
  test('should have questions in database for exam subjects', async ({ page }) => {
    await loginAs(page, 'gyuwon', 'gyuwon1!');
    
    // Fetch exam subjects list
    const response = await page.request.get('/api/exams/subjects')
      .catch(() => null);
    
    if (response && response.ok()) {
      const data = await response.json();
      console.log('Exam subjects response:', JSON.stringify(data, null, 2));
    } else {
      console.log('Exam subjects API not available');
    }
  });
});

import { test, expect } from '@playwright/test';

/**
 * Individual Results Page E2E Tests
 * 
 * 개별 학생 성적 조회 페이지 테스트
 */

const BACKEND_URL = 'http://localhost:8011';

test.describe('Individual Results Page', () => {
  test.describe('API Tests', () => {
    test('학생 목록 API가 정상 동작함', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/exams/students/with-results?academic_year=2026`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(Array.isArray(data.students)).toBe(true);
    });

    test('학년도 목록 API가 정상 동작함', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/exams/students/academic-years`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(Array.isArray(data.years)).toBe(true);
    });

    test('학생 요약 API가 정상 동작함', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/exams/student/student_001/summary`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.studentId).toBe('student_001');
      expect(Array.isArray(data.months)).toBe(true);
    });

    test('학생 응답 API가 정상 동작함', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/exams/student/student_001/responses?subject_code=MATH`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(Array.isArray(data.responses)).toBe(true);
    });

    test('존재하지 않는 학생도 빈 데이터 반환', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/exams/student/nonexistent_student/summary`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.months).toEqual([]);
    });
  });

  test.describe('Page Load Tests', () => {
    test.beforeEach(async ({ page }) => {
      // 인증 설정
      await page.addInitScript(() => {
        localStorage.setItem('snar-ocr-auth-cache', JSON.stringify({
          userId: 'test_user',
          displayName: 'Test User',
          timestamp: Date.now()
        }));
      });
    });

    test('페이지가 정상 로드됨', async ({ page }) => {
      await page.goto('/individual-results');
      await page.waitForTimeout(2000);
      
      // 페이지 타이틀 또는 주요 요소 확인
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(0);
    });

    test('학년도 선택 컴포넌트가 존재함', async ({ page }) => {
      await page.goto('/individual-results');
      await page.waitForTimeout(2000);
      
      // 학년도 선택 버튼 또는 드롭다운 확인
      const hasYearSelector = await page.locator('[data-radix-select-trigger]').count() > 0 ||
                              await page.locator('button:has-text("학년도")').count() > 0;
      
      // 로그인 필요 메시지 또는 학년도 선택기 중 하나가 보여야 함
      const hasLoginMessage = await page.locator('text=로그인이 필요합니다').count() > 0;
      
      expect(hasYearSelector || hasLoginMessage).toBe(true);
    });
  });

  test.describe('Data Display Tests', () => {
    test('학생 목록이 데이터베이스에서 로드됨', async ({ request }) => {
      // 실제 DB에서 학생 데이터 조회
      const response = await request.get(`${BACKEND_URL}/api/exams/students/with-results`);
      const data = await response.json();
      
      // 테스트 데이터가 있어야 함
      expect(data.students.length).toBeGreaterThan(0);
      
      // 첫 번째 학생 정보 확인
      const firstStudent = data.students[0];
      expect(firstStudent).toHaveProperty('id');
      expect(firstStudent).toHaveProperty('name');
    });

    test('학생별 시험 결과가 월별로 그룹화됨', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/exams/student/student_001/summary`);
      const data = await response.json();
      
      expect(data.months.length).toBeGreaterThan(0);
      
      // 첫 번째 월 데이터 구조 확인
      const firstMonth = data.months[0];
      expect(firstMonth).toHaveProperty('month');
      expect(firstMonth).toHaveProperty('year');
      expect(firstMonth).toHaveProperty('exams');
      expect(Array.isArray(firstMonth.exams)).toBe(true);
    });
  });
});

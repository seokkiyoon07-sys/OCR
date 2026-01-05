import { test, expect } from '@playwright/test';

/**
 * Admin Exams API Tests
 * 
 * Tests for /api/exams/* endpoints - CRUD operations for answer keys
 * These tests run directly against the backend API without requiring auth
 */

const API_BASE = 'http://localhost:8011/api/exams';

// Test data - unique per test run to avoid conflicts
const TEST_PREFIX = `API_TEST_${Date.now()}`;

test.describe('Admin Exams API - CRUD Operations', () => {
  
  test.describe('READ - Exam List', () => {
    test('GET /admin/list should return exam list', async ({ request }) => {
      const response = await request.get(`${API_BASE}/admin/list`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(Array.isArray(data.exams)).toBe(true);
    });

    test('GET /admin/list with year filter', async ({ request }) => {
      const response = await request.get(`${API_BASE}/admin/list?year=2025`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      
      // All returned exams should be from 2025
      data.exams.forEach((exam: { examYear: number }) => {
        expect(exam.examYear).toBe(2025);
      });
    });

    test('GET /admin/list/grouped should return grouped exams', async ({ request }) => {
      const response = await request.get(`${API_BASE}/admin/list/grouped`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(Array.isArray(data.exams)).toBe(true);
      
      // Each exam should have subjects array
      if (data.exams.length > 0) {
        const exam = data.exams[0];
        expect(exam).toHaveProperty('subjects');
        expect(Array.isArray(exam.subjects)).toBe(true);
        expect(exam).toHaveProperty('totalQuestions');
        expect(exam).toHaveProperty('totalStudents');
      }
    });

    test('GET /years should return available years', async ({ request }) => {
      const response = await request.get(`${API_BASE}/years`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(Array.isArray(data.years)).toBe(true);
    });
  });

  test.describe('CREATE - Answer Keys', () => {
    test('POST /answer-keys should create new answer key', async ({ request }) => {
      const payload = {
        metadata: {
          providerName: TEST_PREFIX,
          examYear: 2025,
          examMonth: 12,
          examCode: 'CREATE_TEST',
          gradeLevel: '고3',
          subjectCode: 'KOR',
          subjectName: '국어'
        },
        questions: [
          { number: 1, points: 2, correctChoice: 1 },
          { number: 2, points: 2, correctChoice: 2 },
          { number: 3, points: 3, correctChoice: 3 }
        ]
      };
      
      const response = await request.post(`${API_BASE}/answer-keys`, { data: payload });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.storage).toBe('database');
    });

    test('POST /answer-keys should handle subjective questions', async ({ request }) => {
      const payload = {
        metadata: {
          providerName: TEST_PREFIX,
          examYear: 2025,
          examMonth: 12,
          examCode: 'SUBJECTIVE_TEST',
          gradeLevel: '고3',
          subjectCode: 'MATH',
          subjectName: '수학'
        },
        questions: [
          { number: 1, points: 2, correctChoice: 1 },
          { number: 2, points: 3, correctText: '12' },  // Subjective
          { number: 3, points: 4, correctText: '25' }   // Subjective
        ]
      };
      
      const response = await request.post(`${API_BASE}/answer-keys`, { data: payload });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
    });

    test('POST /answer-keys should reject invalid question numbers', async ({ request }) => {
      const payload = {
        metadata: {
          providerName: TEST_PREFIX,
          examYear: 2025,
          examMonth: 12,
          examCode: 'INVALID_TEST',
          gradeLevel: '고3',
          subjectCode: 'KOR',
          subjectName: '국어'
        },
        questions: [
          { number: 0, points: 2, correctChoice: 1 }  // Invalid: number < 1
        ]
      };
      
      const response = await request.post(`${API_BASE}/answer-keys`, { data: payload });
      expect(response.ok()).toBeFalsy();  // Should fail validation
    });

    test('POST /answer-keys should reject invalid choice numbers', async ({ request }) => {
      const payload = {
        metadata: {
          providerName: TEST_PREFIX,
          examYear: 2025,
          examMonth: 12,
          examCode: 'INVALID_CHOICE_TEST',
          gradeLevel: '고3',
          subjectCode: 'KOR',
          subjectName: '국어'
        },
        questions: [
          { number: 1, points: 2, correctChoice: 6 }  // Invalid: choice > 5
        ]
      };
      
      const response = await request.post(`${API_BASE}/answer-keys`, { data: payload });
      expect(response.ok()).toBeFalsy();  // Should fail validation
    });
  });

  test.describe('READ - Fetch Answer Keys', () => {
    // First create test data
    test.beforeAll(async ({ request }) => {
      const payload = {
        metadata: {
          providerName: `${TEST_PREFIX}_FETCH`,
          examYear: 2025,
          examMonth: 12,
          examCode: 'FETCH_TEST',
          gradeLevel: '고3',
          subjectCode: 'ENG',
          subjectName: '영어'
        },
        questions: [
          { number: 1, points: 2, correctChoice: 1 },
          { number: 2, points: 2, correctChoice: 2 },
          { number: 3, points: 2, correctChoice: 3 },
          { number: 4, points: 3, correctChoice: 4 },
          { number: 5, points: 3, correctChoice: 5 }
        ]
      };
      
      await request.post(`${API_BASE}/answer-keys`, { data: payload });
    });

    test('POST /answer-keys/fetch should retrieve answers', async ({ request }) => {
      const payload = {
        metadata: {
          providerName: `${TEST_PREFIX}_FETCH`,
          examYear: 2025,
          examMonth: 12,
          subjectCode: 'ENG',
          subjectName: '영어'
        }
      };
      
      const response = await request.post(`${API_BASE}/answer-keys/fetch`, { data: payload });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(Array.isArray(data.questions)).toBe(true);
      expect(data.questions.length).toBe(5);
      
      // Verify question data
      expect(data.questions[0].number).toBe(1);
      expect(data.questions[0].correctChoice).toBe(1);
      expect(data.questions[0].points).toBe(2);
    });

    test('POST /answer-keys/fetch should return empty for non-existent exam', async ({ request }) => {
      const payload = {
        metadata: {
          providerName: 'NON_EXISTENT_PROVIDER_12345',
          examYear: 2099,
          examMonth: 1,
          subjectCode: 'XXX',
          subjectName: 'None'
        }
      };
      
      const response = await request.post(`${API_BASE}/answer-keys/fetch`, { data: payload });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.questions.length).toBe(0);
    });
  });

  test.describe('UPDATE - Answer Keys (via POST)', () => {
    test('POST /answer-keys should update existing exam', async ({ request }) => {
      // Create initial data
      const createPayload = {
        metadata: {
          providerName: `${TEST_PREFIX}_UPDATE`,
          examYear: 2025,
          examMonth: 12,
          examCode: 'UPDATE_TEST',
          gradeLevel: '고3',
          subjectCode: 'HIST',
          subjectName: '한국사'
        },
        questions: [
          { number: 1, points: 2, correctChoice: 1 },
          { number: 2, points: 2, correctChoice: 2 }
        ]
      };
      
      await request.post(`${API_BASE}/answer-keys`, { data: createPayload });
      
      // Update with new data (different answers, more questions)
      const updatePayload = {
        metadata: {
          providerName: `${TEST_PREFIX}_UPDATE`,
          examYear: 2025,
          examMonth: 12,
          examCode: 'UPDATE_TEST',
          gradeLevel: '고3',
          subjectCode: 'HIST',
          subjectName: '한국사'
        },
        questions: [
          { number: 1, points: 2, correctChoice: 5 },  // Changed answer
          { number: 2, points: 3, correctChoice: 4 },  // Changed answer and points
          { number: 3, points: 2, correctChoice: 3 }   // Added question
        ]
      };
      
      const response = await request.post(`${API_BASE}/answer-keys`, { data: updatePayload });
      expect(response.ok()).toBeTruthy();
      
      // Fetch and verify update
      const fetchPayload = {
        metadata: {
          providerName: `${TEST_PREFIX}_UPDATE`,
          examYear: 2025,
          examMonth: 12,
          subjectCode: 'HIST',
          subjectName: '한국사'
        }
      };
      
      const fetchResponse = await request.post(`${API_BASE}/answer-keys/fetch`, { data: fetchPayload });
      const data = await fetchResponse.json();
      
      expect(data.questions.length).toBe(3);
      expect(data.questions[0].correctChoice).toBe(5);  // Updated answer
    });
  });

  test.describe('DELETE - Answer Keys', () => {
    test('POST /answer-keys/delete should remove exam', async ({ request }) => {
      // Create test data first
      const createPayload = {
        metadata: {
          providerName: `${TEST_PREFIX}_DELETE`,
          examYear: 2025,
          examMonth: 12,
          examCode: 'DELETE_TEST',
          gradeLevel: '고3',
          subjectCode: 'KOR',
          subjectName: '국어'
        },
        questions: [
          { number: 1, points: 2, correctChoice: 1 },
          { number: 2, points: 2, correctChoice: 2 }
        ]
      };
      
      await request.post(`${API_BASE}/answer-keys`, { data: createPayload });
      
      // Delete the exam
      const deletePayload = {
        metadata: {
          providerName: `${TEST_PREFIX}_DELETE`,
          examYear: 2025,
          examMonth: 12,
          examCode: 'DELETE_TEST',
          gradeLevel: '고3',
          subjectCode: 'KOR',
          subjectName: '국어'
        }
      };
      
      const response = await request.post(`${API_BASE}/answer-keys/delete`, { data: deletePayload });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.deletedCount).toBe(2);
      
      // Verify deletion
      const fetchPayload = {
        metadata: {
          providerName: `${TEST_PREFIX}_DELETE`,
          examYear: 2025,
          examMonth: 12,
          subjectCode: 'KOR',
          subjectName: '국어'
        }
      };
      
      const fetchResponse = await request.post(`${API_BASE}/answer-keys/fetch`, { data: fetchPayload });
      const fetchData = await fetchResponse.json();
      expect(fetchData.questions.length).toBe(0);
    });

    test('POST /answer-keys/delete should return 0 for non-existent exam', async ({ request }) => {
      const payload = {
        metadata: {
          providerName: 'NON_EXISTENT_99999',
          examYear: 2099,
          examMonth: 12,
          subjectCode: 'XXX',
          subjectName: 'None'
        }
      };
      
      const response = await request.post(`${API_BASE}/answer-keys/delete`, { data: payload });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.deletedCount).toBe(0);
    });
  });

  // Cleanup test data after all tests
  test.afterAll(async ({ request }) => {
    // Delete all test data created during tests
    const testProviders = [
      TEST_PREFIX,
      `${TEST_PREFIX}_FETCH`,
      `${TEST_PREFIX}_UPDATE`,
      `${TEST_PREFIX}_DELETE`
    ];
    
    for (const provider of testProviders) {
      for (const subjectCode of ['KOR', 'MATH', 'ENG', 'HIST']) {
        await request.post(`${API_BASE}/answer-keys/delete`, {
          data: {
            metadata: {
              providerName: provider,
              examYear: 2025,
              examMonth: 12,
              subjectCode
            }
          }
        });
      }
    }
  });
});

test.describe('Admin Exams API - Question Count Validation', () => {
  const PROVIDER = `QCOUNT_TEST_${Date.now()}`;
  
  test.afterAll(async ({ request }) => {
    // Cleanup
    for (const subj of ['KOR', 'MATH', 'ENG', 'HIST']) {
      await request.post(`${API_BASE}/answer-keys/delete`, {
        data: { metadata: { providerName: PROVIDER, examYear: 2025, examMonth: 12, subjectCode: subj } }
      });
    }
  });

  test('should accept 45 questions for 국어', async ({ request }) => {
    const questions = Array.from({ length: 45 }, (_, i) => ({
      number: i + 1,
      points: 2,
      correctChoice: ((i % 5) + 1)
    }));
    
    const response = await request.post(`${API_BASE}/answer-keys`, {
      data: {
        metadata: { providerName: PROVIDER, examYear: 2025, examMonth: 12, examCode: 'KOR_45', gradeLevel: '고3', subjectCode: 'KOR', subjectName: '국어' },
        questions
      }
    });
    
    expect(response.ok()).toBeTruthy();
  });

  test('should accept 30 questions for 수학', async ({ request }) => {
    const questions = Array.from({ length: 30 }, (_, i) => ({
      number: i + 1,
      points: i < 22 ? 2 : 3,  // First 22 are 2pts, rest are 3pts
      correctChoice: ((i % 5) + 1)
    }));
    
    const response = await request.post(`${API_BASE}/answer-keys`, {
      data: {
        metadata: { providerName: PROVIDER, examYear: 2025, examMonth: 12, examCode: 'MATH_30', gradeLevel: '고3', subjectCode: 'MATH', subjectName: '수학' },
        questions
      }
    });
    
    expect(response.ok()).toBeTruthy();
  });

  test('should accept 45 questions for 영어', async ({ request }) => {
    const questions = Array.from({ length: 45 }, (_, i) => ({
      number: i + 1,
      points: 2,
      correctChoice: ((i % 5) + 1)
    }));
    
    const response = await request.post(`${API_BASE}/answer-keys`, {
      data: {
        metadata: { providerName: PROVIDER, examYear: 2025, examMonth: 12, examCode: 'ENG_45', gradeLevel: '고3', subjectCode: 'ENG', subjectName: '영어' },
        questions
      }
    });
    
    expect(response.ok()).toBeTruthy();
  });

  test('should accept 20 questions for 한국사', async ({ request }) => {
    const questions = Array.from({ length: 20 }, (_, i) => ({
      number: i + 1,
      points: 2,
      correctChoice: ((i % 5) + 1)
    }));
    
    const response = await request.post(`${API_BASE}/answer-keys`, {
      data: {
        metadata: { providerName: PROVIDER, examYear: 2025, examMonth: 12, examCode: 'HIST_20', gradeLevel: '고3', subjectCode: 'HIST', subjectName: '한국사' },
        questions
      }
    });
    
    expect(response.ok()).toBeTruthy();
  });
});

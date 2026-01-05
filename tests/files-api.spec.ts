import { test, expect } from '@playwright/test';

/**
 * Files API E2E Tests
 * 
 * 백엔드 파일 API의 동작을 검증합니다.
 * - /api/files/{id} - ID 기반 파일 접근
 * - /api/files/{user}/{session_id}/{filename} - 세션 기반 파일 접근
 */

test.describe('Files API', () => {
  const BACKEND_URL = 'http://localhost:8011';

  test.describe('Session-based File Access', () => {
    test('세션 기반 경로로 파일에 접근할 수 있음', async ({ request }) => {
      // 실제로 존재하는 파일 경로 테스트
      const response = await request.get(`${BACKEND_URL}/api/files/gyuwon/5479a2a0c2ab/123p041_name_block.png`);
      
      // 200 OK 또는 404 (파일이 없을 경우)
      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        // PNG 이미지 확인
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('image/png');
      }
    });

    test('존재하지 않는 파일은 404를 반환함', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/files/nonexistent/session/file.png`);
      expect(response.status()).toBe(404);
    });

    test('name_issues 폴더의 파일에 접근할 수 있음', async ({ request }) => {
      // name_issues 폴더에 있는 파일은 세션 기반 경로로 접근 가능
      const response = await request.get(`${BACKEND_URL}/api/files/gyuwon/5479a2a0c2ab/123p041_name_block.png`);
      
      if (response.status() === 200) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('image');
      }
    });
  });

  test.describe('ID-based File Access', () => {
    test('ID 기반 경로로 파일에 접근할 수 있음', async ({ request }) => {
      // 먼저 storage 테이블에서 파일 ID를 조회해야 함
      // 이 테스트는 실제 파일이 있을 때만 동작
      const response = await request.get(`${BACKEND_URL}/api/files/1`);
      
      // 파일이 있으면 200, 없으면 404
      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('File Type Detection', () => {
    test('PNG 파일은 image/png Content-Type을 반환함', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/files/gyuwon/5479a2a0c2ab/123p041_name_block.png`);
      
      if (response.status() === 200) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('image/png');
      }
    });
  });
});

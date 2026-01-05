import { test, expect } from '@playwright/test';

/**
 * 405 에러 테스트 - results 페이지에서 학생 선택 시 발생하는 문제 디버깅
 */
test.describe('405 Error Debug - Results Page', () => {
    // 모든 네트워크 요청을 로깅하기 위한 설정
    test.beforeEach(async ({ page }) => {
        // 모든 요청/응답을 콘솔에 출력
        page.on('request', request => {
            console.log('>> REQUEST:', request.method(), request.url());
        });
        
        page.on('response', response => {
            const status = response.status();
            const url = response.url();
            if (status >= 400) {
                console.log('!! ERROR RESPONSE:', status, url);
            } else {
                console.log('<< RESPONSE:', status, url);
            }
        });
        
        // 콘솔 로그도 출력
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('CONSOLE ERROR:', msg.text());
            } else if (msg.text().includes('Selecting') || msg.text().includes('student')) {
                console.log('CONSOLE LOG:', msg.text());
            }
        });
    });

    test('Login and navigate to results page', async ({ page }) => {
        // 1. 로그인
        console.log('\n=== Step 1: Login ===');
        await page.goto('https://snargpt.ai/signin');
        await page.fill('input[name="email"], input[type="email"]', 'gyuwon');
        await page.fill('input[name="password"], input[type="password"]', 'gyuwon1!');
        await page.click('button[type="submit"]');
        
        // 로그인 완료 대기
        await page.waitForTimeout(2000);
        
        // 2. OCR 사이트로 이동
        console.log('\n=== Step 2: Navigate to OCR site ===');
        await page.goto('https://ocr.snargpt.ai/results');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        // 3. 시험 목록 확인
        console.log('\n=== Step 3: Check exam list ===');
        const examDropdown = page.locator('select').first();
        await examDropdown.waitFor({ state: 'visible', timeout: 5000 });
        
        // 드롭다운 옵션 확인
        const options = await examDropdown.locator('option').allTextContents();
        console.log('Available exams:', options);
        
        // 4. 시험 선택 (실제 시험이 있으면 선택)
        console.log('\n=== Step 4: Select exam ===');
        if (options.length > 1) {
            await examDropdown.selectOption({ index: 1 });
            await page.waitForTimeout(2000);
            console.log('Selected first exam');
        }
        
        // 5. 개인별 채점결과 탭 클릭
        console.log('\n=== Step 5: Click individual results tab ===');
        const individualTab = page.getByText('개인별 채점결과');
        if (await individualTab.isVisible()) {
            await individualTab.click();
            await page.waitForTimeout(1000);
        }
        
        // 6. 학생 목록에서 첫 번째 학생 클릭
        console.log('\n=== Step 6: Click first student in list ===');
        
        // 학생 테이블에서 첫 번째 행 클릭 시도
        const studentRows = page.locator('tbody tr');
        const rowCount = await studentRows.count();
        console.log('Student rows found:', rowCount);
        
        if (rowCount > 0) {
            // 첫 번째 학생 행의 데이터 확인
            const firstRow = studentRows.first();
            const rowText = await firstRow.textContent();
            console.log('First row content:', rowText);
            
            // 클릭 시도
            console.log('\n=== Clicking first student row ===');
            await firstRow.click();
            
            // 에러 응답 대기
            await page.waitForTimeout(3000);
        }
        
        // 7. 스크린샷 저장
        await page.screenshot({ path: '/opt/omr/frontend/tests/results-page-debug.png', fullPage: true });
        console.log('\n=== Test completed ===');
    });

    test('Check API response format for student results', async ({ page }) => {
        // API 응답을 직접 확인
        console.log('\n=== Checking API response format ===');
        
        // 로그인
        await page.goto('https://snargpt.ai/signin');
        await page.fill('input[name="email"], input[type="email"]', 'gyuwon');
        await page.fill('input[name="password"], input[type="password"]', 'gyuwon1!');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
        
        // results 페이지로 이동
        await page.goto('https://ocr.snargpt.ai/results');
        await page.waitForLoadState('networkidle');
        
        // API 응답 가로채기
        const apiResponses: { url: string; status: number; body: string }[] = [];
        
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('/api/exams/')) {
                try {
                    const body = await response.text();
                    apiResponses.push({
                        url,
                        status: response.status(),
                        body: body.substring(0, 500)
                    });
                    console.log('\nAPI Response captured:');
                    console.log('  URL:', url);
                    console.log('  Status:', response.status());
                    console.log('  Body preview:', body.substring(0, 300));
                } catch (e) {
                    console.log('Failed to get response body for:', url);
                }
            }
        });
        
        // 시험 선택
        const examDropdown = page.locator('select').first();
        await examDropdown.waitFor({ state: 'visible', timeout: 5000 });
        const options = await examDropdown.locator('option').allTextContents();
        
        if (options.length > 1) {
            await examDropdown.selectOption({ index: 1 });
            await page.waitForTimeout(3000);
        }
        
        // 개인별 채점결과 탭
        const individualTab = page.getByText('개인별 채점결과');
        if (await individualTab.isVisible()) {
            await individualTab.click();
            await page.waitForTimeout(2000);
        }
        
        // 학생 클릭 시도
        const studentRows = page.locator('tbody tr');
        if (await studentRows.count() > 0) {
            await studentRows.first().click();
            await page.waitForTimeout(3000);
        }
        
        // 결과 출력
        console.log('\n=== All captured API responses ===');
        apiResponses.forEach((r, i) => {
            console.log(`\n[${i + 1}] ${r.url}`);
            console.log(`    Status: ${r.status}`);
        });
    });

    test('Debug student ID mapping in AllStudentsView', async ({ page }) => {
        // 특정 API 호출의 전체 응답을 확인
        console.log('\n=== Debugging student ID mapping ===');
        
        let examResultsResponse: any = null;
        
        // API 응답 가로채기 설정
        await page.route('**/api/exams/results**', async route => {
            const response = await route.fetch();
            const json = await response.json();
            examResultsResponse = json;
            console.log('\n=== /api/exams/results Response ===');
            console.log('Status:', response.status());
            console.log('Data sample:', JSON.stringify(json).substring(0, 1000));
            
            // 첫 번째 학생의 필드 확인
            if (json.data && json.data[0]) {
                console.log('\nFirst student object fields:');
                Object.keys(json.data[0]).forEach(key => {
                    console.log(`  ${key}: ${json.data[0][key]}`);
                });
            }
            
            await route.fulfill({ response });
        });
        
        // 로그인
        await page.goto('https://snargpt.ai/signin');
        await page.fill('input[name="email"], input[type="email"]', 'gyuwon');
        await page.fill('input[name="password"], input[type="password"]', 'gyuwon1!');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
        
        // results 페이지
        await page.goto('https://ocr.snargpt.ai/results');
        await page.waitForLoadState('networkidle');
        
        // 시험 선택
        const examDropdown = page.locator('select').first();
        await examDropdown.waitFor({ state: 'visible', timeout: 5000 });
        const options = await examDropdown.locator('option').allTextContents();
        
        if (options.length > 1) {
            await examDropdown.selectOption({ index: 1 });
            await page.waitForTimeout(3000);
        }
        
        // 개인별 채점결과 탭
        const individualTab = page.getByText('개인별 채점결과');
        if (await individualTab.isVisible()) {
            await individualTab.click();
            await page.waitForTimeout(2000);
        }
        
        // 결과 확인
        if (examResultsResponse) {
            console.log('\n=== Final Analysis ===');
            console.log('Total students:', examResultsResponse.data?.length || 0);
            if (examResultsResponse.data && examResultsResponse.data[0]) {
                const student = examResultsResponse.data[0];
                console.log('\nExpected ID field: studentId =', student.studentId);
                console.log('Legacy field: studentExternalId =', student.studentExternalId);
                console.log('studentName =', student.studentName);
            }
        }
    });
});

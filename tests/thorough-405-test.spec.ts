import { test, expect } from '@playwright/test';

/**
 * 철저한 테스트 - results 페이지에서 학생 선택 시 405 에러 검증
 * 저장된 인증 사용
 */

test.describe('Results Page Student Selection - Thorough Testing', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });
    
    test('should NOT have 405 errors when selecting a student', async ({ page }) => {
        // Collect all network errors
        const networkErrors: { url: string; status: number; method: string }[] = [];
        
        page.on('response', response => {
            const status = response.status();
            if (status >= 400) {
                networkErrors.push({
                    url: response.url(),
                    status: status,
                    method: response.request().method()
                });
                console.log(`❌ ERROR: ${response.request().method()} ${response.url()} - ${status}`);
            }
        });
        
        page.on('request', request => {
            if (request.url().includes('/api/exams/')) {
                console.log(`➡️ REQUEST: ${request.method()} ${request.url()}`);
            }
        });
        
        page.on('console', msg => {
            if (msg.text().includes('Selecting') || msg.text().includes('student')) {
                console.log(`📋 CONSOLE: ${msg.text()}`);
            }
        });

        // Step 1: Go to results page
        console.log('\n=== Step 1: Navigate to /results ===');
        await page.goto('https://ocr.snargpt.ai/results');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Step 2: Select an exam from dropdown
        console.log('\n=== Step 2: Select an exam ===');
        const examDropdown = page.locator('select').first();
        await examDropdown.waitFor({ state: 'visible', timeout: 10000 });
        
        const options = await examDropdown.locator('option').allTextContents();
        console.log('Available exam options:', options.length);
        
        if (options.length > 1) {
            await examDropdown.selectOption({ index: 1 });
            await page.waitForTimeout(2000);
        }
        
        // Step 3: Click 개인별 채점결과 tab
        console.log('\n=== Step 3: Click individual results tab ===');
        const individualTab = page.getByText('개인별 채점결과');
        if (await individualTab.isVisible()) {
            await individualTab.click();
            await page.waitForTimeout(2000);
        }
        
        // Step 4: Check for student table
        console.log('\n=== Step 4: Find student table ===');
        const studentRows = page.locator('tbody tr');
        const rowCount = await studentRows.count();
        console.log('Student rows found:', rowCount);
        
        // Step 5: Click the first student
        if (rowCount > 0) {
            console.log('\n=== Step 5: Click first student ===');
            const firstRow = studentRows.first();
            const textContent = await firstRow.textContent();
            console.log('First row text:', textContent?.substring(0, 100));
            
            // Click the row
            await firstRow.click();
            
            // Wait for potential API calls
            await page.waitForTimeout(3000);
        }
        
        // Step 6: Analyze errors
        console.log('\n=== Step 6: Error Analysis ===');
        console.log('Total network errors:', networkErrors.length);
        
        const errors405 = networkErrors.filter(e => e.status === 405);
        console.log('405 errors:', errors405.length);
        errors405.forEach(e => {
            console.log(`  - ${e.method} ${e.url}`);
        });
        
        // Take screenshot
        await page.screenshot({ path: '/opt/omr/frontend/tests/results-test.png', fullPage: true });
        
        // Assert no 405 errors
        expect(errors405.length).toBe(0);
    });

    test('verify API response contains studentId field', async ({ page }) => {
        test.use({ storageState: 'playwright/.auth/user.json' });
        
        // Intercept and log API responses
        let apiData: any = null;
        
        await page.route('**/api/exams/results**', async route => {
            const response = await route.fetch();
            const json = await response.json();
            apiData = json;
            console.log('\n=== API /exams/results response ===');
            if (json.students && json.students[0]) {
                console.log('First student fields:', Object.keys(json.students[0]));
                console.log('studentId:', json.students[0].studentId);
                console.log('studentExternalId:', json.students[0].studentExternalId);
            }
            await route.fulfill({ response });
        });

        await page.goto('https://ocr.snargpt.ai/results');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Select exam
        const examDropdown = page.locator('select').first();
        await examDropdown.waitFor({ state: 'visible', timeout: 10000 });
        const options = await examDropdown.locator('option').allTextContents();
        if (options.length > 1) {
            await examDropdown.selectOption({ index: 1 });
            await page.waitForTimeout(3000);
        }
        
        // Verify API data
        if (apiData) {
            console.log('\n=== Final verification ===');
            expect(apiData.status).toBe('ok');
            if (apiData.students && apiData.students.length > 0) {
                // At least one student has studentId
                const hasStudentId = apiData.students.some((s: any) => s.studentId);
                console.log('API returns studentId:', hasStudentId);
                expect(hasStudentId).toBe(true);
            }
        }
    });
});

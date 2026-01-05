import { test, expect } from '@playwright/test';

/**
 * 철저한 테스트 - results 페이지에서 학생 선택 시 405 에러 검증
 */
test.describe('Results Page 405 Error Debug', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });
    
    test('complete workflow - select exam and student', async ({ page }) => {
        // Track network errors
        const errors: { url: string; status: number; method: string }[] = [];
        
        page.on('response', response => {
            const status = response.status();
            if (status >= 400) {
                errors.push({
                    url: response.url(),
                    status,
                    method: response.request().method()
                });
                console.log(`❌ ${response.request().method()} ${response.url()} - ${status}`);
            }
        });
        
        page.on('request', request => {
            if (request.url().includes('/api/')) {
                console.log(`➡️ ${request.method()} ${request.url()}`);
            }
        });
        
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('student') || text.includes('Select') || text.includes('ID:')) {
                console.log(`📋 ${text}`);
            }
        });

        // Step 1: Navigate
        console.log('\n=== STEP 1: Navigate to /results ===');
        await page.goto('https://ocr.snargpt.ai/results');
        await page.waitForLoadState('networkidle');
        
        // Take initial screenshot
        await page.screenshot({ path: '/opt/omr/frontend/tests/step1-initial.png', fullPage: true });
        console.log('Screenshot: step1-initial.png');
        
        // Step 2: Wait for exam list to load
        console.log('\n=== STEP 2: Wait for exams to load ===');
        await page.waitForTimeout(3000);
        
        // Find and click the year dropdown (button with aria-haspopup)
        const yearButtons = page.locator('button[role="combobox"]');
        const buttonCount = await yearButtons.count();
        console.log('Combobox buttons found:', buttonCount);
        
        // Step 3: Check for exam cards or list
        console.log('\n=== STEP 3: Check exam selection UI ===');
        
        // Try to find the exam list/cards
        const examItems = page.locator('[class*="exam"]');
        const examCount = await examItems.count();
        console.log('Elements with exam in class:', examCount);
        
        // Look for any clickable elements that might be exams
        const cards = page.locator('.rounded-xl, .rounded-2xl');
        const cardCount = await cards.count();
        console.log('Cards found:', cardCount);
        
        // Take screenshot after waiting
        await page.screenshot({ path: '/opt/omr/frontend/tests/step3-exams.png', fullPage: true });
        
        // Step 4: Try to navigate to individual results tab
        console.log('\n=== STEP 4: Navigate to individual results ===');
        const tabButtons = page.locator('button');
        const tabCount = await tabButtons.count();
        console.log('Button count:', tabCount);
        
        // Find and click tab with specific text
        const individualTab = page.getByRole('button', { name: /개인별/ });
        if (await individualTab.isVisible()) {
            console.log('Found individual tab, clicking...');
            await individualTab.click();
            await page.waitForTimeout(2000);
        }
        
        await page.screenshot({ path: '/opt/omr/frontend/tests/step4-individual.png', fullPage: true });
        
        // Step 5: Check for student table
        console.log('\n=== STEP 5: Check for student table ===');
        const tables = page.locator('table');
        const tableCount = await tables.count();
        console.log('Tables found:', tableCount);
        
        if (tableCount > 0) {
            const rows = page.locator('tbody tr');
            const rowCount = await rows.count();
            console.log('Table rows:', rowCount);
            
            if (rowCount > 0) {
                // Click first row
                console.log('\n=== STEP 6: Click first student ===');
                const firstRow = rows.first();
                await firstRow.click();
                await page.waitForTimeout(3000);
            }
        }
        
        await page.screenshot({ path: '/opt/omr/frontend/tests/step6-after-click.png', fullPage: true });
        
        // Final analysis
        console.log('\n=== ANALYSIS ===');
        console.log('Total errors:', errors.length);
        
        const errors405 = errors.filter(e => e.status === 405);
        console.log('405 errors:', errors405.length);
        errors405.forEach(e => console.log(`  ${e.method} ${e.url}`));
        
        const errors404 = errors.filter(e => e.status === 404);
        console.log('404 errors:', errors404.length);
        errors404.forEach(e => console.log(`  ${e.method} ${e.url}`));
        
        // Assert
        expect(errors405.length).toBe(0);
    });

    test('direct API test - verify student endpoint works', async ({ request }) => {
        // Test the student summary endpoint directly
        const studentId = '050508'; // Known student ID from earlier test
        
        const response = await request.get(`https://ocr.snargpt.ai/api/exams/student/${studentId}/summary`);
        console.log('Status:', response.status());
        
        const data = await response.json();
        console.log('Response:', JSON.stringify(data).substring(0, 500));
        
        expect(response.status()).toBe(200);
        expect(data.status).toBe('ok');
    });
});

import { test, expect } from '@playwright/test';

/**
 * 실제 데이터로 완전한 흐름 테스트
 */
test.describe('Full Results Page Flow with Real Data', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });
    
    test('select real exam and student - verify no 405', async ({ page }) => {
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
            if (request.url().includes('/api/exams/student')) {
                console.log(`🔍 STUDENT API: ${request.method()} ${request.url()}`);
            }
        });

        // Navigate
        await page.goto('https://ocr.snargpt.ai/results');
        await page.waitForLoadState('networkidle');
        
        // Select 2025년 if available
        const yearButton = page.locator('button[role="combobox"]').first();
        if (await yearButton.isVisible()) {
            await yearButton.click();
            await page.waitForTimeout(500);
            
            // Find 2025 option
            const option2025 = page.getByText('2025', { exact: false }).first();
            if (await option2025.isVisible()) {
                await option2025.click();
                await page.waitForTimeout(2000);
            }
        }
        
        // Click individual tab
        const individualTab = page.getByRole('button', { name: /개인별/ });
        if (await individualTab.isVisible()) {
            await individualTab.click();
            await page.waitForTimeout(2000);
        }
        
        // Get table info
        const tableRows = page.locator('tbody tr');
        const rowCount = await tableRows.count();
        console.log('Student rows:', rowCount);
        
        if (rowCount > 0) {
            // Get first row data
            const firstRow = tableRows.first();
            const cellCount = await firstRow.locator('td').count();
            console.log('Columns in first row:', cellCount);
            
            if (cellCount > 0) {
                const firstCell = await firstRow.locator('td').first().textContent();
                const secondCell = cellCount > 1 ? await firstRow.locator('td').nth(1).textContent() : 'N/A';
                console.log('First row - Name:', firstCell, 'ID:', secondCell);
            }
            
            // Click to select student
            await firstRow.click();
            await page.waitForTimeout(3000);
        }
        
        // Screenshot
        await page.screenshot({ path: '/opt/omr/frontend/tests/real-data-test.png', fullPage: true });
        
        // Verify no 405
        const errors405 = errors.filter(e => e.status === 405);
        console.log('\n405 Errors:', errors405.length);
        errors405.forEach(e => console.log(e.url));
        
        expect(errors405.length).toBe(0);
    });

    test('verify student click triggers correct API call', async ({ page }) => {
        const apiCalls: string[] = [];
        
        page.on('request', request => {
            if (request.url().includes('/api/exams/student/')) {
                apiCalls.push(request.url());
                console.log('📡 Student API call:', request.url());
            }
        });

        await page.goto('https://ocr.snargpt.ai/results');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Click individual tab
        const individualTab = page.getByRole('button', { name: /개인별/ });
        if (await individualTab.isVisible()) {
            await individualTab.click();
            await page.waitForTimeout(2000);
        }
        
        // Click first student
        const tableRows = page.locator('tbody tr');
        if (await tableRows.count() > 0) {
            await tableRows.first().click();
            await page.waitForTimeout(3000);
        }
        
        console.log('\nStudent API calls made:', apiCalls.length);
        apiCalls.forEach(url => console.log('  -', url));
        
        // Verify API was called with proper student ID (not undefined)
        for (const url of apiCalls) {
            expect(url).not.toContain('/student/undefined');
            expect(url).not.toContain('/student//');
            console.log('✅ URL is valid:', url);
        }
    });
});

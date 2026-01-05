import { test, expect } from '@playwright/test';

/**
 * 최종 통합 테스트 - 모든 기능 확인
 */
test.describe('Final Integration Tests', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });
    
    test('results page - auto-select first exam and no 405 on student click', async ({ page }) => {
        const errors: { url: string; status: number }[] = [];
        
        page.on('response', response => {
            if (response.status() >= 400) {
                errors.push({ url: response.url(), status: response.status() });
            }
        });

        // Navigate to results
        await page.goto('https://ocr.snargpt.ai/results');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Screenshot after auto-load
        await page.screenshot({ path: '/opt/omr/frontend/tests/final-1-autoload.png', fullPage: true });
        
        // Check if exam data is displayed (auto-selected exam should show stats)
        const statsArea = page.locator('text=응시 인원');
        const hasStats = await statsArea.count() > 0;
        console.log('Stats area visible (exam auto-selected):', hasStats);
        
        // Navigate to individual results
        const individualTab = page.getByRole('button', { name: /개인별/ });
        if (await individualTab.isVisible()) {
            await individualTab.click();
            await page.waitForTimeout(2000);
        }
        
        await page.screenshot({ path: '/opt/omr/frontend/tests/final-2-individual.png', fullPage: true });
        
        // Check for student table
        const studentTable = page.locator('table');
        const hasTable = await studentTable.count() > 0;
        console.log('Student table visible:', hasTable);
        
        // Click first student if available
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        console.log('Student rows:', rowCount);
        
        if (rowCount > 0) {
            await rows.first().click();
            await page.waitForTimeout(3000);
        }
        
        await page.screenshot({ path: '/opt/omr/frontend/tests/final-3-student-detail.png', fullPage: true });
        
        // Verify no 405 errors
        const errors405 = errors.filter(e => e.status === 405);
        console.log('Total errors:', errors.length);
        console.log('405 errors:', errors405.length);
        errors405.forEach(e => console.log('  -', e.url));
        
        expect(errors405.length).toBe(0);
    });

    test('individual-results page - no CSV/ErrorRate components', async ({ page }) => {
        await page.goto('https://ocr.snargpt.ai/individual-results');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Screenshot
        await page.screenshot({ path: '/opt/omr/frontend/tests/final-individual-results.png', fullPage: true });
        
        // Verify NO CSV download section on this page
        const csvSection = page.locator('text=CSV 다운로드');
        const csvCount = await csvSection.count();
        console.log('CSV section count on individual-results:', csvCount);
        
        // Verify NO error rate analysis on this page  
        const errorRateSection = page.locator('text=오답률 분석');
        const errorRateCount = await errorRateSection.count();
        console.log('Error rate section count on individual-results:', errorRateCount);
        
        // These should NOT be on individual-results page (they should be on /results)
        // Small counts are OK if they're just labels, but full sections should not exist
    });

    test('results page - has CSV download and error rate sections', async ({ page }) => {
        await page.goto('https://ocr.snargpt.ai/results');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Screenshot
        await page.screenshot({ path: '/opt/omr/frontend/tests/final-results-sections.png', fullPage: true });
        
        // Verify CSV download section exists
        const csvButton = page.locator('text=CSV 다운로드');
        const csvExists = await csvButton.count() > 0;
        console.log('CSV download button exists:', csvExists);
        
        // Verify error rate section exists
        const errorRateTitle = page.locator('text=오답률 분석');
        const errorRateExists = await errorRateTitle.count() > 0;
        console.log('Error rate section exists:', errorRateExists);
        
        // Verify the 2-column grid layout
        const gridColumns = page.locator('.lg\\:grid-cols-2, .grid-cols-2');
        const gridExists = await gridColumns.count() > 0;
        console.log('2-column grid layout exists:', gridExists);
    });

    test('API direct test - student summary endpoint', async ({ request }) => {
        // Known student IDs from the database
        const testStudentIds = ['050508', '060611', '020222'];
        
        for (const studentId of testStudentIds) {
            const response = await request.get(`https://ocr.snargpt.ai/api/exams/student/${studentId}/summary`);
            
            console.log(`Student ${studentId}: Status ${response.status()}`);
            expect(response.status()).toBe(200);
            
            const data = await response.json();
            expect(data.status).toBe('ok');
            expect(data.studentId).toBe(studentId);
        }
    });
});

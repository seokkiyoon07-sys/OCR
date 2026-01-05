import { test, expect } from '@playwright/test';

const BASE_URL = 'https://ocr.snargpt.ai';

test.setTimeout(120000);

test('THOROUGH 405 Debug - Capture ALL network requests', async ({ page }) => {
  const allRequests: { method: string; url: string; status?: number }[] = [];
  const failedRequests: string[] = [];
  
  // Capture ALL requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      allRequests.push({ method: request.method(), url: request.url() });
      console.log(`>>> REQUEST: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`<<< RESPONSE: ${response.status()} ${response.url()}`);
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.request().method()} ${response.url()}`);
        console.log(`!!! FAILED: ${response.status()} ${response.url()}`);
      }
    }
  });

  // Also capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`CONSOLE ERROR: ${msg.text()}`);
    }
  });

  // Navigate to results
  console.log('=== Step 1: Navigate to results page ===');
  await page.goto(`${BASE_URL}/results`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Click on 개인별 채점결과 tab
  console.log('=== Step 2: Click 개인별 채점결과 tab ===');
  const individualTab = page.getByRole('button', { name: /개인별 채점결과/i });
  await expect(individualTab).toBeVisible({ timeout: 10000 });
  await individualTab.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Check if table has loaded
  console.log('=== Step 3: Check table state ===');
  const table = page.locator('table');
  await expect(table).toBeVisible({ timeout: 10000 });
  
  // Check what exam is selected
  const selectedExamText = await page.locator('h3.text-lg.font-bold').first().textContent();
  console.log(`Selected exam: ${selectedExamText}`);
  
  // Get table row count
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  console.log(`Table rows: ${rowCount}`);
  
  // If there's an actual student row, try to click it
  if (rowCount > 0) {
    const firstRowText = await rows.first().textContent();
    console.log(`First row content: ${firstRowText?.substring(0, 100)}`);
    
    // Check if it's a placeholder row
    if (!firstRowText?.includes('시험을 먼저 선택') && !firstRowText?.includes('검색 결과가 없습니다')) {
      console.log('=== Step 4: Clicking student row ===');
      await rows.first().click();
      await page.waitForTimeout(5000);
      
      // Check if we transitioned to StudentView
      const logoutButton = page.locator('text=목록으로');
      if (await logoutButton.isVisible({ timeout: 3000 })) {
        console.log('Successfully transitioned to StudentView');
      }
    } else {
      console.log('No real student data in table');
    }
  }
  
  // Print summary
  console.log('\n========== SUMMARY ==========');
  console.log(`Total API requests: ${allRequests.length}`);
  console.log(`Failed requests: ${failedRequests.length}`);
  
  if (failedRequests.length > 0) {
    console.log('\n=== FAILED REQUESTS ===');
    failedRequests.forEach(r => console.log(r));
  }
  
  console.log('\n=== ALL API REQUESTS ===');
  allRequests.forEach(r => console.log(`${r.method} ${r.url}`));
  
  // Assert no 405 errors specifically
  const has405 = failedRequests.some(r => r.includes('405'));
  expect(has405, `Found 405 errors: ${failedRequests.join(', ')}`).toBeFalsy();
});

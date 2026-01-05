import { test, expect } from '@playwright/test';

const BASE_URL = 'https://ocr.snargpt.ai';

test.setTimeout(30000);

test('Individual results page has new UI components', async ({ page }) => {
  await page.goto(`${BASE_URL}/individual-results`);
  await page.waitForLoadState('networkidle');
  
  // Check CSV download section exists
  const csvTitle = page.locator('text=개별 결과 다운로드');
  await expect(csvTitle).toBeVisible({ timeout: 5000 });
  console.log('CSV download section: found');
  
  // Check CSV download button
  const csvButton = page.locator('button:has-text("CSV 다운로드")');
  await expect(csvButton).toBeVisible();
  console.log('CSV download button: found');
  
  // Check subject filter buttons
  const subjectButtons = ['국어', '수학', '영어', '사회탐구', '과학탐구', '한국사'];
  for (const subject of subjectButtons) {
    const button = page.locator(`button:has-text("${subject}")`).first();
    await expect(button).toBeVisible();
    console.log(`Subject button "${subject}": found`);
  }
  
  // Check error rate analysis section
  const errorRateTitle = page.locator('text=전체 오답률 분석');
  await expect(errorRateTitle).toBeVisible();
  console.log('Error rate analysis section: found');
  
  // Check top students error rate section
  const topStudentsTitle = page.locator('text=상위 10% 오답률 분석');
  await expect(topStudentsTitle).toBeVisible();
  console.log('Top students error rate section: found');
  
  // Check dropdown for percentage selection
  const percentageSelect = page.locator('select');
  await expect(percentageSelect).toBeVisible();
  console.log('Percentage dropdown: found');
});

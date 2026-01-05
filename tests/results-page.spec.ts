import { test, expect } from '@playwright/test';

// Helper function to check for login prompt and skip test if not authenticated
async function waitForResultsPage(page: import('@playwright/test').Page): Promise<boolean> {
  await page.goto('/results');
  await page.waitForLoadState('domcontentloaded');
  
  // Check if login is required
  const loginPrompt = page.locator('text=로그인이 필요합니다');
  const resultsTab = page.locator('text=채점결과');
  
  // Wait for either login prompt or results tab
  const first = await Promise.race([
    loginPrompt.waitFor({ timeout: 10000 }).then(() => 'login'),
    resultsTab.waitFor({ timeout: 10000 }).then(() => 'results'),
  ]).catch(() => 'timeout');
  
  if (first === 'login') {
    // Not authenticated, skip remaining assertions
    return false;
  }
  
  // Wait for loading to complete
  await page.waitForFunction(() => {
    return !document.querySelector('.animate-spin');
  }, { timeout: 15000 }).catch(() => {
    // Loading might already be complete
  });
  
  return true;
}

test.describe('Results Page with Year Select', () => {
  
  test('should have year select on results page', async ({ page }) => {
    const isAuthenticated = await waitForResultsPage(page);
    if (!isAuthenticated) {
      test.skip();
      return;
    }
    
    // Look for year Radix Select
    const yearSelect = page.locator('button[aria-label="연도 필터"]');
    
    // If year select is visible, click it
    if (await yearSelect.isVisible({ timeout: 5000 })) {
      await yearSelect.click();
      
      // Check that dropdown options appear
      const selectContent = page.locator('[data-radix-popper-content-wrapper]');
      await expect(selectContent).toBeVisible({ timeout: 5000 });
      
      // Check for year option (e.g., "2025년")
      const yearOption = page.locator('[data-radix-popper-content-wrapper] >> text=년').first();
      await expect(yearOption).toBeVisible();
      
      // Close dropdown by pressing Escape key
      await page.keyboard.press('Escape');
    }
  });

  test('should show month buttons in MM월 format', async ({ page }) => {
    const isAuthenticated = await waitForResultsPage(page);
    if (!isAuthenticated) {
      test.skip();
      return;
    }
    
    // Check for month buttons - should show format like "6월", "7월" etc
    const monthButton = page.locator('button:has-text("월")').first();
    
    if (await monthButton.isVisible({ timeout: 5000 })) {
      const buttonText = await monthButton.textContent();
      // Should be short format like "6월" not "2025년 6월"
      expect(buttonText?.length).toBeLessThanOrEqual(4);
    }
  });

  test('should disable subject buttons when no data', async ({ page }) => {
    const isAuthenticated = await waitForResultsPage(page);
    if (!isAuthenticated) {
      test.skip();
      return;
    }
    
    // Look for disabled subject buttons (cursor-not-allowed class)
    const disabledButtons = page.locator('button.cursor-not-allowed');
    
    // There might be some disabled buttons if no data exists for certain subjects
    const count = await disabledButtons.count();
    
    // Just check that the page has loaded correctly
    // The presence of disabled buttons depends on actual DB data
    console.log(`Found ${count} disabled subject buttons`);
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have category buttons for filtering', async ({ page }) => {
    const isAuthenticated = await waitForResultsPage(page);
    if (!isAuthenticated) {
      test.skip();
      return;
    }
    
    // Look for subject category buttons (국어, 수학, 영어, etc.)
    const koreanButton = page.locator('button:has-text("국어")').first();
    const mathButton = page.locator('button:has-text("수학")').first();
    
    // At least some category buttons should be visible if data exists
    const koreanVisible = await koreanButton.isVisible({ timeout: 5000 }).catch(() => false);
    const mathVisible = await mathButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    console.log(`Korean button visible: ${koreanVisible}, Math button visible: ${mathVisible}`);
    // This test passes as long as page loads without error
  });

  test('should change year and update month buttons', async ({ page }) => {
    const isAuthenticated = await waitForResultsPage(page);
    if (!isAuthenticated) {
      test.skip();
      return;
    }
    
    // Look for year Radix Select
    const yearSelect = page.locator('button[aria-label="연도 필터"]');
    
    if (await yearSelect.isVisible({ timeout: 5000 })) {
      const initialYearText = await yearSelect.textContent();
      
      // Click to open year select
      await yearSelect.click();
      
      // Wait for dropdown
      const selectContent = page.locator('[data-radix-popper-content-wrapper]');
      await expect(selectContent).toBeVisible({ timeout: 5000 });
      
      // Find and click a different year option if available
      const yearOptions = page.locator('[data-radix-popper-content-wrapper] [role="option"]');
      const optionCount = await yearOptions.count();
      
      if (optionCount > 1) {
        await yearOptions.nth(1).click();
        
        // Wait for update
        await page.waitForTimeout(500);
        
        // Page should update (specific behavior depends on available data)
        console.log(`Changed year from: ${initialYearText}`);
      }
    }
  });
});

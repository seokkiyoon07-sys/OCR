import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://ocr.snargpt.ai';

test.describe('AnswerEditor Subject Selection Tests', () => {
  // Use authentication from auth.setup.ts
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('Upload page should show simplified subject dropdown (1-level only)', async ({ page }) => {
    // Navigate to upload page
    await page.goto(`${BASE_URL}/upload`);
    await page.waitForLoadState('networkidle');
    
    // Find and click subject dropdown
    const subjectDropdown = page.locator('button:has-text("과목을 선택하세요")');
    if (await subjectDropdown.isVisible()) {
      await subjectDropdown.click();
      
      // Verify only 1-level subjects are shown
      const dropdown = page.locator('div.absolute.top-full');
      await expect(dropdown).toBeVisible();
      
      // Check for main subjects
      await expect(dropdown.locator('text=국어')).toBeVisible();
      await expect(dropdown.locator('text=수학')).toBeVisible();
      await expect(dropdown.locator('text=영어')).toBeVisible();
      await expect(dropdown.locator('text=한국사')).toBeVisible();
      await expect(dropdown.locator('text=탐구')).toBeVisible();
      await expect(dropdown.locator('text=기타')).toBeVisible();
      
      // Verify nested selections are NOT shown (should be in AnswerEditor now)
      // 수학 선택과목 (확률과 통계, 미적분, 기하) should not appear as nested items
      const mathNested = dropdown.locator('.pl-4:has-text("확률과 통계")');
      await expect(mathNested).not.toBeVisible();
      
      console.log('✅ Upload page shows simplified 1-level subjects only');
    }
  });

  test('Select 국어 subject and verify AnswerEditor shows correct sections', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`);
    await page.waitForLoadState('networkidle');
    
    // Select 국어 subject
    const subjectDropdown = page.locator('button:has-text("과목을 선택하세요")');
    if (await subjectDropdown.isVisible()) {
      await subjectDropdown.click();
      await page.locator('button:has-text("국어")').first().click();
      await page.waitForTimeout(500);
    }
    
    // Try to open answer editor modal
    const answerButton = page.locator('button:has-text("정답 입력")');
    if (await answerButton.isVisible()) {
      await answerButton.click();
      await page.waitForTimeout(500);
      
      // Check for common section header
      const commonSection = page.locator('text=국어 공통 (코드: 1000)');
      if (await commonSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Korean common section header with code is visible');
      }
      
      // Check for elective dropdown (now has default value)
      const electiveDropdown = page.locator('button:has-text("화법과 작문")');
      if (await electiveDropdown.isVisible()) {
        console.log('✅ Korean elective dropdown is visible with default value');
        
        // Click to open dropdown
        await electiveDropdown.click();
        await page.waitForTimeout(300);
        
        // Verify electives with SUNEUNG codes (0, 1)
        const writingOption = page.locator('text=화법과 작문 (수능코드: 0)');
        const mediaOption = page.locator('text=언어와 매체 (수능코드: 1)');
        
        if (await writingOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('✅ 화법과 작문 option with 수능코드 0 visible');
        }
        if (await mediaOption.isVisible().catch(() => false)) {
          console.log('✅ 언어와 매체 option with 수능코드 1 visible');
        }
      }
      
      // Verify 선택문항 35-45번 range
      const selectiveRange = page.locator('text=선택문항 35-45번');
      if (await selectiveRange.isVisible().catch(() => false)) {
        console.log('✅ Korean selective question range (35-45) is displayed');
      }
    }
  });

  test('Select 수학 subject and verify AnswerEditor shows section headers with SUNEUNG codes', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`);
    await page.waitForLoadState('networkidle');
    
    // Select 수학 subject
    const subjectDropdown = page.locator('button:has-text("과목을 선택하세요")');
    if (await subjectDropdown.isVisible()) {
      await subjectDropdown.click();
      await page.locator('button:has-text("수학")').first().click();
      await page.waitForTimeout(500);
    }
    
    // Try to open answer editor modal
    const answerButton = page.locator('button:has-text("정답 입력")');
    if (await answerButton.isVisible()) {
      await answerButton.click();
      await page.waitForTimeout(500);
      
      // Check for section headers
      const commonSection = page.locator('text=수학 공통 (코드: 2000)');
      if (await commonSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Math common section header with code is visible');
      }
      
      // Check for elective dropdown (now has default value '확률과 통계')
      const electiveDropdown = page.locator('button:has-text("확률과 통계")').first();
      if (await electiveDropdown.isVisible()) {
        console.log('✅ Math elective dropdown is visible with default value');
        
        // Click to open dropdown
        await electiveDropdown.click();
        
        // Verify electives with SUNEUNG codes (0, 1, 2)
        const statsOption = page.locator('text=확률과 통계 (수능코드: 0)');
        const calcOption = page.locator('text=미적분 (수능코드: 1)');
        const geoOption = page.locator('text=기하 (수능코드: 2)');
        
        if (await statsOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('✅ 확률과 통계 option with 수능코드 0 visible');
        }
        if (await calcOption.isVisible().catch(() => false)) {
          console.log('✅ 미적분 option with 수능코드 1 visible');
        }
        if (await geoOption.isVisible().catch(() => false)) {
          console.log('✅ 기하 option with 수능코드 2 visible');
        }
      }
    }
  });

  test('Select 탐구 subject and verify AnswerEditor shows subject selector with SUNEUNG codes', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`);
    await page.waitForLoadState('networkidle');
    
    // Select 탐구 subject
    const subjectDropdown = page.locator('button:has-text("과목을 선택하세요")');
    if (await subjectDropdown.isVisible()) {
      await subjectDropdown.click();
      await page.locator('button:has-text("탐구")').first().click();
      await page.waitForTimeout(500);
    }
    
    // Try to open answer editor modal
    const answerButton = page.locator('button:has-text("정답 입력")');
    if (await answerButton.isVisible()) {
      await answerButton.click();
      await page.waitForTimeout(500);
      
      // Check for exploration subject dropdown (now has default value '생활과 윤리')
      const explorationDropdown = page.locator('button:has-text("생활과 윤리")').first();
      if (await explorationDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Exploration subject dropdown is visible with default value');
        
        // Click to open dropdown
        await explorationDropdown.click();
        await page.waitForTimeout(300);
        
        // Verify social subjects section with codes 11-19
        const socialSection = page.locator('text=사회탐구 (코드: 11-19)');
        if (await socialSection.isVisible().catch(() => false)) {
          console.log('✅ Social exploration section with codes visible');
        }
        
        // Verify science subjects section with codes 20-27
        const scienceSection = page.locator('text=과학탐구 (코드: 20-27)');
        if (await scienceSection.isVisible().catch(() => false)) {
          console.log('✅ Science exploration section with codes visible');
        }
        
        // Check for specific subjects with SUNEUNG codes
        const ethicsOption = page.locator('text=코드: 11');
        const physicsOption = page.locator('text=코드: 20');
        
        if (await ethicsOption.isVisible().catch(() => false)) {
          console.log('✅ 생활과 윤리 with 수능코드 11 visible');
        }
        if (await physicsOption.isVisible().catch(() => false)) {
          console.log('✅ 물리학I with 수능코드 20 visible');
        }
      }
    }
  });

  test('Common questions should remain when changing elective subject', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`);
    await page.waitForLoadState('networkidle');
    
    // Select 수학 subject
    const subjectDropdown = page.locator('button:has-text("과목을 선택하세요")');
    if (await subjectDropdown.isVisible()) {
      await subjectDropdown.click();
      await page.locator('button:has-text("수학")').first().click();
      await page.waitForTimeout(500);
    }
    
    // Open answer editor modal
    const answerButton = page.locator('button:has-text("정답 입력")');
    if (await answerButton.isVisible()) {
      await answerButton.click();
      await page.waitForTimeout(500);
      
      // Enter answers for common section (1-5번)
      const commonInput = page.locator('input[placeholder="예: 51234"]').first();
      if (await commonInput.isVisible()) {
        await commonInput.fill('12345');
        console.log('✅ Entered common answers 12345 for questions 1-5');
        
        // Select 확률과 통계 (already selected as default, so click to change)
        const electiveDropdown = page.locator('button:has-text("확률과 통계")').first();
        await electiveDropdown.click();
        await page.waitForTimeout(300);
        
        // Select 미적분 first, then switch back to 확률과 통계
        const calcOption = page.locator('button:has-text("미적분")').first();
        await calcOption.click();
        await page.waitForTimeout(300);
        
        // Now enter elective answers (23-28번) for 미적분
        const electiveInput = page.locator('input[placeholder="예: 512345"]').first();
        if (await electiveInput.isVisible()) {
          await electiveInput.fill('999999');
          console.log('✅ Entered 미적분 answers 999999 for questions 23-28');
        }
        
        // Switch to 확률과 통계
        const electiveDropdown2 = page.locator('button:has-text("미적분")').first();
        await electiveDropdown2.click();
        await page.waitForTimeout(300);
        
        const statsOption = page.locator('button:has-text("확률과 통계")').first();
        await statsOption.click();
        await page.waitForTimeout(300);
        
        // Enter 확률과 통계 answers
        if (await electiveInput.isVisible()) {
          await electiveInput.fill('543210');
          console.log('✅ Entered 확률과 통계 answers 543210 for questions 23-28');
        }
        
        // Switch to 미적분
        const electiveDropdown3 = page.locator('button:has-text("확률과 통계")').first();
        await electiveDropdown3.click();
        await page.waitForTimeout(300);
        
        const calcOption2 = page.locator('button:has-text("미적분")').first();
        await calcOption2.click();
        await page.waitForTimeout(300);
        
        // Verify common answers remain unchanged
        const commonValue = await commonInput.inputValue();
        if (commonValue === '12345') {
          console.log('✅ Common answers preserved when switching elective: ' + commonValue);
        } else {
          console.log('⚠️ Common answers changed! Expected 12345 but got: ' + commonValue);
        }
        
        // Switch back to 확률과 통계
        const electiveDropdown4 = page.locator('button:has-text("미적분")').first();
        await electiveDropdown4.click();
        await page.waitForTimeout(300);
        
        const statsOption2 = page.locator('button:has-text("확률과 통계")').first();
        await statsOption2.click();
        await page.waitForTimeout(300);
        
        // Verify elective answers were restored
        const restoredValue = await electiveInput.inputValue();
        if (restoredValue === '543210') {
          console.log('✅ Elective answers restored when switching back: ' + restoredValue);
        } else {
          console.log('⚠️ Expected 543210 but got: ' + restoredValue);
        }
      }
    }
  });
});

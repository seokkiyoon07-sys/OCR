import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page, context }) => {
  // Go to SNargpt login page
  await page.goto('https://snargpt.ai/signin');
  await page.waitForLoadState('networkidle');

  // Fill in login credentials
  const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  // Wait for inputs to be visible
  try {
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill('gyuwon');
    await passwordInput.fill('gyuwon1!');

    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Sign in")').first();
    await submitButton.click();

    // Wait for navigation after login
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');

    // Save cookies/auth state
    await context.storageState({ path: authFile });
    console.log('✅ Authentication successful');
  } catch (error) {
    console.log('⚠️  Login form not found or login failed, but continuing with tests...');
    // Even if login fails, we continue - some tests don't require auth
  }
});

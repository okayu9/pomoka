import { test, expect } from '@playwright/test';

test.describe('Settings Button Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('settings button should be visible when timer is idle', async ({ page }) => {
    const settingsBtn = page.locator('#settings-btn');
    
    // アイドル状態で設定ボタンが表示されている
    await expect(settingsBtn).toBeVisible();
  });

  test('settings button should be hidden when timer is running', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const settingsBtn = page.locator('#settings-btn');
    
    // タイマーを開始
    await playBtn.click();
    
    // 設定ボタンが非表示になる
    await expect(settingsBtn).toBeHidden();
  });

  test('settings button should be hidden when timer is paused', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const settingsBtn = page.locator('#settings-btn');
    
    // タイマーを開始して一時停止
    await playBtn.click();
    await page.waitForTimeout(500);
    await playBtn.click(); // 一時停止
    
    // 設定ボタンが非表示のまま
    await expect(settingsBtn).toBeHidden();
  });

  test('settings button should reappear when timer is reset to idle', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const resetBtn = page.locator('#reset-btn');
    const settingsBtn = page.locator('#settings-btn');
    
    // タイマーを開始
    await playBtn.click();
    
    // 設定ボタンが非表示
    await expect(settingsBtn).toBeHidden();
    
    // リセットダイアログでタイマーをリセット
    await resetBtn.click();
    await page.locator('#confirm-reset').click();
    
    // 設定ボタンが再表示される
    await expect(settingsBtn).toBeVisible();
  });

  test('take screenshot of idle state with visible settings button', async ({ page }) => {
    await expect(page).toHaveScreenshot('idle-with-settings-visible.png');
  });

  test('take screenshot of running state with hidden settings button', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    
    // タイマーを開始
    await playBtn.click();
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('running-without-settings.png');
  });

  test('take screenshot of paused state with hidden settings button', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    
    // タイマーを開始して一時停止
    await playBtn.click();
    await page.waitForTimeout(500);
    await playBtn.click(); // 一時停止
    
    await expect(page).toHaveScreenshot('paused-without-settings.png');
  });
});
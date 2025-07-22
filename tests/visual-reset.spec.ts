import { test, expect } from '@playwright/test';

test.describe('Reset Dialog Visual Check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('take screenshot of idle state with disabled reset button', async ({ page }) => {
    // アイドル状態のスクリーンショット
    await expect(page).toHaveScreenshot('idle-state-with-disabled-reset.png');
  });

  test('take screenshot of running state with enabled reset button', async ({ page }) => {
    // タイマーを開始
    const playBtn = page.locator('#play-pause-btn');
    await playBtn.click();
    
    // 少し待ってからスクリーンショット
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('running-state-with-enabled-reset.png');
  });

  test('take screenshot of reset confirmation dialog', async ({ page }) => {
    // タイマーを開始
    const playBtn = page.locator('#play-pause-btn');
    await playBtn.click();
    
    // リセットボタンをクリックしてダイアログを表示
    const resetBtn = page.locator('#reset-btn');
    await resetBtn.click();
    
    // ダイアログのスクリーンショット
    await expect(page).toHaveScreenshot('reset-confirmation-dialog.png');
  });

  test('take screenshot of paused state with reset button', async ({ page }) => {
    // タイマーを開始して一時停止
    const playBtn = page.locator('#play-pause-btn');
    await playBtn.click();
    await page.waitForTimeout(500);
    await playBtn.click(); // 一時停止
    
    await expect(page).toHaveScreenshot('paused-state-with-reset.png');
  });
});
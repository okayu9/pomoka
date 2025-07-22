import { test, expect } from '@playwright/test';

test.describe('Reset Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('reset button should be disabled when timer is idle', async ({ page }) => {
    const resetBtn = page.locator('#reset-btn');
    
    // アイドル状態ではリセットボタンが無効化されている
    await expect(resetBtn).toBeDisabled();
    await expect(resetBtn).toHaveClass(/bg-gray-400/);
    await expect(resetBtn).toHaveClass(/cursor-not-allowed/);
  });

  test('reset button should be enabled when timer is running', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const resetBtn = page.locator('#reset-btn');
    
    // タイマーを開始
    await playBtn.click();
    
    // リセットボタンが有効になっている
    await expect(resetBtn).toBeEnabled();
    await expect(resetBtn).toHaveClass(/bg-gray-500/);
    await expect(resetBtn).not.toHaveClass(/cursor-not-allowed/);
  });

  test('clicking reset button should show dialog when timer is running', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const resetBtn = page.locator('#reset-btn');
    
    // タイマーを開始
    await playBtn.click();
    
    // リセットボタンをクリック
    await resetBtn.click();
    
    // ダイアログが表示される
    await expect(page.locator('text=タイマーをリセットしますか？')).toBeVisible();
    await expect(page.locator('text=現在の進行状況が失われます')).toBeVisible();
    await expect(page.locator('#cancel-reset')).toBeVisible();
    await expect(page.locator('#confirm-reset')).toBeVisible();
  });

  test('clicking reset button should not show dialog when timer is idle', async ({ page }) => {
    const resetBtn = page.locator('#reset-btn');
    
    // アイドル状態でリセットボタンをクリック（無効なので反応しない）
    await resetBtn.click({ force: true });
    
    // ダイアログが表示されない
    await expect(page.locator('text=タイマーをリセットしますか？')).not.toBeVisible();
  });

  test('cancel button should close dialog without resetting', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const resetBtn = page.locator('#reset-btn');
    
    // タイマーを開始
    await playBtn.click();
    await page.waitForTimeout(1000); // 1秒待機
    
    // リセットボタンをクリックしてダイアログを開く
    await resetBtn.click();
    
    // キャンセルボタンをクリック
    await page.locator('#cancel-reset').click();
    
    // ダイアログが閉じる
    await expect(page.locator('text=タイマーをリセットしますか？')).not.toBeVisible();
    
    // タイマーが継続している（時間が減っている）
    const timeDisplay = page.locator('#time-display');
    const timeText = await timeDisplay.textContent();
    expect(timeText).not.toBe('25:00');
  });

  test('confirm button should reset timer and close dialog', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const resetBtn = page.locator('#reset-btn');
    
    // タイマーを開始
    await playBtn.click();
    await page.waitForTimeout(1000); // 1秒待機
    
    // リセットボタンをクリックしてダイアログを開く
    await resetBtn.click();
    
    // 確認ボタンをクリック
    await page.locator('#confirm-reset').click();
    
    // ダイアログが閉じる
    await expect(page.locator('text=タイマーをリセットしますか？')).not.toBeVisible();
    
    // タイマーがリセットされている
    const timeDisplay = page.locator('#time-display');
    await expect(timeDisplay).toHaveText('25:00');
    
    // 再生ボタンが表示されている（アイドル状態）
    await expect(playBtn).toHaveAttribute('aria-label', 'スタート');
    
    // リセットボタンが無効化されている
    await expect(resetBtn).toBeDisabled();
  });

  test('ESC key should close dialog without resetting', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const resetBtn = page.locator('#reset-btn');
    
    // タイマーを開始
    await playBtn.click();
    await page.waitForTimeout(1000); // 1秒待機
    
    // リセットボタンをクリックしてダイアログを開く
    await resetBtn.click();
    
    // ESCキーを押す
    await page.keyboard.press('Escape');
    
    // ダイアログが閉じる
    await expect(page.locator('text=タイマーをリセットしますか？')).not.toBeVisible();
    
    // タイマーが継続している
    const timeDisplay = page.locator('#time-display');
    const timeText = await timeDisplay.textContent();
    expect(timeText).not.toBe('25:00');
  });

  test('clicking dialog background should close dialog without resetting', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const resetBtn = page.locator('#reset-btn');
    
    // タイマーを開始
    await playBtn.click();
    await page.waitForTimeout(1000); // 1秒待機
    
    // リセットボタンをクリックしてダイアログを開く
    await resetBtn.click();
    
    // ダイアログの背景（オーバーレイ）をクリック
    const dialogOverlay = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
    await dialogOverlay.click({ position: { x: 10, y: 10 } });
    
    // ダイアログが閉じる
    await expect(page.locator('text=タイマーをリセットしますか？')).not.toBeVisible();
    
    // タイマーが継続している
    const timeDisplay = page.locator('#time-display');
    const timeText = await timeDisplay.textContent();
    expect(timeText).not.toBe('25:00');
  });

  test('dialog should have proper styling and layout', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const resetBtn = page.locator('#reset-btn');
    
    // タイマーを開始
    await playBtn.click();
    
    // リセットボタンをクリック
    await resetBtn.click();
    
    // ダイアログのスタイリングを確認
    const dialogContainer = page.locator('.bg-white.rounded-lg');
    await expect(dialogContainer).toBeVisible();
    await expect(dialogContainer).toHaveClass(/shadow-xl/);
    
    // ボタンのスタイリングを確認
    const cancelBtn = page.locator('#cancel-reset');
    const confirmBtn = page.locator('#confirm-reset');
    
    await expect(cancelBtn).toHaveClass(/bg-gray-200/);
    await expect(cancelBtn).toHaveClass(/hover:bg-gray-300/);
    
    await expect(confirmBtn).toHaveClass(/bg-red-500/);
    await expect(confirmBtn).toHaveClass(/hover:bg-red-600/);
  });

  test('dialog should work with paused timer', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const resetBtn = page.locator('#reset-btn');
    
    // タイマーを開始して一時停止
    await playBtn.click();
    await page.waitForTimeout(500);
    await playBtn.click(); // 一時停止
    
    // リセットボタンをクリック
    await resetBtn.click();
    
    // ダイアログが表示される
    await expect(page.locator('text=タイマーをリセットしますか？')).toBeVisible();
    
    // 確認ボタンでリセット
    await page.locator('#confirm-reset').click();
    
    // タイマーがリセットされてアイドル状態になる
    const timeDisplay = page.locator('#time-display');
    await expect(timeDisplay).toHaveText('25:00');
    await expect(playBtn).toHaveAttribute('aria-label', 'スタート');
  });
});
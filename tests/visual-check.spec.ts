import { test, expect } from '@playwright/test';

test('ポモドーロタイマーの動作確認', async ({ page }) => {
  // ページを開く
  await page.goto('/');
  
  // スクリーンショットを撮る（初期状態）
  await page.screenshot({ path: 'screenshots/initial-state.png', fullPage: true });
  
  // 基本要素の確認
  await expect(page.locator('#time-display')).toHaveText('25:00');
  
  // スタートボタンをクリック
  await page.click('#start-btn');
  
  // 1秒待機してタイマーが動いているか確認
  await page.waitForTimeout(1500);
  const timeAfter1Sec = await page.locator('#time-display').textContent();
  expect(timeAfter1Sec).not.toBe('25:00');
  
  // スクリーンショットを撮る（作業中）
  await page.screenshot({ path: 'screenshots/working-state.png', fullPage: true });
  
  // 一時停止ボタンをクリック
  await page.click('#pause-btn');
  
  // スクリーンショットを撮る（一時停止）
  await page.screenshot({ path: 'screenshots/paused-state.png', fullPage: true });
  
  // リセットボタンをクリック
  await page.click('#reset-btn');
  await expect(page.locator('#time-display')).toHaveText('25:00');
  
  console.log('✅ ポモドーロタイマーの基本動作が正常です');
});

test('スマホ縦画面での表示確認', async ({ page }) => {
  // スマホ縦画面サイズに設定
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/');
  
  // スクリーンショットを撮る（スマホ縦画面）
  await page.screenshot({ path: 'screenshots/mobile-portrait.png', fullPage: true });
  
  // レスポンシブデザインの確認
  const container = page.locator('.min-h-screen');
  await expect(container).toBeVisible();
  
  console.log('✅ スマホ縦画面での表示が正常です');
});

test('スマホ横画面での表示確認', async ({ page }) => {
  // スマホ横画面サイズに設定
  await page.setViewportSize({ width: 667, height: 375 });
  
  await page.goto('/');
  
  // スクリーンショットを撮る（スマホ横画面）
  await page.screenshot({ path: 'screenshots/mobile-landscape.png', fullPage: true });
  
  // レスポンシブデザインの確認
  const container = page.locator('.min-h-screen');
  await expect(container).toBeVisible();
  
  console.log('✅ スマホ横画面での表示が正常です');
});

test('デスクトップサイズでの表示確認', async ({ page }) => {
  // デスクトップサイズに設定
  await page.setViewportSize({ width: 1024, height: 768 });
  
  await page.goto('/');
  
  // スクリーンショットを撮る（デスクトップサイズ）
  await page.screenshot({ path: 'screenshots/desktop-view.png', fullPage: true });
  
  // レスポンシブデザインの確認
  const container = page.locator('.min-h-screen');
  await expect(container).toBeVisible();
  
  console.log('✅ デスクトップサイズでの表示が正常です');
});
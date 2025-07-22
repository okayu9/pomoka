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

test('スマホサイズでの表示確認', async ({ page }) => {
  // スマホサイズに設定
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/');
  
  // スクリーンショットを撮る（スマホサイズ）
  await page.screenshot({ path: 'screenshots/mobile-view.png', fullPage: true });
  
  // レスポンシブデザインの確認
  const container = page.locator('.bg-white.rounded-lg');
  await expect(container).toBeVisible();
  
  console.log('✅ スマホサイズでの表示が正常です');
});
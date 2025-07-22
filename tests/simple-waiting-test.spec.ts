import { test, expect } from '@playwright/test';

test.describe('Simple Waiting State Test', () => {
  test('manual test of waiting state', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // タイマー開始
    await page.click('#play-pause-btn');
    console.log('Timer started');
    
    // 少し待ってからsキー
    await page.waitForTimeout(1000);
    await page.keyboard.press('s');
    console.log('Debug key pressed');
    
    // さらに待って状態確認
    await page.waitForTimeout(2000);
    
    const playBtn = page.locator('#play-pause-btn');
    const ariaLabel = await playBtn.getAttribute('aria-label');
    console.log('Button aria-label:', ariaLabel);
    
    const className = await playBtn.getAttribute('class');
    console.log('Button class:', className);
    
    // 画面のスクリーンショット
    await page.screenshot({ path: 'debug-waiting-state.png' });
  });
});
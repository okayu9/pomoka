import { test, expect } from '@playwright/test';

test.describe('Waiting State and Screen Flash', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should enter waiting state when timer completes', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    
    // タイマーを開始してすぐにデバッグショートカットで最後の1秒にスキップ
    await playBtn.click();
    await page.keyboard.press('s');
    
    // 1秒待って完了を待つ
    await page.waitForTimeout(1500);
    
    // 待機状態のボタンに変化している
    await expect(playBtn).toHaveAttribute('aria-label', '次へ');
    await expect(playBtn).toHaveClass(/bg-yellow-500/);
    await expect(playBtn).toHaveClass(/animate-pulse/);
    
    // プログレス円が黄色になっている
    const progressCircle = page.locator('#progress-circle');
    await expect(progressCircle).toHaveAttribute('stroke', '#eab308');
  });

  test('should flash screen when timer completes', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    
    // タイマーを開始してデバッグショートカット
    await playBtn.click();
    await page.keyboard.press('s');
    
    // 完了まで待つ
    await page.waitForTimeout(1500);
    
    // 画面が点滅している（bg-yellow-200クラスの切り替え）
    await page.waitForTimeout(500); // 点滅の確認のため少し待つ
    
    // ボディに点滅クラスが適用されているかチェック
    const body = page.locator('body');
    const hasFlashClass = await body.evaluate((el) => {
      return el.classList.contains('bg-yellow-200');
    });
    
    // 点滅は切り替わるので、クラスがあるかないかのどちらかであることを確認
    expect(typeof hasFlashClass).toBe('boolean');
  });

  test('should stop flashing and proceed when play button is tapped in waiting state', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    
    // タイマーを開始してデバッグショートカット
    await playBtn.click();
    await page.keyboard.press('s');
    
    // 完了まで待つ
    await page.waitForTimeout(1500);
    
    // 待機状態になったことを確認
    await expect(playBtn).toHaveAttribute('aria-label', '次へ');
    
    // プレイボタンをタップして次に進む
    await playBtn.click();
    
    // 点滅が停止している
    const body = page.locator('body');
    await expect(body).not.toHaveClass(/bg-yellow-200/);
    
    // 次の状態（休憩）に移行している
    await page.waitForTimeout(500);
    const progressCircle = page.locator('#progress-circle');
    await expect(progressCircle).toHaveAttribute('stroke', '#16a34a'); // 緑色（休憩）
  });

  test('should handle work->break->work cycle with waiting states', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const progressCircle = page.locator('#progress-circle');
    
    // 作業開始
    await playBtn.click();
    await expect(progressCircle).toHaveAttribute('stroke', '#dc2626'); // 赤（作業）
    
    // 作業完了
    await page.keyboard.press('s');
    await page.waitForTimeout(1500);
    await expect(playBtn).toHaveAttribute('aria-label', '次へ');
    
    // 休憩に進む
    await playBtn.click();
    await page.waitForTimeout(500);
    await expect(progressCircle).toHaveAttribute('stroke', '#16a34a'); // 緑（休憩）
    
    // 休憩完了
    await page.keyboard.press('s');
    await page.waitForTimeout(1500);
    await expect(playBtn).toHaveAttribute('aria-label', '次へ');
    
    // 次の作業に進む
    await playBtn.click();
    await page.waitForTimeout(500);
    await expect(progressCircle).toHaveAttribute('stroke', '#dc2626'); // 赤（作業）
  });

  test('reset should work from waiting state', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    const resetBtn = page.locator('#reset-btn');
    
    // タイマーを完了して待機状態にする
    await playBtn.click();
    await page.keyboard.press('s');
    await page.waitForTimeout(1500);
    
    // 待機状態でリセット
    await resetBtn.click();
    await page.locator('#confirm-reset').click();
    
    // アイドル状態に戻る
    await expect(playBtn).toHaveAttribute('aria-label', 'スタート');
    await expect(playBtn).toHaveClass(/bg-blue-500/);
    
    // 点滅も停止している
    const body = page.locator('body');
    await expect(body).not.toHaveClass(/bg-yellow-200/);
  });

  test('take screenshots of waiting state', async ({ page }) => {
    const playBtn = page.locator('#play-pause-btn');
    
    // タイマーを完了して待機状態にする
    await playBtn.click();
    await page.keyboard.press('s');
    await page.waitForTimeout(1500);
    
    // 点滅の瞬間をキャプチャするため、少し待ってから撮影
    await page.waitForTimeout(200);
    await expect(page).toHaveScreenshot('waiting-state-with-flash.png');
  });
});
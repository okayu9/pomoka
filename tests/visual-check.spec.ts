import { test, expect } from '@playwright/test';

test('ポモドーロタイマーの動作確認', async ({ page }) => {
  // ページを開く
  await page.goto('/');
  
  // スクリーンショットを撮る（初期状態）
  await page.screenshot({ path: 'screenshots/initial-state.png', fullPage: true });
  
  // 基本要素の確認
  await expect(page.locator('#time-display')).toHaveText('25:00');
  
  // スタートボタンをクリック
  await page.click('#play-pause-btn');
  
  // 1秒待機してタイマーが動いているか確認
  await page.waitForTimeout(1500);
  const timeAfter1Sec = await page.locator('#time-display').textContent();
  expect(timeAfter1Sec).not.toBe('25:00');
  
  // スクリーンショットを撮る（作業中）
  await page.screenshot({ path: 'screenshots/working-state.png', fullPage: true });
  
  // 一時停止ボタンをクリック（同じボタン）
  await page.click('#play-pause-btn');
  
  // スクリーンショットを撮る（一時停止）
  await page.screenshot({ path: 'screenshots/paused-state.png', fullPage: true });
  
  // リセットボタンを長押し（1秒以上）
  await page.hover('#reset-btn');
  await page.mouse.down();
  await page.waitForTimeout(1200); // 1.2秒待機（1秒の長押し + 余裕）
  await page.mouse.up();
  
  // タイマーがリセットされることを確認
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

test('設定画面の動作確認', async ({ page }) => {
  await page.goto('/');
  
  // 設定ボタンをクリック
  await page.click('#settings-btn');
  
  // 設定画面が表示されることを確認
  await expect(page.locator('h1')).toHaveText('設定');
  
  // デフォルト値の確認
  await expect(page.locator('#work-minutes')).toHaveValue('25');
  await expect(page.locator('#break-minutes')).toHaveValue('5');
  await expect(page.locator('#long-break-minutes')).toHaveValue('15');
  await expect(page.locator('#cycles-until-long-break')).toHaveValue('4');
  await expect(page.locator('#long-break-enabled')).toBeChecked();
  
  // スクリーンショットを撮る（設定画面）
  await page.screenshot({ path: 'screenshots/settings-screen.png', fullPage: true });
  
  // 長い休憩を無効にして設定項目が非表示になることを確認
  await page.uncheck('#long-break-enabled');
  await expect(page.locator('#long-break-settings')).toHaveClass(/hidden/);
  
  // 長い休憩を再度有効にして設定項目が表示されることを確認
  await page.check('#long-break-enabled');
  await expect(page.locator('#long-break-settings')).not.toHaveClass(/hidden/);
  
  // 設定を変更
  await page.fill('#work-minutes', '30');
  await page.fill('#break-minutes', '10');
  
  // 保存ボタンをクリック
  await page.click('#save-settings');
  
  // タイマー画面に戻ることを確認
  await expect(page.locator('#time-display')).toBeVisible();
  await expect(page.locator('#time-display')).toHaveText('30:00');
  
  console.log('✅ 設定画面の動作が正常です');
});

test('デバッグショートカット機能', async ({ page }) => {
  await page.goto('/');
  
  // タイマーを開始
  await page.click('#play-pause-btn');
  await page.waitForTimeout(500);
  
  // sキーを押してスキップ
  await page.keyboard.press('s');
  
  // 残り時間が00:01になることを確認
  await expect(page.locator('#time-display')).toHaveText('00:01');
  
  console.log('✅ デバッグショートカット機能が正常です');
});

test('リセットボタンの長押し機能', async ({ page }) => {
  await page.goto('/');
  
  // タイマーを開始して少し進める
  await page.click('#play-pause-btn');
  await page.waitForTimeout(2000);
  
  // 短いタップでは何も起こらないことを確認
  await page.click('#reset-btn');
  await page.waitForTimeout(100);
  const timeAfterShortTap = await page.locator('#time-display').textContent();
  expect(timeAfterShortTap).not.toBe('25:00');
  
  // 長押しでリセットされることを確認
  await page.locator('#reset-btn').hover();
  await page.mouse.down();
  await page.waitForTimeout(1200);
  await page.mouse.up();
  
  await expect(page.locator('#time-display')).toHaveText('25:00');
  
  console.log('✅ リセットボタンの長押し機能が正常です');
});

test('プログレス円の色変更', async ({ page }) => {
  await page.goto('/');
  
  // 初期状態（青）
  let progressCircle = page.locator('#progress-circle');
  await expect(progressCircle).toHaveAttribute('stroke', '#3b82f6');
  
  // 作業中（赤）
  await page.click('#play-pause-btn');
  await page.waitForTimeout(500);
  await expect(progressCircle).toHaveAttribute('stroke', '#dc2626');
  
  // 一時停止（グレー）
  await page.click('#play-pause-btn');
  await expect(progressCircle).toHaveAttribute('stroke', '#6b7280');
  
  console.log('✅ プログレス円の色変更が正常です');
});

test('長い休憩機能のテスト', async ({ page }) => {
  await page.goto('/');
  
  // 設定で短い時間に変更（テストを高速化）
  await page.click('#settings-btn');
  await page.fill('#work-minutes', '1');
  await page.fill('#break-minutes', '1');
  await page.fill('#long-break-minutes', '2');
  await page.fill('#cycles-until-long-break', '2');
  await page.click('#save-settings');
  
  // 1回目の作業セッション
  await page.click('#play-pause-btn');
  await page.keyboard.press('s'); // スキップ
  await page.waitForTimeout(2000); // 完了待ち
  
  // 1回目の短い休憩（緑色）
  await expect(page.locator('#progress-circle')).toHaveAttribute('stroke', '#16a34a');
  await page.keyboard.press('s'); // スキップ
  await page.waitForTimeout(2000); // 完了待ち
  
  // 2回目の作業セッション
  await page.keyboard.press('s'); // スキップ
  await page.waitForTimeout(2000); // 完了待ち
  
  // 2回目完了後は長い休憩（紫色）
  await expect(page.locator('#progress-circle')).toHaveAttribute('stroke', '#8b5cf6');
  await expect(page.locator('#time-display')).toHaveText('02:00');
  
  console.log('✅ 長い休憩機能が正常です');
});

test('長い休憩無効時のテスト', async ({ page }) => {
  await page.goto('/');
  
  // 設定で長い休憩を無効にし、短い時間に変更
  await page.click('#settings-btn');
  await page.fill('#work-minutes', '1');
  await page.fill('#break-minutes', '1');
  await page.uncheck('#long-break-enabled');
  await page.click('#save-settings');
  
  // 複数回のサイクルを実行
  for (let i = 0; i < 3; i++) {
    // 作業セッション
    await page.click('#play-pause-btn');
    await page.keyboard.press('s'); // スキップ
    await page.waitForTimeout(2000); // 完了待ち
    
    // 常に短い休憩のはず
    await expect(page.locator('#progress-circle')).toHaveAttribute('stroke', '#16a34a');
    await expect(page.locator('#time-display')).toHaveText('01:00');
    
    await page.keyboard.press('s'); // 休憩スキップ
    await page.waitForTimeout(2000); // 完了待ち
  }
  
  console.log('✅ 長い休憩無効時の動作が正常です');
});

test('ボタンサイズの確認', async ({ page }) => {
  await page.goto('/');
  
  const playPauseBtn = page.locator('#play-pause-btn');
  const resetBtn = page.locator('#reset-btn');
  
  // 小画面でのボタンサイズ確認
  await page.setViewportSize({ width: 375, height: 667 });
  
  const playBtnBox = await playPauseBtn.boundingBox();
  const resetBtnBox = await resetBtn.boundingBox();
  
  expect(playBtnBox?.width).toBe(80); // w-20 = 80px
  expect(playBtnBox?.height).toBe(80); // h-20 = 80px
  expect(resetBtnBox?.width).toBe(80);
  expect(resetBtnBox?.height).toBe(80);
  
  // 中画面でのボタンサイズ確認
  await page.setViewportSize({ width: 1024, height: 768 });
  
  const playBtnBoxLarge = await playPauseBtn.boundingBox();
  const resetBtnBoxLarge = await resetBtn.boundingBox();
  
  expect(playBtnBoxLarge?.width).toBe(96); // w-24 = 96px
  expect(playBtnBoxLarge?.height).toBe(96); // h-24 = 96px
  expect(resetBtnBoxLarge?.width).toBe(96);
  expect(resetBtnBoxLarge?.height).toBe(96);
  
  console.log('✅ ボタンサイズが正常です');
});

test('アイコンサイズの確認', async ({ page }) => {
  await page.goto('/');
  
  // アイコンのサイズを確認
  const playIcon = page.locator('#play-pause-btn svg');
  const resetIcon = page.locator('#reset-btn svg');
  const settingsIcon = page.locator('#settings-btn svg');
  
  await expect(playIcon).toHaveAttribute('width', '32');
  await expect(playIcon).toHaveAttribute('height', '32');
  await expect(resetIcon).toHaveAttribute('width', '32');
  await expect(resetIcon).toHaveAttribute('height', '32');
  await expect(settingsIcon).toHaveAttribute('width', '24');
  await expect(settingsIcon).toHaveAttribute('height', '24');
  
  console.log('✅ アイコンサイズが正常です');
});

test('タイマーの連続動作テスト', async ({ page }) => {
  await page.goto('/');
  
  // 設定で極短い時間に変更
  await page.click('#settings-btn');
  await page.fill('#work-minutes', '1');
  await page.fill('#break-minutes', '1');
  await page.fill('#long-break-minutes', '1');
  await page.fill('#cycles-until-long-break', '2');
  await page.click('#save-settings');
  
  // 完全な1サイクル（作業→休憩→作業→長い休憩→作業）をテスト
  const states = ['work', 'break', 'work', 'longBreak', 'work'];
  const colors = ['#dc2626', '#16a34a', '#dc2626', '#8b5cf6', '#dc2626'];
  
  for (let i = 0; i < states.length; i++) {
    if (i === 0) {
      await page.click('#play-pause-btn'); // 最初だけスタート
    }
    
    await page.keyboard.press('s'); // 各セッションをスキップ
    await page.waitForTimeout(2000); // 次のセッション開始待ち
    
    if (i < states.length - 1) {
      await expect(page.locator('#progress-circle')).toHaveAttribute('stroke', colors[i + 1]);
    }
  }
  
  console.log('✅ タイマーの連続動作が正常です');
});

test('エラー処理とエッジケース', async ({ page }) => {
  await page.goto('/');
  
  // 設定画面で無効な値を入力
  await page.click('#settings-btn');
  
  await page.fill('#work-minutes', '0');
  await page.fill('#break-minutes', '-1');
  await page.click('#save-settings');
  
  // 無効な設定は保存されないことを確認（画面が変わらない）
  await expect(page.locator('h1')).toHaveText('設定');
  
  // 有効な値に戻して保存
  await page.fill('#work-minutes', '25');
  await page.fill('#break-minutes', '5');
  await page.click('#save-settings');
  
  // 正常に戻ることを確認
  await expect(page.locator('#time-display')).toHaveText('25:00');
  
  console.log('✅ エラー処理が正常です');
});
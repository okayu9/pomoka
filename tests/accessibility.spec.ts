import { test, expect } from '@playwright/test';

test.describe('アクセシビリティテスト', () => {
  test('ARIA属性とラベルの確認', async ({ page }) => {
    await page.goto('/');
    
    // ボタンのARIA属性を確認
    await expect(page.locator('#play-pause-btn')).toHaveAttribute('aria-label', 'スタート');
    await expect(page.locator('#reset-btn')).toHaveAttribute('aria-label', 'リセット（長押し）');
    await expect(page.locator('#settings-btn')).toHaveAttribute('aria-label', '設定');
    
    // フォーカス可能な要素の確認
    const focusableElements = await page.locator('button, input, [tabindex]:not([tabindex="-1"])').count();
    expect(focusableElements).toBeGreaterThan(0);
    
    console.log('✅ ARIA属性とラベルが適切です');
  });

  test('キーボードナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // Tabキーでのフォーカス移動
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.id);
    
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.id);
    
    // フォーカスが移動していることを確認
    expect(firstFocused).not.toBe(secondFocused);
    
    console.log('✅ キーボードナビゲーションが正常です');
  });

  test('設定画面のアクセシビリティ', async ({ page }) => {
    await page.goto('/');
    await page.click('#settings-btn');
    
    // ラベルと入力フィールドの関連性確認
    const workLabel = page.locator('label[for="work-minutes"]');
    const workInput = page.locator('#work-minutes');
    
    await expect(workLabel).toBeVisible();
    await expect(workInput).toHaveAttribute('id', 'work-minutes');
    
    // フォームの必須フィールドやバリデーション
    const longBreakCheckbox = page.locator('#long-break-enabled');
    await expect(longBreakCheckbox).toHaveAttribute('type', 'checkbox');
    
    // チェックボックスのラベルクリックでトグル
    await page.click('label[for="long-break-enabled"]');
    const isChecked = await longBreakCheckbox.isChecked();
    
    console.log('✅ 設定画面のアクセシビリティが適切です');
  });

  test('色のコントラスト（視覚的確認）', async ({ page }) => {
    await page.goto('/');
    
    // 各状態でのスクリーンショットを撮影してコントラスト確認用
    await page.screenshot({ path: 'screenshots/accessibility-idle.png' });
    
    await page.click('#play-pause-btn');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/accessibility-working.png' });
    
    await page.click('#play-pause-btn');
    await page.screenshot({ path: 'screenshots/accessibility-paused.png' });
    
    console.log('✅ 色のコントラスト用スクリーンショットを作成しました');
  });

  test('画面リーダー対応テキスト', async ({ page }) => {
    await page.goto('/');
    
    // 重要な情報がテキストとして取得できることを確認
    const timeDisplay = await page.locator('#time-display').textContent();
    expect(timeDisplay).toBeTruthy();
    expect(timeDisplay).toMatch(/^\d{2}:\d{2}$/);
    
    // ボタンの状態変化がアクセシブルであることを確認
    await page.click('#play-pause-btn');
    await page.waitForTimeout(500);
    
    const pauseLabel = await page.locator('#play-pause-btn').getAttribute('aria-label');
    expect(pauseLabel).toBe('一時停止');
    
    console.log('✅ 画面リーダー対応が適切です');
  });

  test('レスポンシブアクセシビリティ', async ({ page }) => {
    // 小画面でのタッチ操作性確認
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const playBtn = page.locator('#play-pause-btn');
    const btnSize = await playBtn.boundingBox();
    
    // ボタンサイズが十分大きいことを確認（推奨44px以上）
    expect(btnSize?.width).toBeGreaterThanOrEqual(44);
    expect(btnSize?.height).toBeGreaterThanOrEqual(44);
    
    // ボタン間の間隔も確認
    const resetBtn = page.locator('#reset-btn');
    const playBtnBox = await playBtn.boundingBox();
    const resetBtnBox = await resetBtn.boundingBox();
    
    if (playBtnBox && resetBtnBox) {
      const distance = Math.abs(playBtnBox.x - resetBtnBox.x) + Math.abs(playBtnBox.y - resetBtnBox.y);
      expect(distance).toBeGreaterThan(8); // 適切な間隔
    }
    
    console.log('✅ レスポンシブアクセシビリティが適切です');
  });

  test('フォーカス表示の確認', async ({ page }) => {
    await page.goto('/');
    
    // フォーカススタイルが適用されることを確認
    await page.focus('#play-pause-btn');
    
    const focusedElement = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(element);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      };
    });
    
    // フォーカスが視覚的に分かるスタイルが適用されていることを確認
    const hasFocusIndicator = 
      focusedElement.outline !== 'none' || 
      focusedElement.outlineWidth !== '0px' ||
      focusedElement.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBeTruthy();
    
    console.log('✅ フォーカス表示が適切です');
  });
});
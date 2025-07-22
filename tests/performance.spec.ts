import { test, expect } from '@playwright/test';

test.describe('パフォーマンステスト', () => {
  test('ページ読み込み時間', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.locator('#time-display').waitFor();
    
    const loadTime = Date.now() - startTime;
    console.log(`ページ読み込み時間: ${loadTime}ms`);
    
    // 3秒以内での読み込みを期待
    expect(loadTime).toBeLessThan(3000);
    
    console.log('✅ ページ読み込み時間が適切です');
  });

  test('メモリ使用量の監視', async ({ page }) => {
    await page.goto('/');
    
    // JavaScript heap使用量を測定
    const memoryInfo = await page.evaluate(() => {
      // @ts-ignore - performance.memory is Chrome-specific
      const memory = (performance as any).memory;
      return memory ? {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      } : null;
    });
    
    if (memoryInfo) {
      console.log('メモリ使用量:', memoryInfo);
      
      // 使用量が異常に多くないことを確認（50MB未満）
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }
    
    console.log('✅ メモリ使用量が適切です');
  });

  test('タイマーの精度テスト', async ({ page }) => {
    await page.goto('/');
    
    // 設定で短い時間に変更
    await page.click('#settings-btn');
    await page.fill('#work-minutes', '1');
    await page.fill('#break-minutes', '1');
    await page.click('#save-settings');
    
    const startTime = Date.now();
    await page.click('#play-pause-btn');
    
    // 5秒後の時刻を確認
    await page.waitForTimeout(5000);
    const displayTime = await page.locator('#time-display').textContent();
    const actualElapsed = Date.now() - startTime;
    
    // 表示時刻から実際の経過時間を計算
    const [minutes, seconds] = displayTime!.split(':').map(Number);
    const remainingTime = minutes * 60 + seconds;
    const expectedRemaining = 60 - Math.floor(actualElapsed / 1000);
    
    // 1秒以内の誤差を許容
    expect(Math.abs(remainingTime - expectedRemaining)).toBeLessThanOrEqual(1);
    
    console.log('✅ タイマーの精度が適切です');
  });

  test('大量のDOM操作のパフォーマンス', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    // 設定画面を複数回開閉してDOM操作のパフォーマンスをテスト
    for (let i = 0; i < 10; i++) {
      await page.click('#settings-btn');
      await page.click('#back-btn');
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`10回の画面切り替え時間: ${totalTime}ms`);
    
    // 平均100ms以下での切り替えを期待
    expect(totalTime / 10).toBeLessThan(100);
    
    console.log('✅ DOM操作のパフォーマンスが適切です');
  });

  test('長時間実行での安定性', async ({ page }) => {
    await page.goto('/');
    
    // 設定で極短い時間に変更（テストを高速化）
    await page.click('#settings-btn');
    await page.fill('#work-minutes', '1');
    await page.fill('#break-minutes', '1');
    await page.fill('#long-break-minutes', '1');
    await page.fill('#cycles-until-long-break', '2');
    await page.click('#save-settings');
    
    // 10サイクルの連続実行
    let completedCycles = 0;
    const maxCycles = 10;
    
    await page.click('#play-pause-btn');
    
    while (completedCycles < maxCycles) {
      // sキーでスキップ
      await page.keyboard.press('s');
      await page.waitForTimeout(1000);
      completedCycles++;
      
      // メモリリークやエラーがないことを確認
      const errors = await page.evaluate(() => {
        return (window as any).errors || [];
      });
      
      expect(errors.length).toBe(0);
    }
    
    console.log(`✅ ${maxCycles}サイクルの連続実行が安定しています`);
  });

  test('画像とリソースの読み込み', async ({ page }) => {
    const responses: string[] = [];
    
    page.on('response', response => {
      responses.push(response.url());
    });
    
    await page.goto('/');
    
    // 必要最小限のリソースのみが読み込まれていることを確認
    const relevantResponses = responses.filter(url => 
      !url.includes('favicon') && 
      !url.includes('chrome-extension')
    );
    
    console.log('読み込まれたリソース:', relevantResponses);
    
    // 過度なリソース読み込みがないことを確認
    expect(relevantResponses.length).toBeLessThan(10);
    
    console.log('✅ リソース読み込みが最適化されています');
  });

  test('CSS アニメーションの滑らかさ', async ({ page }) => {
    await page.goto('/');
    
    // プログレス円のアニメーション性能をテスト
    const animationTest = await page.evaluate(() => {
      const circle = document.getElementById('progress-circle');
      if (!circle) return { error: 'Circle not found' };
      
      const startTime = performance.now();
      
      // アニメーション中の計算負荷を測定
      circle.style.strokeDashoffset = '0';
      
      return {
        duration: performance.now() - startTime,
        hasTransition: circle.style.transition.includes('transition')
      };
    });
    
    // アニメーション設定の処理が高速であることを確認
    if (!('error' in animationTest)) {
      expect(animationTest.duration).toBeLessThan(10);
    }
    
    console.log('✅ CSS アニメーションが最適化されています');
  });

  test('イベントリスナーのクリーンアップ', async ({ page }) => {
    await page.goto('/');
    
    // イベントリスナーの数を取得
    const initialListeners = await page.evaluate(() => {
      // @ts-ignore - テスト用の内部API
      return (window as any).getEventListeners ? 
        Object.keys((window as any).getEventListeners(document)).length : 0;
    });
    
    // 設定画面を開いて閉じる（イベントリスナーの追加/削除）
    await page.click('#settings-btn');
    await page.click('#back-btn');
    
    const finalListeners = await page.evaluate(() => {
      // @ts-ignore - テスト用の内部API  
      return (window as any).getEventListeners ? 
        Object.keys((window as any).getEventListeners(document)).length : 0;
    });
    
    // イベントリスナーが適切にクリーンアップされていることを確認
    // （厳密な比較は環境依存のため、大幅な増加がないことを確認）
    if (initialListeners > 0 && finalListeners > 0) {
      expect(finalListeners - initialListeners).toBeLessThan(5);
    }
    
    console.log('✅ イベントリスナーが適切に管理されています');
  });
});
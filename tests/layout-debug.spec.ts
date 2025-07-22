import { test, expect } from '@playwright/test';

test.describe('Layout Debug', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('debug current layout issues', async ({ page }) => {
    // 現在のレイアウトをスクリーンショット
    await expect(page).toHaveScreenshot('current-layout-debug.png');
    
    // SVG要素のサイズと位置を確認
    const svg = page.locator('svg').first();
    const svgBox = await svg.boundingBox();
    console.log('SVG bounding box:', svgBox);
    
    // 時間表示要素のサイズと位置を確認
    const timeDisplay = page.locator('#time-display');
    const timeBox = await timeDisplay.boundingBox();
    console.log('Time display bounding box:', timeBox);
    
    // SVGの属性を確認
    const svgAttrs = await svg.evaluate((el) => ({
      width: el.getAttribute('width'),
      height: el.getAttribute('height'),
      class: el.getAttribute('class')
    }));
    console.log('SVG attributes:', svgAttrs);
    
    // 円の中心座標を確認
    const circles = page.locator('circle');
    const circleAttrs = await circles.first().evaluate((el) => ({
      cx: el.getAttribute('cx'),
      cy: el.getAttribute('cy'),
      r: el.getAttribute('r')
    }));
    console.log('Circle attributes:', circleAttrs);
    
    // 時間表示のスタイルを確認
    const timeStyles = await timeDisplay.evaluate((el) => ({
      position: getComputedStyle(el).position,
      top: getComputedStyle(el).top,
      left: getComputedStyle(el).left,
      width: getComputedStyle(el).width,
      height: getComputedStyle(el).height,
      display: getComputedStyle(el).display,
      alignItems: getComputedStyle(el).alignItems,
      justifyContent: getComputedStyle(el).justifyContent,
      fontSize: getComputedStyle(el).fontSize,
      lineHeight: getComputedStyle(el).lineHeight
    }));
    console.log('Time display styles:', timeStyles);
  });
});
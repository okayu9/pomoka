import { readFile, writeFile, mkdir } from 'fs/promises';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '../public');

// アイコンサイズの定義
const iconSizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 }
];

async function generateIcons() {
  try {
    console.log('🎨 アイコン生成を開始します...');
    
    // 元画像を読み込み
    const sourceIconPath = join(publicDir, 'icon.png');
    const sourceImage = await loadImage(sourceIconPath);
    
    console.log(`📐 元画像サイズ: ${sourceImage.width}x${sourceImage.height}`);
    
    // 各サイズのアイコンを生成
    for (const { name, size } of iconSizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // 高品質な縮小のため、スムージングを有効化
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 画像をキャンバスに描画（リサイズ）
      ctx.drawImage(sourceImage, 0, 0, size, size);
      
      // PNGバッファを取得
      const buffer = canvas.toBuffer('image/png');
      
      // ファイルに保存
      const outputPath = join(publicDir, name);
      await writeFile(outputPath, buffer);
      
      console.log(`✅ ${name} (${size}x${size}) を生成しました`);
    }
    
    // favicon.icoを生成（32x32を使用）
    await generateFavicon();
    
    console.log('🎉 全てのアイコンが生成されました！');
    
  } catch (error) {
    console.error('❌ アイコン生成でエラーが発生しました:', error.message);
    process.exit(1);
  }
}

async function generateFavicon() {
  try {
    // 32x32のPNGからfavicon.icoを生成（簡易版）
    const favicon32Path = join(publicDir, 'favicon-32x32.png');
    const faviconIcoPath = join(publicDir, 'favicon.ico');
    
    // 簡易的にPNGをICOとしてコピー（完全なICO形式ではないが、現代のブラウザでは動作）
    const pngBuffer = await readFile(favicon32Path);
    await writeFile(faviconIcoPath, pngBuffer);
    
    console.log('✅ favicon.ico を生成しました');
  } catch (error) {
    console.warn('⚠️  favicon.ico の生成に失敗しました:', error.message);
  }
}

// スクリプト実行
generateIcons();
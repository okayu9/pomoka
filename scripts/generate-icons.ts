import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// アイコンサイズの定義
const iconSizes = [
  { name: 'pwa-192x192.png', size: 192, description: 'PWA アイコン (小)' },
  { name: 'pwa-512x512.png', size: 512, description: 'PWA アイコン (大)' },
  { name: 'favicon-32x32.png', size: 32, description: 'ファビコン (標準)' },
  { name: 'favicon-16x16.png', size: 16, description: 'ファビコン (小)' },
  { name: 'apple-touch-icon.png', size: 180, description: 'Apple Touch アイコン' }
];

async function generateIcons() {
  try {
    console.log('🎨 アイコン生成を開始します...');
    
    const publicDir = join(process.cwd(), 'public');
    const sourceIconPath = join(publicDir, 'icon.png');
    
    // 元画像の存在確認
    if (!existsSync(sourceIconPath)) {
      throw new Error('public/icon.png が見つかりません');
    }
    
    // 元画像の情報を取得
    const metadata = await sharp(sourceIconPath).metadata();
    console.log(`📐 元画像サイズ: ${metadata.width}x${metadata.height}`);
    
    if (!metadata.width || !metadata.height) {
      throw new Error('画像のメタデータを読み取れませんでした');
    }
    
    // 各サイズのアイコンを生成
    for (const { name, size, description } of iconSizes) {
      const outputPath = join(publicDir, name);
      
      await sharp(sourceIconPath)
        .resize(size, size, {
          kernel: sharp.kernel.lanczos3,
          fit: 'cover',
          position: 'center'
        })
        .png({ 
          quality: 90,
          compressionLevel: 9,
          palette: true
        })
        .toFile(outputPath);
      
      console.log(`✅ ${name} (${size}x${size}) - ${description}`);
    }
    
    // favicon.ico を生成
    await generateFavicon(publicDir);
    
    console.log('🎉 全てのアイコンが正常に生成されました！');
    console.log('\n📋 生成されたファイル:');
    for (const { name } of iconSizes) {
      console.log(`   - public/${name}`);
    }
    console.log('   - public/favicon.ico');
    
  } catch (error) {
    console.error('❌ アイコン生成中にエラーが発生しました:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function generateFavicon(publicDir: string) {
  try {
    const sourceIconPath = join(publicDir, 'icon.png');
    const faviconPath = join(publicDir, 'favicon.ico');
    
    // 32x32と16x16のマルチサイズICOファイルを生成
    await sharp(sourceIconPath)
      .resize(32, 32, {
        kernel: sharp.kernel.lanczos3,
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(faviconPath);
    
    console.log('✅ favicon.ico (32x32) - ブラウザファビコン');
  } catch (error) {
    console.warn('⚠️  favicon.ico の生成に失敗しました:', error);
  }
}

// 進行状況表示付きでスクリプト実行
async function main() {
  const startTime = Date.now();
  await generateIcons();
  const endTime = Date.now();
  console.log(`\n⏱️  処理時間: ${endTime - startTime}ms`);
}

// スクリプトとして実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateIcons };
# Pomoka - ポモドーロタイマー

スマートフォン向けのシンプルなポモドーロタイマーアプリです。

## 機能

- 25分作業 + 5分休憩の基本ポモドーロサイクル
- 設定可能な作業時間・休憩時間
- 長い休憩機能（設定したサイクル数後に自動で長い休憩）
- 長い休憩の有効/無効切り替え
- 視覚的なプログレス表示（円形）
- 画面フラッシュによる通知
- レスポンシブデザイン（縦画面・横画面対応）
- PWA対応（オフライン使用可能）

## 開発環境

- Vite + TypeScript
- Tailwind CSS v4
- Playwright（テスト）

## セットアップ

```bash
npm install

# アイコン生成（public/icon.pngから自動生成）
npm run generate-icons

npm run dev
```

## アイコンの設定

`public/icon.png`（推奨サイズ512x512以上）を配置すると、以下のアイコンが自動生成されます：

- `pwa-192x192.png` - PWAアイコン（小）
- `pwa-512x512.png` - PWAアイコン（大）  
- `apple-touch-icon.png` - iOSアイコン（180x180）
- `favicon-32x32.png` - ファビコン（標準）
- `favicon-16x16.png` - ファビコン（小）
- `favicon.ico` - レガシーファビコン

## テスト

### すべてのテストを実行
```bash
npm test
```

### カテゴリ別テスト
```bash
# 視覚的・機能テスト
npm run test:visual

# ユニットテスト
npm run test:unit

# アクセシビリティテスト
npm run test:accessibility

# パフォーマンステスト
npm run test:performance

# テストレポート表示
npm run test:report
```

## テストカバレッジ

### 機能テスト (visual-check.spec.ts)
- 基本的なタイマー動作（開始・一時停止・リセット）
- 設定画面の操作と設定保存
- レスポンシブデザインの確認
- デバッグショートカット（sキー）
- 長押しリセット機能
- プログレス円の色変更
- 長い休憩機能の動作
- ボタンサイズとアイコンサイズ
- タイマーの連続動作
- エラー処理とバリデーション

### ユニットテスト (timer-unit.spec.ts)
- タイマークラスの基本機能
- 設定値の保存・読み込み
- 時間フォーマット関数
- プログレス円の計算ロジック

### アクセシビリティテスト (accessibility.spec.ts)
- ARIA属性とラベル
- キーボードナビゲーション
- フォーカス表示
- 色のコントラスト
- 画面リーダー対応
- タッチ操作性（最小サイズ44px以上）

### パフォーマンステスト (performance.spec.ts)
- ページ読み込み時間（3秒以内）
- メモリ使用量監視
- タイマー精度
- DOM操作のパフォーマンス
- 長時間実行での安定性
- リソース読み込み最適化
- CSS アニメーションの滑らかさ
- イベントリスナーのクリーンアップ

## ビルド

```bash
npm run build
npm run preview
```

## 使用方法

1. 再生ボタンで作業セッション開始
2. 設定ボタンで時間やサイクル数を調整
3. リセットボタン長押しでタイマーリセット
4. デバッグ用：sキーで残り1秒までスキップ

## PWA機能

- オフライン使用可能
- ホーム画面に追加可能
- アプリライクな体験

## デプロイ

このプロジェクトはGitHub Actionsを使用してGitHub Pagesに自動デプロイされます。

### セットアップ手順

1. GitHubリポジトリの設定で Pages を有効化
2. Source を "GitHub Actions" に設定
3. メインブランチにプッシュすると自動デプロイ実行

### 手動デプロイ

```bash
# 本番環境用ビルド
NODE_ENV=production npm run build

# プレビュー
npm run preview
```

### GitHub Actions

- **アイコン自動生成**: public/icon.pngから各種アイコン生成
- **最適化ビルド**: TypeScript + Vite
- **GitHub Pagesデプロイ**: dist/フォルダを公開
- **PWA対応**: Service Worker とマニフェスト生成

### ローカルテスト

```bash
# 全テスト実行
npm test

# カテゴリ別テスト  
npm run test:visual
npm run test:accessibility
npm run test:performance
```
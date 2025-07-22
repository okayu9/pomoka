import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: 'http://localhost:5173',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // スクリーンショット用の固定サイズ
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // モバイルテスト用
      },
    },
    {
      name: 'accessibility',
      testMatch: '**/accessibility.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        // アクセシビリティテスト専用設定
        reducedMotion: 'reduce',
      },
    },
    {
      name: 'performance',
      testMatch: '**/performance.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        // パフォーマンステスト用設定
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--disable-background-networking']
        }
      },
    }
  ],

  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
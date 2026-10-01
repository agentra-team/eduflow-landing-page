import { defineConfig, devices } from '@playwright/test'

const PORT = 3200
export const BASE_URL = `http://localhost:${PORT}`

const MODE = process.env.E2E_MODE === 'prelaunch' ? 'prelaunch' : process.env.E2E_MODE === 'oneos' ? 'oneos' : 'feed'
// Mỗi chế độ chạy đúng spec của nó: feed → download, sắp phát hành → prelaunch, một hệ điều hành → oneos.
const MODE_SPECS = { feed: /download\.spec\.ts/, prelaunch: /prelaunch\.spec\.ts/, oneos: /oneos\.spec\.ts/ }
const MODE_IGNORE = Object.entries(MODE_SPECS).filter(([m]) => m !== MODE).map(([, re]) => re)

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  webServer: [
    ...(MODE === 'feed' ? [{ command: 'node scripts/serve-fixtures.mjs', url: 'http://localhost:3300/latest.yml', reuseExistingServer: true }] : []),
    ...(MODE === 'oneos'
      ? [{ command: 'node scripts/serve-fixtures.mjs', url: 'http://localhost:3301/latest.yml', env: { FIXTURE_PORT: '3301', FIXTURE_MISSING: 'latest-mac.yml' }, reuseExistingServer: true }]
      : []),
    { command: `pnpm start -p ${PORT}`, url: BASE_URL, reuseExistingServer: !process.env.CI, timeout: 60_000 },
  ],
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, testIgnore: [/mobile\.spec\.ts/, ...MODE_IGNORE] },
    // Spec §13 yêu cầu kiểm menu mobile ở 390 px, cũng là bề rộng artboard điện thoại trên canvas.
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } }, testMatch: /mobile\.spec\.ts/ },
  ],
})

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // The real map geometry is intentionally loaded in E2E; allow slower software WebGL runners room to finish.
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    // Full Chromium can use the local GPU; headless-shell forces slow software GL.
    channel: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});

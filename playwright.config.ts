import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Superalignment Simulation
 *
 * Tests defensive fallback prevention - ensures dashboards fail loudly
 * when data is missing instead of showing fake values.
 */

export default defineConfig({
  testDir: './e2e',

  // Run tests in parallel
  fullyParallel: true,

  // Fail build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI
  retries: process.env.CI ? 2 : 0,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  // Shared settings for all tests
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:3333',

    // Collect trace when retrying failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3333',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for server startup
  },
});

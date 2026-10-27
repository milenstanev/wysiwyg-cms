import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 8,
  reporter: "html",
  /** Whole-test budget (not per assertion). */
  timeout: 30000,
  /** Default for expect(locator).toBeVisible() / toHaveText() / etc. */
  expect: {
    timeout: 3000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    /** Clicks, fills, navigations — keep in sync with expect timeout. */
    actionTimeout: 3000,
    navigationTimeout: 15000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});

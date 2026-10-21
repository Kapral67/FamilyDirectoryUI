import { defineConfig, devices } from '@playwright/test';
import { APP_ENV, APP_ORIGIN, APP_PORT } from './e2e/support/env';

const OUT_DIR = 'build-e2e';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: APP_ORIGIN,
        locale: 'en-US',
        timezoneId: 'America/Los_Angeles',
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        command: `npx vite build --outDir ${OUT_DIR} && npx vite preview --outDir ${OUT_DIR} --port ${APP_PORT} --strictPort`,
        url: APP_ORIGIN,
        env: APP_ENV,
        reuseExistingServer: false,
        timeout: 120_000,
    },
});

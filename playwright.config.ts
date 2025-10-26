import { defineConfig, devices } from '@playwright/test';

import 'dotenv/config';

export default defineConfig({
  testDir: './tests',

  timeout: 40000,

  fullyParallel: true,

  retries: process.env.CI ? 2 : 0,

  workers: undefined,

  reporter: 'html',

  // Configuration for the browser and device to use for testing
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: process.env.CI ? 'npm start' : 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos
  },



  // Projects configuration for testing , different browsers and devices with their own settings
  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Usar el estado de autenticación guardado para evitar login repetitivo
        storageState: 'storageState.json',
      },
      dependencies: ['setup'],
    },

  ]
});

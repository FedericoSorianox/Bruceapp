import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 40000,
  fullyParallel: false, // Deshabilitar paralelización para evitar conflictos de autenticación
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Usar solo 1 worker para evitar conflictos de storageState
  reporter: 'html',
  globalSetup: './tests/fixtures/login.setup.ts',
  // Configuration for the browser and device to use for testing
  use: {
    baseURL: 'https://bruceapp.onrender.com/',
    trace: 'on-first-retry',
    // Usar el estado de autenticación guardado para evitar login repetitivo
    storageState: 'storageState.json',
  },
 

  
  // Projects configuration for testing , different browsers and devices with their own settings
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },


 ]});

/**
 * Playwright Fixtures - Configuraciones específicas de Playwright para tests
 * Este archivo contiene fixtures personalizados para mejorar la reutilización de código
 */

import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { CultivoPage } from '../page-objects/CultivoPage';
import { testUsers } from './test-data';

/**
 * Fixture que proporciona las Page Objects principales
 */
export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  cultivosPage: CultivoPage;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  cultivosPage: async ({ page }, use) => {
    const cultivosPage = new CultivoPage(page);
    await use(cultivosPage);
  }
});

/**
 * Fixture que proporciona un usuario logueado
 */
export const authenticatedTest = base.extend<{
  loggedInUser: typeof testUsers.validUser;
}>({
  loggedInUser: [testUsers.validUser, { option: true }],

  page: async ({ page, loggedInUser }, use) => {
    // Realizar login automático antes de cada test
    await page.goto('/login');
    await page.getByLabel('Email').fill(loggedInUser.email);
    await page.getByLabel('Contraseña').fill(loggedInUser.password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    
    // Esperar a que el login sea exitoso
    await expect(page).toHaveURL('/');
    
    await use(page);
  }
});

/**
 * Fixture que proporciona un admin logueado
 */
export const adminTest = base.extend<{
  adminUser: typeof testUsers.adminUser;
}>({
  adminUser: [testUsers.adminUser, { option: true }],

  page: async ({ page, adminUser }, use) => {
    // Realizar login como admin antes de cada test
    await page.goto('/login');
    await page.getByLabel('Email').fill(adminUser.email);
    await page.getByLabel('Contraseña').fill(adminUser.password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    
    // Esperar a que el login sea exitoso
    await expect(page).toHaveURL('/');
    
    await use(page);
  }
});

/**
 * Fixture que proporciona limpieza automática después de cada test
 */
export const cleanTest = base.extend<object>({
  page: async ({ page }, use) => {
    await use(page);
    
    // Limpiar datos después de cada test
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
  }
});

/**
 * Fixture para tests que requieren datos específicos en la base de datos
 */
export const databaseTest = base.extend<{
  seedDatabase: () => Promise<void>;
  cleanupDatabase: () => Promise<void>;
}>({
  seedDatabase: async ({}, use) => {
    // Función para poblar la base de datos con datos de prueba
    const seedData = async () => {
      // Aquí iría la lógica para insertar datos de prueba en la BD
      console.log('Seeding database with test data...');
    };
    
    await use(seedData);
  },

  cleanupDatabase: async ({}, use) => {
    // Función para limpiar la base de datos después del test
    const cleanupData = async () => {
      // Aquí iría la lógica para limpiar datos de prueba de la BD
      console.log('Cleaning up test data from database...');
    };
    
    await use(cleanupData);
  }
});

export { expect } from '@playwright/test';

/**
 * Test Helpers - Funciones auxiliares para tests
 * Este archivo contiene funciones reutilizables que ayudan a simplificar los tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Helper para esperar que un elemento esté visible y hacer clic en él
 * @param page - Instancia de Playwright Page
 * @param selector - Selector del elemento
 * @param timeout - Tiempo máximo de espera en ms
 */
export const waitAndClick = async (
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<void> => {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.click(selector);
};

/**
 * Helper para llenar un formulario de manera más legible
 * @param page - Instancia de Playwright Page
 * @param formData - Objeto con los datos del formulario
 */
export const fillForm = async (
  page: Page,
  formData: Record<string, string>
): Promise<void> => {
  for (const [fieldName, value] of Object.entries(formData)) {
    await page.getByLabel(fieldName).fill(value);
  }
};

/**
 * Helper para verificar que estamos en la página correcta
 * @param page - Instancia de Playwright Page
 * @param expectedUrl - URL esperada
 * @param expectedTitle - Título esperado de la página
 */
export const verifyPage = async (
  page: Page,
  expectedUrl: string,
  expectedTitle?: string
): Promise<void> => {
  await expect(page).toHaveURL(expectedUrl);
  if (expectedTitle) {
    await expect(page).toHaveTitle(expectedTitle);
  }
};

/**
 * Helper para hacer login de manera rápida en tests
 * @param page - Instancia de Playwright Page
 * @param credentials - Credenciales de usuario
 */
export const performLogin = async (
  page: Page,
  credentials: { email: string; password: string }
): Promise<void> => {
  await page.goto('/login');
  await fillForm(page, {
    'Email': credentials.email,
    'Contraseña': credentials.password
  });
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.waitForURL('/');
};

/**
 * Helper para limpiar datos de test después de cada test
 * @param page - Instancia de Playwright Page
 */
export const cleanupTestData = async (page: Page): Promise<void> => {
  // Limpiar localStorage y sessionStorage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // Limpiar cookies si es necesario
  await page.context().clearCookies();
};

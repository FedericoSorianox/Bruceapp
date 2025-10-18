import { test } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { CultivoPage } from './page-objects/CultivoPage';
import { testUsers } from './fixtures/test-data';


test('Login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const cultivosPage = new CultivoPage(page);
  await loginPage.gotoLoginPage();
  await loginPage.loginButton.click();
  await page.waitForLoadState('networkidle');
  await loginPage.login('fede.danguard@gmail.com', 'Fede2020!');
  await loginPage.entrarButton.click();
  await cultivosPage.cultivoPageIsVisible();
});

test('Login with invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.gotoLoginPage();
  await loginPage.loginButton.click();
  await page.waitForLoadState('networkidle');
  await loginPage.login(testUsers.invalidUser.email, testUsers.invalidUser.password);
  await loginPage.entrarButton.click();

  // Usar el nuevo método más robusto para verificar cualquier mensaje de error
  await loginPage.expectAnyErrorMessage()
});





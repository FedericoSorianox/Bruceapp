// tests/auth.setup.ts
import { test as setup } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { testUsers } from './fixtures/test-data';

const authFile = 'storageState.json';

setup('authenticate', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Realizar el login
    await loginPage.gotoLoginPage();
    await page.waitForLoadState('networkidle');

    // Llenar las credenciales
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);

    // Hacer clic en el botón de login
    await loginPage.entrarButton.click();

    // Esperar un poco para que aparezca un posible mensaje de error
    await page.waitForTimeout(2000);

    // Verificar si hay un mensaje de error
    if (await loginPage.errorMessage.isVisible()) {
        const errorText = await loginPage.getErrorMessageText();
        throw new Error(`Login failed: ${errorText}`);
    }

    // Esperar a que la página cambie después del login exitoso
    await page.waitForURL('/', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Guardar el estado de autenticación
    await page.context().storageState({ path: authFile });
});

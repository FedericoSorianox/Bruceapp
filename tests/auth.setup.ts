// tests/auth.setup.ts
import { test as setup } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { testUsers } from './fixtures/test-data';

const authFile = 'storageState.json';

setup('authenticate', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('🔐 Starting authentication setup...');
    console.log('Using credentials:', {
        email: testUsers.validUser.email,
        password: testUsers.validUser.password ? '***' : 'undefined'
    });

    // Realizar el login
    await loginPage.gotoLoginPage();
    console.log('📍 Navigated to login page');

    await page.waitForLoadState('networkidle');

    // Verificar que estamos en la página de login
    await page.waitForSelector('input[placeholder*="email"]', { timeout: 10000 });
    console.log('✅ Login form loaded');

    // Llenar las credenciales
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    console.log('📝 Credentials filled');

    // Hacer clic en el botón de login
    await loginPage.entrarButton.click();
    console.log('🔘 Login button clicked');

    // Esperar un poco para que aparezca un posible mensaje de error
    await page.waitForTimeout(3000);

    // Verificar si hay un mensaje de error
    if (await loginPage.errorMessage.isVisible()) {
        const errorText = await loginPage.getErrorMessageText();
        console.error('❌ Login error:', errorText);
        throw new Error(`Login failed: ${errorText}`);
    }

    // Esperar a que la página cambie después del login exitoso
    // Aumentamos el timeout y agregamos alternativas de URL
    try {
        console.log('⏳ Waiting for URL change...');
        await page.waitForURL(/\/(cultivo|dashboard)/, { timeout: 30000 });
        console.log('✅ URL changed successfully');
    } catch {
        // Si falla, intentamos verificar si al menos salimos de login
        const currentUrl = page.url();
        console.log('⚠️ Timeout waiting for URL change. Current URL:', currentUrl);

        // Si seguimos en login, es un error de credenciales
        if (currentUrl.includes('/login')) {
            console.error('❌ Still on login page after attempt');
            throw new Error(`Login failed - still on login page. Current URL: ${currentUrl}`);
        }

        // Si estamos en otra página, continuamos
        console.log('✅ Login seems successful but not on expected URL. Continuing...');
    }

    await page.waitForLoadState('networkidle');

    // Guardar el estado de autenticación
    await page.context().storageState({ path: authFile });
    console.log('💾 Authentication state saved');
});

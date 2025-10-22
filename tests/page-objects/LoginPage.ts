/**
 * Page Objects - Representan las páginas de la aplicación
 * Cada página tiene sus elementos y métodos específicos
 */

import { Page, Locator, expect } from '@playwright/test';

// Fuente única para la URL base usada por Page Objects en contextos sin baseURL
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://bruceapp.onrender.com';

/**
 * Page Object para la página de Login
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly yaTenesCuentaLink: Locator;
  readonly repitePassword: Locator;
  readonly periodoDePrueba: Locator;
  readonly crearCuenta: Locator;
  readonly entrarButton: Locator;



  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('tu@email.com');
    this.passwordInput = page.getByPlaceholder('Tu contraseña');
    this.loginButton = page.getByRole('button', { name: 'Iniciar Sesión' });
    // Locator más robusto para mensajes de error usando role="alert" y clase CSS
    this.errorMessage = page.locator('[role="alert"]').filter({ hasText: /credenciales| invalidas/i });
    this.registerLink = page.getByLabel('Ir a crear cuenta');
    this.yaTenesCuentaLink = page.getByLabel('Ya tienes una cuenta? Inicia sesión');
    this.repitePassword = page.getByLabel('Repite la contraseña');
    this.periodoDePrueba = page.getByText('Período de prueba gratuito');
    this.crearCuenta = page.getByText('Crear cuenta');
    this.entrarButton = page.getByText('Entrar');
  }
  /**
   * Navegar a la página de login
   */
  async gotoLoginPage(): Promise<void> {
    await this.page.goto(`${BASE_URL}/`);
  }

  /**
   * Realizar login con credenciales
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
  }

  /**
   * Verificar que hay un mensaje de error
   * @param expectedMessage - Mensaje de error esperado
   */
  async expectErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedMessage);
  }

  /**
   * Verificar que hay cualquier mensaje de error visible
   * Más flexible que expectErrorMessage ya que no requiere texto exacto
   */
  async expectAnyErrorMessage(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  /**
   * Obtener el texto del mensaje de error actual
   * Útil para debugging y verificaciones dinámicas
   */
  async getErrorMessageText(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Verificar que estamos en la página de login
   */
  async loginPageIsVisible(): Promise<void> {
    await expect(this.page).toHaveURL(`${BASE_URL}/login`);
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }


  /**
   * Ir a la página de creación de cuenta
   */
    async gotoCrearCuentaPage(): Promise<void> {
    await this.registerLink.click();
  }

async yaTenesCuentaLinkIsVisible(): Promise<void> {
  await expect(this.yaTenesCuentaLink).toBeVisible();
}

async repitePasswordIsVisible(): Promise<void> {
  await expect(this.repitePassword).toBeVisible();
}


async periodoDePruebaIsVisible(): Promise<void> {
  await expect(this.periodoDePrueba).toBeVisible();
}


async crearCuentaIsVisible(): Promise<void> {
  await expect(this.crearCuenta).toBeVisible();
}

async entrarButtonIsVisible(): Promise<void> {
  await expect(this.entrarButton).toBeVisible();
}

/**
 * Verifica que el botón "Crear Cuenta" está deshabilitado
 * cuando el email, password o repetir password están vacíos.
 */
async expectCrearCuentaButtonDisabledIfFieldsEmpty(): Promise<void> {
  // Vaciar los campos
  await this.emailInput.fill('');
  await this.passwordInput.fill('');
  await this.repitePassword.fill('');
  // El botón debe estar deshabilitado
  await expect(this.crearCuenta).toBeDisabled();

  // Rellenar solo email
  await this.emailInput.fill('test@email.com');
  await this.passwordInput.fill('');
  await this.repitePassword.fill('');
  await expect(this.crearCuenta).toBeDisabled();

  // Rellenar solo password
  await this.emailInput.fill('');
  await this.passwordInput.fill('password123');
  await this.repitePassword.fill('');
  await expect(this.crearCuenta).toBeDisabled();

  // Rellenar solo repetir password
  await this.emailInput.fill('');
  await this.passwordInput.fill('');
  await this.repitePassword.fill('password123');
  await expect(this.crearCuenta).toBeDisabled();

  // Solo uno vacío (ejemplo: repetir password vacío)
  await this.emailInput.fill('test@email.com');
  await this.passwordInput.fill('password123');
  await this.repitePassword.fill('');
  await expect(this.crearCuenta).toBeDisabled();

  // Solo uno vacío (ejemplo: email vacío)
  await this.emailInput.fill('');
  await this.passwordInput.fill('password123');
  await this.repitePassword.fill('password123');
  await expect(this.crearCuenta).toBeDisabled();

  // Solo uno vacío (ejemplo: password vacío)
  await this.emailInput.fill('test@email.com');
  await this.passwordInput.fill('');
  await this.repitePassword.fill('password123');
  await expect(this.crearCuenta).toBeDisabled();
}

/**
 * Verifica que el botón "Crear Cuenta" está habilitado
 * cuando los tres campos requeridos están completos.
 */
async expectCrearCuentaButtonEnabledIfFieldsFilled(): Promise<void> {
  // Llenar todos los campos requeridos
  await this.emailInput.fill('test@email.com');
  await this.passwordInput.fill('password123');
  await this.repitePassword.fill('password123');
  // El botón debe estar habilitado
  await expect(this.crearCuenta).toBeEnabled();
}

async expectEntrarButtonDisabledIfFieldsEmpty(): Promise<void> {
  // Vaciar los campos
  await this.emailInput.fill('');
  await this.passwordInput.fill('');
  // El botón debe estar deshabilitado
  await expect(this.entrarButton).toBeDisabled();
}

async expectEntrarButtonEnabledIfFieldsFilled(): Promise<void> {
  // Llenar todos los campos requeridos
  await this.emailInput.fill('test@email.com');
  await this.passwordInput.fill('password123');
  // El botón debe estar habilitado
  await expect(this.entrarButton).toBeEnabled();
}

}

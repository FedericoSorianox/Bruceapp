import { Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';

/**
 * Utilidad para manejar el login compartido entre tests
 * Permite realizar login una sola vez y reutilizar el estado de autenticación
 */
export class SharedLogin {
  private static isLoggedIn = false;
  private static loginPage: LoginPage | null = null;
  private static sharedContext: BrowserContext | null = null;

  /**
   * Realizar login una sola vez y almacenar el estado
   * @param page - Página de Playwright
   * @param context - Contexto del navegador
   */
  static async performSharedLogin(page: Page, context?: BrowserContext): Promise<void> {
    // Si ya estamos logueados, no hacer nada
    if (this.isLoggedIn) {
      return;
    }

    try {
      // Crear instancia de LoginPage
      this.loginPage = new LoginPage(page);
      
      // Navegar a la página de login
      await this.loginPage.gotoLoginPage();
      await this.loginPage.loginButton.click();
      await page.waitForLoadState('networkidle');
      
      // Realizar login
      await this.loginPage.login('fede.danguard@gmail.com', 'Fede2020!');
      await this.loginPage.entrarButton.click();
      
      // Esperar a que el login se complete
      await page.waitForLoadState('networkidle');
      
      // Almacenar el contexto para reutilización
      if (context) {
        this.sharedContext = context;
      }
      
      // Marcar como logueado
      this.isLoggedIn = true;
      
      console.log('✅ Login compartido completado exitosamente');
    } catch (error) {
      console.error('❌ Error en login compartido:', error);
      throw error;
    }
  }

  /**
   * Verificar si ya estamos logueados
   */
  static isUserLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  /**
   * Resetear el estado de login (útil para tests que requieren logout)
   */
  static resetLoginState(): void {
    this.isLoggedIn = false;
    this.loginPage = null;
    if (this.sharedContext) {
      this.sharedContext.close();
      this.sharedContext = null;
    }
  }

  /**
   * Obtener la instancia de LoginPage
   */
  static getLoginPage(): LoginPage | null {
    return this.loginPage;
  }

  /**
   * Obtener el contexto compartido
   */
  static getSharedContext(): BrowserContext | null {
    return this.sharedContext;
  }
}

/**
 * Función helper para configurar el login compartido en beforeAll
 * @param page - Página de Playwright
 * @param context - Contexto del navegador
 */
export async function setupSharedLogin(page: Page, context?: BrowserContext): Promise<void> {
  await SharedLogin.performSharedLogin(page, context);
}

/**
 * Función helper para resetear el estado de login en afterAll
 */
export function teardownSharedLogin(): void {
  SharedLogin.resetLoginState();
}

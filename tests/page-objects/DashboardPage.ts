import { Page, Locator, expect } from '@playwright/test';


export class DashboardPage {
  readonly page: Page;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly cultivosSection: Locator;
  readonly addCultivoButton: Locator;
  readonly cerrarSesionLink: Locator;
  readonly verNotasButton: Locator;
  readonly comenzarCultivoButton: Locator;
  readonly dashboardTitle: Locator;
  readonly funcionalidadesSection: Locator;
  readonly explorarFuncionalidadesButton: Locator;
  readonly footerSection: Locator;
  readonly inicioFooterLink: Locator;
  readonly cultivoFooterLink: Locator;
  readonly notasFooterLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userMenu = page.getByTestId('user-menu');
    this.logoutButton = page.getByRole('button', { name: 'Cerrar Sesión' });
    this.cultivosSection = page.getByTestId('cultivos-section');
    this.addCultivoButton = page.getByRole('button', { name: 'Agregar Cultivo' });
    this.cerrarSesionLink = page.getByLabel('Cerrar sesión');
    this.verNotasButton = page.getByLabel('Ver seccion de notas');
    this.comenzarCultivoButton = page.getByLabel('Comenzar a gestionar cultivos');
    this.dashboardTitle = page.getByRole('heading', { name: 'Cultiva el Futuro con Bruce' });
    this.funcionalidadesSection = page.getByText('Funcionalidades').first();
    this.explorarFuncionalidadesButton = page.getByLabel('Explorar funcionalidades de cultivo');
    this.footerSection = page.getByText('Contacto').first();
    this.inicioFooterLink = page.getByLabel('Ir a página principal');
    this.cultivoFooterLink = page.getByLabel('Ir a sección de cultivos');
    this.notasFooterLink = page.getByLabel('Ir a sección de notas');
  }

  /**
   * Navegar al dashboard
   */
  async gotoDashboardPage(): Promise<void> {
    await this.page.goto('https://bruceapp.onrender.com/');
  }

  /**
   * Verificar que estamos logueados
   */
  async dashboardPageIsVisible(): Promise<void> {
    await expect(this.page).toHaveURL('https://bruceapp.onrender.com/');
  
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    await this.cerrarSesionLink.click();
  }

  async funcionalidadesSectionIsVisible(): Promise<void> {
    await expect(this.funcionalidadesSection).toBeVisible();
  }

  async explorarFuncionalidadesButtonIsVisible(): Promise<void> {
    await expect(this.explorarFuncionalidadesButton).toBeVisible();
  }
  
  async footerSectionIsVisible(): Promise<void> {
    await expect(this.footerSection).toBeVisible();
  }

  async inicioFooterLinkIsVisible(): Promise<void> {
    await expect(this.inicioFooterLink).toBeVisible();
  }

  async cultivoFooterLinkIsVisible(): Promise<void> {
    await expect(this.cultivoFooterLink).toBeVisible();
    await expect(this.cultivoFooterLink).toHaveText('Cultivo');
    await expect(this.cultivoFooterLink).toHaveAttribute('href', '/cultivo');
    await expect(this.cultivoFooterLink).toHaveAttribute('aria-label', 'Ir a sección de cultivos');
  }

  async comenzarCultivoButtonIsVisible(): Promise<void> {
    await expect(this.comenzarCultivoButton).toBeVisible();
    await expect(this.comenzarCultivoButton).toContainText('Comenzar Cultivo');
   
  }

  async notasFooterLinkIsVisible(): Promise<void> {
    await expect(this.notasFooterLink).toBeVisible();
    await expect(this.notasFooterLink).toHaveText('Notas');
    await expect(this.notasFooterLink).toHaveAttribute('href', '/notas');
    await expect(this.notasFooterLink).toHaveAttribute('aria-label', 'Ir a sección de notas');
  }

}
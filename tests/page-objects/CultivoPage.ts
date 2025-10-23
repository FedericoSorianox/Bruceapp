

import { Page, Locator, expect } from '@playwright/test';


export class CultivoPage {
  readonly page: Page;

  // === ELEMENTOS PRINCIPALES DE LA PÁGINA ===

  readonly cultivoHero: Locator;
  readonly cultivoTab: Locator;
  readonly planificacionTab: Locator;
  readonly nuevoCultivoButton: Locator;
  readonly orderButton: Locator;
  readonly todosButton: Locator;
  readonly searchButton: Locator;
  readonly searchTextbox: Locator;
  readonly cultivoList: Locator;
  readonly clickFirstVerDetallesButton: Locator;
  readonly clickFirstEditarButton: Locator;
  readonly clickHeaderCultivo: Locator;

  constructor(page: Page) {
    this.page = page;

    // === ELEMENTOS PRINCIPALES DE LA PÁGINA === 

    this.cultivoHero = page.getByTestId('cultivo-hero-center');
    this.cultivoTab = page.getByTestId('cultivo-tab-cultivos');
    this.planificacionTab = page.getByTestId('cultivo-tab-planificacion');
    this.nuevoCultivoButton = page.getByTestId('cultivo-new-button');
    this.orderButton = page.getByTestId('cultivo-order-toggle');
    this.todosButton = page.getByTestId('cultivo-filtro-select');
    this.searchButton = page.getByTestId('cultivo-search-button');
    this.searchTextbox = page.getByTestId('cultivo-search-input');
    this.cultivoList = page.getByTestId('cultivo-cards-list');
    this.clickFirstVerDetallesButton = page.locator('[data-testid^="cultivo-card-verdetalles-"]').first();
    this.clickFirstEditarButton = page.locator('[data-testid^="cultivo-card-editar-"]').first();
    this.clickHeaderCultivo = page.locator('[data-testid="cultivo-header"]').first();
  }


  /**
   * Navegar a la página de cultivos
   */
  async gotoCultivosPage(): Promise<void> {
    await this.page.goto('/cultivo');
    // Esperar a que la página se cargue completamente
    await this.page.waitForLoadState('networkidle');
    // Esperar a que el elemento principal esté visible
    await expect(this.cultivoHero).toBeVisible();
  }

  async cultivoPageIsVisible(): Promise<void> {
    await expect(this.cultivoHero).toBeVisible();
  }

  async tabsAreVisible(): Promise<void> {
    await expect(this.cultivoTab).toBeVisible();
    await expect(this.planificacionTab).toBeVisible();
  }

  async nuevoCultivoButtonIsVisible(): Promise<void> {
    await expect(this.nuevoCultivoButton).toBeVisible();
  }

  async orderButtonIsVisible(): Promise<void> {
    await expect(this.orderButton).toBeVisible();
  }
  async todosButtonIsVisible(): Promise<void> {
    await expect(this.todosButton).toBeVisible();
  }

  async searchButtonIsVisible(): Promise<void> {
    await expect(this.searchButton).toBeVisible();
  }
  async searchTextboxIsVisible(): Promise<void> {
    await expect(this.searchTextbox).toBeVisible();
  }
  async cultivoListIsVisible(): Promise<void> {
    await expect(this.cultivoList).toBeVisible();
  }
  async verDetallesButtonConsultasIsVisible(): Promise<void> {

    await expect(this.clickFirstVerDetallesButton).toBeVisible();
  }
  async editarButtonConsultasIsVisible(): Promise<void> {
    await expect(this.clickFirstEditarButton).toBeVisible();
  }
  async headerCultivoConsultasIsVisible(): Promise<void> {
    await expect(this.clickHeaderCultivo).toBeVisible();
  }


}

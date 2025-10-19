

import { Page, Locator, expect } from '@playwright/test';

export class CultivoPage {
  readonly page: Page;
  readonly cultivoList: Locator;
  readonly searchInput: Locator;
  readonly cultivoHeader: Locator;
  readonly cultivoTab: Locator;
  readonly cultivoTabPlanification: Locator;
  readonly buscarCultivo: Locator;
  readonly buscarCultivoButton: Locator;
  readonly addCultivoButton: Locator;
  readonly estadoSelect: Locator;
  readonly verDetallesLink: Locator;



  constructor(page: Page) {
    this.page = page;
    this.cultivoList = page.getByTestId('cultivo-list');
    this.searchInput = page.getByPlaceholder('Buscar cultivos...');
    this.cultivoHeader = page.getByTestId('cultivo-hero');
    this.cultivoTab = page.getByTestId('cultivo-tab-cultivos');
    this.cultivoTabPlanification = page.getByTestId('cultivo-tab-planificacion');
    this.buscarCultivo = page.getByPlaceholder('Buscar cultivos...');
    this.buscarCultivoButton = page.getByTestId('cultivo-search-button');
    this.addCultivoButton = page.getByTestId('cultivo-new-button');
    this.estadoSelect = page.locator('select.bg-gray-100');
    this.verDetallesLink = page.getByRole('link', { name: 'Ver detalles' });
  }

  /**
   * Navegar a la página de cultivos
   */
  async gotoCultivosPage(): Promise<void> {
    await this.page.goto('/cultivo');
  }

  async cultivoPageIsVisible(): Promise<void> {
    await expect(this.page).toHaveURL('/cultivo');
  }

}



import { Page, Locator, expect } from '@playwright/test';

export class CultivoPage {
    readonly page: Page;
    readonly cultivoList: Locator;
    readonly addCultivoButton: Locator;
    readonly searchInput: Locator;
  
    constructor(page: Page) {
      this.page = page;
      this.cultivoList = page.getByTestId('cultivo-list');
      this.addCultivoButton = page.getByRole('button', { name: 'Agregar Cultivo' });
      this.searchInput = page.getByPlaceholder('Buscar cultivos...');
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
  
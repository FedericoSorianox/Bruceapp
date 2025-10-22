import { test, expect } from '@playwright/test';
import { CultivoPage } from './page-objects/CultivoPage';
import { Page } from '@playwright/test';


test.skip('Cultivo Page Tests - Usando Autenticación Previa de login.setup.ts', () => {
  let cultivoPage: CultivoPage;

  /**
   * Configuración para cada test individual
   * El login ya se realizó globalmente por login.setup.ts usando storageState
   */
  test.beforeEach(async ({ page }) => {
    cultivoPage = new CultivoPage(page);

    // Simplemente navegar a la página de cultivos, ya autenticados
    await cultivoPage.gotoCultivosPage();
    await page.waitForLoadState('networkidle');

    // Si por alguna razón no hay login, esto es un error del storageState
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('El usuario NO está autenticado - revisa que login.setup.ts esté funcionando y storageState.json se esté aplicando');
    }
  });

  /**
   * Helper para navegar a una página individual de cultivo (detalles)
   * Asume que el usuario ya está autenticado por login.setup.ts
   */
  const navigateToIndividualPage = async (page: Page) => {
    const verDetallesCount = await cultivoPage.cultivoCardVerdetalles.count();
    if (verDetallesCount > 0) {
      await cultivoPage.cultivoCardVerdetalles.first().click();
      await page.waitForLoadState('networkidle');
      return true;
    }
    return false;
  };

  /**
   * ============================================
   * TESTS PARA ELEMENTOS PRINCIPALES DE LA PÁGINA
   * ============================================
   */
  test.skip('Main Page Elements', () => {
    test('Cultivo page loads successfully', async ({ page }) => {
      // Verificar que estamos en la página correcta
      const currentUrl = page.url();
      console.log('🔍 URL actual en el test:', currentUrl);
      
      // Si estamos en login, esperar y reintentar
      if (currentUrl.includes('/login')) {
        console.log('⚠️ Detectado redirección a login, esperando...');
        await page.waitForTimeout(3000);
        await cultivoPage.gotoCultivosPage();
        await page.waitForLoadState('networkidle');
      }
      
      await cultivoPage.cultivoPageIsVisible();
      await expect(page).toHaveURL(/\/cultivo/);
    });

    test('Hero section is visible and complete', async () => {
      await expect(cultivoPage.cultivoHero).toBeVisible();
      await cultivoPage.page.waitForTimeout(300); // Esperar un poco entre elementos
      await expect(cultivoPage.cultivoHeroCenter).toBeVisible();
      await expect(cultivoPage.cultivoHeroBadge).toBeVisible();
      await expect(cultivoPage.cultivoHeroBadgeEmoji).toBeVisible();
      await expect(cultivoPage.cultivoPageTitle).toBeVisible();
      await expect(cultivoPage.cultivoPageTitleHighlight).toBeVisible();
      await expect(cultivoPage.cultivoHeroDesc).toBeVisible();
    });

    test('Hero statistics are visible', async () => {
      await expect(cultivoPage.cultivoHeroStats).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatTotal).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatTotalN).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatTotalLabel).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatActivos).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatActivosN).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatActivosLabel).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatM2).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatM2N).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatM2Label).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatPlantas).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatPlantasN).toBeVisible();
      await expect(cultivoPage.cultivoHeroStatPlantasLabel).toBeVisible();
    });

    test('Hero title contains expected text', async () => {
      await expect(cultivoPage.cultivoPageTitle).toContainText('Tu Dashboard de');
      await expect(cultivoPage.cultivoPageTitleHighlight).toContainText('Cultivos Inteligentes');
    });

    test('Tabs container and bar are visible', async () => {
      await expect(cultivoPage.cultivoTabsContainer).toBeVisible();
      await expect(cultivoPage.cultivoTabsBar).toBeVisible();
    });

    test('Cultivos tab is visible and functional', async () => {
      await expect(cultivoPage.cultivoTabCultivos).toBeVisible();
      await expect(cultivoPage.cultivoTabCultivosEmoji).toBeVisible();
      await expect(cultivoPage.cultivoTabCultivos).toBeEnabled();
      await expect(cultivoPage.cultivoTabCultivos).toContainText('Cultivos');
    });

    test('Planificación tab is visible and functional', async () => {
      await expect(cultivoPage.cultivoTabPlanificacion).toBeVisible();
      await expect(cultivoPage.cultivoTabPlanificacionEmoji).toBeVisible();
      await expect(cultivoPage.cultivoTabPlanificacion).toBeEnabled();
      await expect(cultivoPage.cultivoTabPlanificacion).toContainText('Planificación');
    });

    test('Tab navigation works correctly', async () => {
      // Verificar que el tab de cultivos está activo por defecto
      await expect(cultivoPage.cultivoTabCultivos).toBeVisible();
      
      // Hacer clic en el tab de planificación
      await cultivoPage.cultivoTabPlanificacion.click();
      
      // Verificar que el tab de planificación está activo
      await expect(cultivoPage.cultivoTabPlanificacion).toBeVisible();
      
      // Volver al tab de cultivos
      await cultivoPage.cultivoTabCultivos.click();
      await expect(cultivoPage.cultivoTabCultivos).toBeVisible();
    });
  });

  /**
   * ============================================
   * TESTS PARA TOOLBAR Y CONTROLES
   * ============================================
   */
  test.describe('Toolbar and Controls', () => {
    test('Toolbar elements are visible', async () => {
      await expect(cultivoPage.cultivoToolbar).toBeVisible();
      await expect(cultivoPage.cultivoToolbarInner).toBeVisible();
      await expect(cultivoPage.cultivoSearchForm).toBeVisible();
      await expect(cultivoPage.cultivoListControls).toBeVisible();
    });

    test('Search functionality is complete', async () => {
      await expect(cultivoPage.cultivoSearchInputWrapper).toBeVisible();
      await expect(cultivoPage.cultivoSearchInput).toBeVisible();
      await expect(cultivoPage.cultivoSearchInput).toBeEditable();
      await expect(cultivoPage.cultivoSearchIconWrapper).toBeVisible();
      await expect(cultivoPage.cultivoSearchIcon).toBeVisible();
      await expect(cultivoPage.cultivoSearchButton).toBeVisible();
      await expect(cultivoPage.cultivoSearchButton).toBeEnabled();
    });

    test('Search input functionality works', async () => {
      await cultivoPage.cultivoSearchInput.fill('test cultivo');
      await expect(cultivoPage.cultivoSearchInput).toHaveValue('test cultivo');
      
      await cultivoPage.cultivoSearchInput.clear();
      await expect(cultivoPage.cultivoSearchInput).toHaveValue('');
    });

    test('Search button triggers search', async ({ page }) => {
      await cultivoPage.cultivoSearchInput.fill('tomate');
      await cultivoPage.cultivoSearchButton.click();
      await page.waitForLoadState('networkidle');
      await expect(cultivoPage.cultivoSearchInput).toHaveValue('tomate');
    });

    test('Filter controls are visible and functional', async () => {
      await expect(cultivoPage.cultivoFiltroSelect).toBeVisible();
      await expect(cultivoPage.cultivoFiltroSelect).toBeEnabled();
      await expect(cultivoPage.cultivoOrderToggle).toBeVisible();
      await expect(cultivoPage.cultivoOrderToggle).toBeEnabled();
      await expect(cultivoPage.cultivoOrderToggleIcon).toBeVisible();
    });

    test('Filter options are present', async () => {
      await expect(cultivoPage.cultivoFiltroSelectTodos).toBeVisible();
      await expect(cultivoPage.cultivoFiltroSelectActivos).toBeVisible();
      await expect(cultivoPage.cultivoFiltroSelectInactivos).toBeVisible();
    });

    test('New cultivo button is visible and functional', async () => {
      await expect(cultivoPage.cultivoNewButton).toBeVisible();
      await expect(cultivoPage.cultivoNewButton).toBeEnabled();
      await expect(cultivoPage.cultivoNewButtonIcon).toBeVisible();
      await expect(cultivoPage.cultivoNewButton).toContainText('Nuevo Cultivo');
    });

    test('Order toggle functionality works', async () => {
      await cultivoPage.cultivoOrderToggle.click();
      await expect(cultivoPage.cultivoOrderToggle).toBeFocused();
    });
  });

  /**
   * ============================================
   * TESTS PARA LISTA DE CULTIVOS
   * ============================================
   */
  test.describe('Cultivos List', () => {
    test('Cultivos list container is visible', async () => {
      await expect(cultivoPage.cultivoList).toBeVisible();
    });

    test('Cultivos cards list is present', async () => {
      await expect(cultivoPage.cultivoCardsList).toBeVisible();
    });

    test('Cultivos cards elements are accessible', async () => {
      // Verificar que los elementos de las cards están presentes
      const cardCount = await cultivoPage.cultivoCard.count();
      if (cardCount > 0) {
        await expect(cultivoPage.cultivoCard.first()).toBeVisible();
        await expect(cultivoPage.cultivoCardHeader.first()).toBeVisible();
        await expect(cultivoPage.cultivoCardNombre.first()).toBeVisible();
        await expect(cultivoPage.cultivoCardEstado.first()).toBeVisible();
        await expect(cultivoPage.cultivoCardContent.first()).toBeVisible();
        await expect(cultivoPage.cultivoCardActions.first()).toBeVisible();
      }
    });

    test('Card action buttons are functional', async () => {
      const cardCount = await cultivoPage.cultivoCard.count();
      if (cardCount > 0) {
        await expect(cultivoPage.cultivoCardVerdetalles.first()).toBeVisible();
        await expect(cultivoPage.cultivoCardEditar.first()).toBeVisible();
        await expect(cultivoPage.cultivoCardEliminar.first()).toBeVisible();
      }
    });

    test('Card information elements are present', async () => {
      const cardCount = await cultivoPage.cultivoCard.count();
      if (cardCount > 0) {
        // Verificar elementos de información que pueden estar presentes
        const m2Count = await cultivoPage.cultivoCardM2.count();
        const plantasCount = await cultivoPage.cultivoCardPlantas.count();
        const inicioCount = await cultivoPage.cultivoCardInicio.count();
        const sustratoCount = await cultivoPage.cultivoCardSustrato.count();
        
        if (m2Count > 0) await expect(cultivoPage.cultivoCardM2.first()).toBeVisible();
        if (plantasCount > 0) await expect(cultivoPage.cultivoCardPlantas.first()).toBeVisible();
        if (inicioCount > 0) await expect(cultivoPage.cultivoCardInicio.first()).toBeVisible();
        if (sustratoCount > 0) await expect(cultivoPage.cultivoCardSustrato.first()).toBeVisible();
      }
    });
  });

  /**
   * ============================================
   * TESTS PARA PESTAÑA PLANIFICACIÓN
   * ============================================
   */
  test.describe('Planificación Tab', () => {
    test('Planificación tab elements are accessible', async () => {
      // Cambiar a la pestaña de planificación
      await cultivoPage.cultivoTabPlanificacion.click();
      
      await expect(cultivoPage.cultivoPlanificacionWrapper).toBeVisible();
      await expect(cultivoPage.cultivoCalendario).toBeVisible();
      await expect(cultivoPage.cultivoGestionTareas).toBeVisible();
    });
  });

  /**
   * ============================================
   * TESTS PARA NAVEGACIÓN A PÁGINA INDIVIDUAL
   * ============================================
   */
  test.describe('Navigation to Individual Cultivo Page', () => {
    test('Navigate to individual cultivo page', async ({ page }) => {
      const navigated = await navigateToIndividualPage(page);
      if (navigated) {
        // Verificar que estamos en una página de cultivo individual
        await expect(page.url()).toMatch(/\/cultivo\/\d+/);
      }
    });
  });

  /**
   * ============================================
   * TESTS PARA ACCESIBILIDAD
   * ============================================
   */
  test.describe('Accessibility', () => {
    test('Interactive elements are keyboard accessible', async () => {
      // Verificar que los botones son accesibles por teclado
      await cultivoPage.cultivoNewButton.focus();
      await expect(cultivoPage.cultivoNewButton).toBeFocused();
      
      await cultivoPage.cultivoSearchButton.focus();
      await expect(cultivoPage.cultivoSearchButton).toBeFocused();
      
      await cultivoPage.cultivoSearchInput.focus();
      await expect(cultivoPage.cultivoSearchInput).toBeFocused();
    });

    test('All tabs are keyboard navigable', async () => {
      await cultivoPage.cultivoTabCultivos.focus();
      await expect(cultivoPage.cultivoTabCultivos).toBeFocused();
      
      await cultivoPage.cultivoTabPlanificacion.focus();
      await expect(cultivoPage.cultivoTabPlanificacion).toBeFocused();
    });
  });

  /**
   * ============================================
   * TESTS PARA ESTADOS DE CARGA Y ERROR
   * ============================================
   */
  test.describe('Loading and Error States', () => {
    test('Loading states are handled correctly', async () => {
      // Verificar que no hay estados de loading visibles en carga normal
      const loadingCount = await cultivoPage.cultivoListLoading.count();
      if (loadingCount > 0) {
        await expect(cultivoPage.cultivoListLoading).toBeVisible();
        await expect(cultivoPage.cultivoListLoadingSpinner).toBeVisible();
      }
    });

    test('Error states are handled correctly', async () => {
      // Verificar que no hay estados de error en carga normal
      const errorCount = await cultivoPage.cultivoListError.count();
      if (errorCount > 0) {
        await expect(cultivoPage.cultivoListError).toBeVisible();
        await expect(cultivoPage.cultivoListErrorIcon).toBeVisible();
        await expect(cultivoPage.cultivoListErrorText).toBeVisible();
      }
    });

    test('Empty states are handled correctly', async () => {
      // Verificar estado vacío si no hay cultivos
      const emptyCount = await cultivoPage.cultivoListEmpty.count();
      if (emptyCount > 0) {
        await expect(cultivoPage.cultivoListEmpty).toBeVisible();
        await expect(cultivoPage.cultivoListEmptyIcon).toBeVisible();
        await expect(cultivoPage.cultivoListEmptyLabel).toBeVisible();
        await expect(cultivoPage.cultivoListEmptyDesc).toBeVisible();
      }
    });
  });

  /**
   * ============================================
   * TESTS PARA FUNCIONALIDADES AVANZADAS
   * ============================================
   */
  test.describe('Advanced Functionality', () => {
    test('Complete search workflow', async ({ page }) => {
      // Llenar el campo de búsqueda
      await cultivoPage.cultivoSearchInput.fill('test search');
      
      // Hacer clic en el botón de búsqueda
      await cultivoPage.cultivoSearchButton.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar que la búsqueda se mantiene
      await expect(cultivoPage.cultivoSearchInput).toHaveValue('test search');
    });

    test('Filter workflow', async () => {
      // Interactuar con el filtro
      await cultivoPage.cultivoFiltroSelect.click();
      await expect(cultivoPage.cultivoFiltroSelect).toBeFocused();
      
      // Seleccionar una opción
      await cultivoPage.cultivoFiltroSelect.selectOption('activos');
    });

    test('Order toggle workflow', async () => {
      // Interactuar con el toggle de orden
      await cultivoPage.cultivoOrderToggle.click();
      await expect(cultivoPage.cultivoOrderToggle).toBeFocused();
    });

    test('New cultivo button workflow', async () => {
      // Hacer clic en el botón de nuevo cultivo
      await cultivoPage.cultivoNewButton.click();
      
      // Verificar que se abre el formulario (si está disponible)
      const formCount = await cultivoPage.cultivoFormWrapper.count();
      if (formCount > 0) {
        await expect(cultivoPage.cultivoFormWrapper).toBeVisible();
        await expect(cultivoPage.cultivoForm).toBeVisible();
      }
    });
  });

  /**
   * ============================================
   * TESTS PARA ELEMENTOS ESPECÍFICOS
   * ============================================
   */
  test.describe('Specific Elements', () => {
    test('All hero statistics are numeric', async () => {
      // Verificar que las estadísticas contienen números
      const totalText = await cultivoPage.cultivoHeroStatTotalN.textContent();
      const activosText = await cultivoPage.cultivoHeroStatActivosN.textContent();
      const m2Text = await cultivoPage.cultivoHeroStatM2N.textContent();
      const plantasText = await cultivoPage.cultivoHeroStatPlantasN.textContent();
      
      expect(totalText).toMatch(/^\d+$/);
      expect(activosText).toMatch(/^\d+$/);
      expect(m2Text).toMatch(/^\d+(\.\d+)?$/);
      expect(plantasText).toMatch(/^\d+$/);
    });

    test('All emoji elements are present', async () => {
      await expect(cultivoPage.cultivoHeroBadgeEmoji).toBeVisible();
      await expect(cultivoPage.cultivoTabCultivosEmoji).toBeVisible();
      await expect(cultivoPage.cultivoTabPlanificacionEmoji).toBeVisible();
    });

    test('All icons are visible', async () => {
      await expect(cultivoPage.cultivoSearchIcon).toBeVisible();
      await expect(cultivoPage.cultivoNewButtonIcon).toBeVisible();
      await expect(cultivoPage.cultivoOrderToggleIcon).toBeVisible();
    });
  });
});

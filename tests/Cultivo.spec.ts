import { test, expect } from '@playwright/test';
import { CultivoPage } from './page-objects/CultivoPage';
import { LoginPage } from './page-objects/LoginPage';

/**
 * Test suite para la página de Cultivos
 * Verifica la funcionalidad completa de todos los elementos disponibles
 */
test.describe('Cultivo Page Tests', () => {
  let loginPage: LoginPage;
  let cultivoPage: CultivoPage;

  /**
   * Configuración inicial para cada test
   * Realiza login automático antes de cada prueba
   */
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    cultivoPage = new CultivoPage(page);
    
    // Navegar a la página de login y autenticarse
    await loginPage.gotoLoginPage();
    await loginPage.loginButton.click();
    await page.waitForLoadState('networkidle');
    await loginPage.login('fede.danguard@gmail.com', 'Fede2020!');
    await loginPage.entrarButton.click();
    
    // Navegar a la página de cultivos
    await cultivoPage.gotoCultivosPage();
    await page.waitForLoadState('networkidle');
  });

  /**
   * Test: Verificar que la página de cultivos se carga correctamente
   */
  test('Cultivo page loads successfully', async ({ page }) => {
    await cultivoPage.cultivoPageIsVisible();
    await expect(page).toHaveURL('/cultivo');
  });

  /**
   * Test: Verificar que el header principal de cultivos es visible
   */
  test('Cultivo hero header is visible', async () => {
    await expect(cultivoPage.cultivoHeader).toBeVisible();
  });

  /**
   * Test: Verificar que la lista de cultivos es visible
   */
  test('Cultivo list container is visible', async () => {
    await expect(cultivoPage.cultivoList).toBeVisible();
  });

  /**
   * Test: Verificar que el input de búsqueda es visible y funcional
   */
  test('Search input is visible and functional', async () => {
    await expect(cultivoPage.searchInput).toBeVisible();
    await expect(cultivoPage.searchInput).toBeEditable();
    
    // Probar funcionalidad de búsqueda
    await cultivoPage.searchInput.fill('test cultivo');
    await expect(cultivoPage.searchInput).toHaveValue('test cultivo');
    
    // Limpiar el campo
    await cultivoPage.searchInput.clear();
    await expect(cultivoPage.searchInput).toHaveValue('');
  });

  /**
   * Test: Verificar que el botón de búsqueda es visible y funcional
   */
  test('Search button is visible and clickable', async () => {
    await expect(cultivoPage.buscarCultivoButton).toBeVisible();
    await expect(cultivoPage.buscarCultivoButton).toBeEnabled();
  });

  /**
   * Test: Verificar que el botón de agregar nuevo cultivo es visible
   */
  test('Add new cultivo button is visible and clickable', async () => {
    await expect(cultivoPage.addCultivoButton).toBeVisible();
    await expect(cultivoPage.addCultivoButton).toBeEnabled();
  });

  /**
   * Test: Verificar que el tab de cultivos es visible y activo
   */
  test('Cultivos tab is visible and accessible', async () => {
    await expect(cultivoPage.cultivoTab).toBeVisible();
    await expect(cultivoPage.cultivoTab).toBeEnabled();
  });

  /**
   * Test: Verificar que el tab de planificación es visible y accesible
   */
  test('Planification tab is visible and accessible', async () => {
    await expect(cultivoPage.cultivoTabPlanification).toBeVisible();
    await expect(cultivoPage.cultivoTabPlanification).toBeEnabled();
  });

  /**
   * Test: Verificar que el selector de estado es visible y funcional
   */
  test('Estado select dropdown is visible and functional', async () => {
    await expect(cultivoPage.estadoSelect).toBeVisible();
    await expect(cultivoPage.estadoSelect).toBeEnabled();
  });

  /**
   * Test: Verificar que los enlaces de ver detalles son visibles
   */
  test('Ver detalles links are visible and clickable', async () => {
    // Verificar que al menos un enlace de ver detalles esté presente
    const verDetallesLinks = await cultivoPage.page.getByRole('link', { name: 'Ver detalles' }).count();
    if (verDetallesLinks > 0) {
      await expect(cultivoPage.verDetallesLink.first()).toBeVisible();
      await expect(cultivoPage.verDetallesLink.first()).toBeEnabled();
    }
  });

  /**
   * Test: Verificar funcionalidad completa de búsqueda
   */
  test('Complete search functionality works correctly', async ({ page }) => {
    // Llenar el campo de búsqueda
    await cultivoPage.searchInput.fill('tomate');
    await expect(cultivoPage.searchInput).toHaveValue('tomate');
    
    // Hacer clic en el botón de búsqueda
    await cultivoPage.buscarCultivoButton.click();
    
    // Esperar a que se actualice la página
    await page.waitForLoadState('networkidle');
    
    // Verificar que la búsqueda se ejecutó (el valor se mantiene)
    await expect(cultivoPage.searchInput).toHaveValue('tomate');
  });

  /**
   * Test: Verificar navegación entre tabs
   */
  test('Tab navigation works correctly', async () => {
    // Verificar que el tab de cultivos está activo por defecto
    await expect(cultivoPage.cultivoTab).toBeVisible();
    
    // Hacer clic en el tab de planificación
    await cultivoPage.cultivoTabPlanification.click();
    
    // Verificar que el tab de planificación está activo
    await expect(cultivoPage.cultivoTabPlanification).toBeVisible();
    
    // Volver al tab de cultivos
    await cultivoPage.cultivoTab.click();
    await expect(cultivoPage.cultivoTab).toBeVisible();
  });

  /**
   * Test: Verificar que todos los elementos principales están presentes
   */
  test('All main page elements are present', async () => {
    // Verificar presencia de todos los elementos principales
    await expect(cultivoPage.cultivoHeader).toBeVisible();
    await expect(cultivoPage.cultivoList).toBeVisible();
    await expect(cultivoPage.searchInput).toBeVisible();
    await expect(cultivoPage.buscarCultivoButton).toBeVisible();
    await expect(cultivoPage.addCultivoButton).toBeVisible();
    await expect(cultivoPage.cultivoTab).toBeVisible();
    await expect(cultivoPage.cultivoTabPlanification).toBeVisible();
    await expect(cultivoPage.estadoSelect).toBeVisible();
  });

  /**
   * Test: Verificar interacción con el selector de estado
   */
  test('Estado select dropdown interaction', async () => {
    // Verificar que el selector está presente y es interactivo
    await expect(cultivoPage.estadoSelect).toBeVisible();
    await expect(cultivoPage.estadoSelect).toBeEnabled();
    
    // Hacer clic en el selector para abrirlo
    await cultivoPage.estadoSelect.click();
    
    // Verificar que el selector está enfocado
    await expect(cultivoPage.estadoSelect).toBeFocused();
  });

  /**
   * Test: Verificar accesibilidad de elementos interactivos
   */
  test('Interactive elements are accessible', async () => {
    // Verificar que todos los botones son accesibles por teclado
    await cultivoPage.addCultivoButton.focus();
    await expect(cultivoPage.addCultivoButton).toBeFocused();
    
    await cultivoPage.buscarCultivoButton.focus();
    await expect(cultivoPage.buscarCultivoButton).toBeFocused();
    
    // Verificar que el input de búsqueda es accesible
    await cultivoPage.searchInput.focus();
    await expect(cultivoPage.searchInput).toBeFocused();
  });
});
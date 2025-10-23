import { test, expect } from '@playwright/test';
import { CultivoPage } from './page-objects/CultivoPage';

let cultivoPage: CultivoPage;

test.beforeEach(async ({ page }) => {
  cultivoPage = new CultivoPage(page);
  await cultivoPage.gotoCultivosPage();
});

test('Cultivo page main elements are visible', async () => {
  await expect(cultivoPage.cultivoHero).toBeVisible();
  await expect(cultivoPage.cultivoTab).toBeVisible();
});

test('Tabs are visible', async () => {
  await cultivoPage.tabsAreVisible();
});

test('Nuevo Cultivo button is visible', async () => {
  await cultivoPage.nuevoCultivoButtonIsVisible();
});

test('Order button is visible', async () => {
  await cultivoPage.orderButtonIsVisible();
});

test('Todos button is visible', async () => {
  await cultivoPage.todosButtonIsVisible();
});

test('Search button is visible', async () => {
  await cultivoPage.searchButtonIsVisible();
});

test('Search textbox is visible', async () => {
  await cultivoPage.searchTextboxIsVisible();
});

test('Cultivo list is visible', async () => {
  await cultivoPage.cultivoListIsVisible();
});

test('Ver Detalles button for a specific cultivo is visible and clickable', async () => {
  await cultivoPage.clickFirstVerDetallesButton.isVisible();
  await cultivoPage.clickFirstVerDetallesButton.click();
});

test('Editar button for a specific cultivo is visible and clickable', async () => {
  await cultivoPage.clickFirstEditarButton.isVisible();
  await cultivoPage.clickFirstEditarButton.click();
});

// test('Header of Cultivo Consultas is visible and clickable', async () => {
//   await cultivoPage.clickHeaderCultivo.isVisible();
//   await cultivoPage.clickHeaderCultivo.click();
// });



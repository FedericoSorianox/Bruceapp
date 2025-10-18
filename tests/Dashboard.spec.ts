import { test } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';



test('Dashboard is visible', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  // Navega explícitamente al dashboard antes de chequear visibilidad
  await dashboardPage.gotoDashboardPage();
  await dashboardPage.dashboardPageIsVisible();
});



test('Funcionalidades section is visible', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.gotoDashboardPage();
  // Scroll hacia el footer antes de chequear visibilidad
  await dashboardPage.page.mouse.wheel(0, 500);
  await dashboardPage.funcionalidadesSectionIsVisible();
});

test('Explorar funcionalidades button is visible', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.gotoDashboardPage();
  await dashboardPage.explorarFuncionalidadesButtonIsVisible();
});

test('Footer section is visible', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.gotoDashboardPage();
  await dashboardPage.page.mouse.wheel(0, 3000);
  await dashboardPage.footerSectionIsVisible();
});

test('Inicio footer link is visible', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.gotoDashboardPage();
  await dashboardPage.inicioFooterLinkIsVisible();
});

test('Cultivo footer link is visible', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.gotoDashboardPage();
  await dashboardPage.cultivoFooterLinkIsVisible(); 
});

test('Notas footer link is visible', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.gotoDashboardPage();
  await dashboardPage.notasFooterLinkIsVisible();
});

test('Comenzar cultivo button is visible', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.gotoDashboardPage();
  await dashboardPage.comenzarCultivoButtonIsVisible();
                    });

test('Ver notas button is visible', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.gotoDashboardPage();
  await dashboardPage.notasFooterLinkIsVisible();
});


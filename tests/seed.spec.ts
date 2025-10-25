import { test } from '@playwright/test';
import { CultivoPage } from './page-objects/CultivoPage';

let cultivoPage: CultivoPage;

test.beforeEach(async ({ page }) => {
  cultivoPage = new CultivoPage(page);
  await cultivoPage.gotoCultivosPage();
});

test('seed Cultivo list is visible', async () => {
  await cultivoPage.cultivoListIsVisible();
});
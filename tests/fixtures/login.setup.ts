// login.setup.ts
import { chromium } from '@playwright/test';


async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://bruceapp.onrender.com/login');
  
  // Realiza login
  await page.fill('input[id="email"]', 'fede.danguard@gmail.com');
  await page.fill('input[id="pwd"]', 'Fede2020!');
  await page.click('button:has-text("Entrar")');

  // Esperar a que el login esté completo (por ejemplo, URL cambia o aparece algo)
  await page.waitForURL('https://bruceapp.onrender.com/cultivo');

  // Guardar el estado (cookies, localStorage, etc.)
  await page.context().storageState({ path: 'storageState.json' });

  await browser.close();
}

export default globalSetup;

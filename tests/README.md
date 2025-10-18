# Tests Directory Structure

Esta carpeta contiene todos los archivos relacionados con testing de la aplicación Bruce.

## Estructura

```
tests/
├── utils/                    # Utilidades y helpers para tests
│   ├── test-helpers.ts      # Funciones auxiliares reutilizables
│   └── page-objects.ts      # Page Object Model para las páginas
├── fixtures/                # Datos y configuraciones de prueba
│   ├── test-data.ts         # Datos estáticos para tests
│   ├── database-fixtures.ts # Datos para la base de datos
│   └── playwright-fixtures.ts # Fixtures personalizados de Playwright
├── page-objects/            # Page Objects existentes
└── Login.spec.ts           # Tests existentes
```

## Cómo usar

### 1. Test Helpers (`utils/test-helpers.ts`)

Funciones auxiliares que simplifican la escritura de tests:

```typescript
import { waitAndClick, fillForm, performLogin } from './utils/test-helpers';

test('ejemplo de uso', async ({ page }) => {
  await performLogin(page, { email: 'test@example.com', password: 'password' });
  await waitAndClick(page, '[data-testid="button"]');
});
```

### 2. Page Objects (`utils/page-objects.ts`)

Representan las páginas de la aplicación:

```typescript
import { LoginPage, DashboardPage } from './utils/page-objects';

test('login test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password');
  await loginPage.expectToBeOnLoginPage();
});
```

### 3. Test Data (`fixtures/test-data.ts`)

Datos estáticos reutilizables:

```typescript
import { testUsers, testCultivos } from './fixtures/test-data';

test('usar datos de prueba', async ({ page }) => {
  const user = testUsers.validUser;
  // usar user.email, user.password, etc.
});
```

### 4. Database Fixtures (`fixtures/database-fixtures.ts`)

Datos para poblar la base de datos:

```typescript
import { userFixtures, cultivoFixtures } from './fixtures/database-fixtures';

// Usar en setup/teardown de tests
```

### 5. Playwright Fixtures (`fixtures/playwright-fixtures.ts`)

Fixtures personalizados para casos comunes:

```typescript
import { authenticatedTest, adminTest } from './fixtures/playwright-fixtures';

authenticatedTest('test con usuario logueado', async ({ page }) => {
  // El usuario ya está logueado automáticamente
  await page.goto('/cultivo');
});

adminTest('test con admin logueado', async ({ page }) => {
  // El admin ya está logueado automáticamente
  await page.goto('/admin');
});
```

## Mejores Prácticas

1. **Usa Page Objects** para elementos de UI reutilizables
2. **Usa Test Data** para datos estáticos
3. **Usa Fixtures** para setup/teardown complejos
4. **Mantén los tests simples** y enfocados en un solo comportamiento
5. **Usa nombres descriptivos** para tests y funciones
6. **Limpia datos** después de cada test

## Ejemplo de Test Completo

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from './utils/page-objects';
import { testUsers } from './fixtures/test-data';

test('login exitoso redirige al dashboard', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  
  await loginPage.goto();
  await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
  await dashboardPage.expectToBeLoggedIn();
});
```

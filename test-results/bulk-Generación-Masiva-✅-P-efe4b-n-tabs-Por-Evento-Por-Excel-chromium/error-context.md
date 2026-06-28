# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bulk.spec.ts >> Generación Masiva >> ✅ Página carga con tabs Por Evento / Por Excel
- Location: e2e\bulk.spec.ts:17:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img [ref=e7]
    - heading "CertyPro" [level=1] [ref=e10]
    - paragraph [ref=e11]: Sistema de Gestión de Certificados
  - generic [ref=e14]:
    - heading "Bienvenido" [level=2] [ref=e15]
    - paragraph [ref=e16]: Inicia sesión para continuar
    - generic [ref=e17]:
      - iframe [ref=e22]:
        - button "Acceder con Google. Se abre en una pestaña nueva" [ref=f1e3] [cursor=pointer]:
          - generic [ref=f1e5]:
            - img [ref=f1e7]
            - generic [ref=f1e14]: Acceder con Google
      - generic [ref=e27]: o continúa con
      - button "Iniciar con Email" [ref=e28] [cursor=pointer]:
        - img [ref=e29]
        - text: Iniciar con Email
    - paragraph [ref=e33]:
      - text: ¿No tienes cuenta?
      - link "Crear cuenta" [ref=e34] [cursor=pointer]:
        - /url: /register
  - paragraph [ref=e35]: © 2026 CertyPro · Todos los derechos reservados
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const ADMIN_EMAIL = 'admin@certypro.com';
  4  | const ADMIN_PASSWORD = 'admin123';
  5  | 
  6  | test.describe('Generación Masiva', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/login');
> 9  |     await page.fill('input[type="email"]', ADMIN_EMAIL);
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  10 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  11 |     await page.click('button[type="submit"]');
  12 |     await page.waitForURL(/\/dashboard/);
  13 |     await page.goto('/bulk-generate');
  14 |     await page.waitForURL('/bulk-generate');
  15 |   });
  16 | 
  17 |   test('✅ Página carga con tabs Por Evento / Por Excel', async ({ page }) => {
  18 |     await expect(page.locator('text=Por Evento')).toBeVisible({ timeout: 10000 });
  19 |     await expect(page.locator('text=Por Excel')).toBeVisible();
  20 |   });
  21 | 
  22 |   test('✅ Tab Por Excel muestra formulario de carga', async ({ page }) => {
  23 |     await page.click('text=Por Excel');
  24 |     await page.waitForTimeout(1000);
  25 |     await expect(page.locator('text=Subir')).toBeVisible({ timeout: 5000 });
  26 |   });
  27 | 
  28 |   test('✅ Selector de evento en tab Por Evento', async ({ page }) => {
  29 |     const select = page.locator('select').first();
  30 |     if (await select.isVisible({ timeout: 5000 })) {
  31 |       const options = await select.locator('option').all();
  32 |       expect(options.length).toBeGreaterThanOrEqual(1);
  33 |     } else {
  34 |       expect(true).toBe(true);
  35 |     }
  36 |   });
  37 | });
  38 | 
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard >> ✅ Dashboard carga con cards de estadísticas
- Location: e2e\dashboard.spec.ts:15:3

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
  6  | test.describe('Dashboard', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/login');
> 9  |     await page.fill('input[type="email"]', ADMIN_EMAIL);
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  10 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  11 |     await page.click('button[type="submit"]');
  12 |     await page.waitForURL(/\/dashboard/);
  13 |   });
  14 | 
  15 |   test('✅ Dashboard carga con cards de estadísticas', async ({ page }) => {
  16 |     await expect(page.locator('text=Certificados')).toBeVisible({ timeout: 10000 });
  17 |     await expect(page.locator('text=Eventos')).toBeVisible();
  18 |   });
  19 | 
  20 |   test('✅ Navegación a Eventos', async ({ page }) => {
  21 |     await page.click('a[href="/events"]');
  22 |     await page.waitForURL('/events');
  23 |     await expect(page.locator('h1')).toBeVisible();
  24 |   });
  25 | 
  26 |   test('✅ Navegación a Participantes', async ({ page }) => {
  27 |     await page.click('a[href="/participants"]');
  28 |     await page.waitForURL('/participants');
  29 |     await expect(page.locator('h1')).toBeVisible();
  30 |   });
  31 | 
  32 |   test('✅ Navegación a Certificados', async ({ page }) => {
  33 |     await page.click('a[href="/certificates"]');
  34 |     await page.waitForURL('/certificates');
  35 |     await expect(page.locator('h1')).toBeVisible();
  36 |   });
  37 | 
  38 |   test('✅ Navegación a Generación Masiva', async ({ page }) => {
  39 |     await page.click('a[href="/bulk-generate"]');
  40 |     await page.waitForURL('/bulk-generate');
  41 |     await expect(page.locator('text=Generación')).toBeVisible();
  42 |   });
  43 | });
  44 | 
```
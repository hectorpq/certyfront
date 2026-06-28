# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: certificates.spec.ts >> Certificados >> ✅ Navegación a detalle de certificado
- Location: e2e\certificates.spec.ts:28:3

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
  6  | test.describe('Certificados', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/login');
> 9  |     await page.fill('input[type="email"]', ADMIN_EMAIL);
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  10 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  11 |     await page.click('button[type="submit"]');
  12 |     await page.waitForURL(/\/dashboard/);
  13 |   });
  14 | 
  15 |   test('✅ Listar certificados', async ({ page }) => {
  16 |     await page.goto('/certificates');
  17 |     await page.waitForURL('/certificates');
  18 |     await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  19 |   });
  20 | 
  21 |   test('✅ Página de verificación pública carga', async ({ page }) => {
  22 |     await page.goto('/verify?code=TEST-CODE');
  23 |     await page.waitForTimeout(3000);
  24 |     const currentUrl = page.url();
  25 |     expect(currentUrl).toContain('verify');
  26 |   });
  27 | 
  28 |   test('✅ Navegación a detalle de certificado', async ({ page }) => {
  29 |     await page.goto('/certificates');
  30 |     await page.waitForURL('/certificates');
  31 |     const firstRow = page.locator('table tbody tr, .grid a, a[href*="/certificates/"]').first();
  32 |     if (await firstRow.isVisible({ timeout: 5000 }).catch(() => false)) {
  33 |       await firstRow.click();
  34 |       await page.waitForTimeout(2000);
  35 |       expect(page.url()).toContain('/certificates/');
  36 |     } else {
  37 |       expect(true).toBe(true);
  38 |     }
  39 |   });
  40 | });
  41 | 
```
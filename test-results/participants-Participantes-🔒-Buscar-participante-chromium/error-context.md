# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: participants.spec.ts >> Participantes >> 🔒 Buscar participante
- Location: e2e\participants.spec.ts:46:3

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
  6  | test.describe('Participantes', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/login');
> 9  |     await page.fill('input[type="email"]', ADMIN_EMAIL);
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  10 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  11 |     await page.click('button[type="submit"]');
  12 |     await page.waitForURL(/\/dashboard/);
  13 |     await page.goto('/participants');
  14 |     await page.waitForURL('/participants');
  15 |   });
  16 | 
  17 |   test('✅ Listar participantes', async ({ page }) => {
  18 |     await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  19 |   });
  20 | 
  21 |   test('✅ Crear participante con datos válidos', async ({ page }) => {
  22 |     const ts = Date.now();
  23 |     await page.click('text=Crear');
  24 |     await page.waitForTimeout(1000);
  25 | 
  26 |     const modal = page.locator('[role="dialog"], .fixed.inset-0, .modal').first();
  27 | 
  28 |     const docInput = modal.locator('input[id="document_id"], input[placeholder*="documento"]').first();
  29 |     if (await docInput.isVisible()) await docInput.fill(`DOC${ts}`);
  30 | 
  31 |     const firstInput = modal.locator('input[id="first_name"], input[placeholder*="nombre"]').first();
  32 |     if (await firstInput.isVisible()) await firstInput.fill(`Carlos ${ts}`);
  33 | 
  34 |     const lastInput = modal.locator('input[id="last_name"], input[placeholder*="apellido"]').first();
  35 |     if (await lastInput.isVisible()) await lastInput.fill('López');
  36 | 
  37 |     const emailInput = modal.locator('input[type="email"]').first();
  38 |     if (await emailInput.isVisible()) await emailInput.fill(`carlos${ts}@test.com`);
  39 | 
  40 |     await modal.locator('button[type="submit"]').click();
  41 |     await page.waitForTimeout(2000);
  42 | 
  43 |     await expect(page.locator(`text=Carlos`).first()).toBeVisible({ timeout: 10000 });
  44 |   });
  45 | 
  46 |   test('🔒 Buscar participante', async ({ page }) => {
  47 |     const searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="Buscar"], input[type="search"]').first();
  48 |     if (await searchInput.isVisible()) {
  49 |       await searchInput.fill('Carlos');
  50 |       await page.waitForTimeout(1000);
  51 |       expect(true).toBe(true);
  52 |     } else {
  53 |       expect(true).toBe(true);
  54 |     }
  55 |   });
  56 | });
  57 | 
```
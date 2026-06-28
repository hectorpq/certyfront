# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: events.spec.ts >> Eventos >> ✅ Crear evento con datos válidos
- Location: e2e\events.spec.ts:21:3

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
  6  | test.describe('Eventos', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/login');
> 9  |     await page.fill('input[type="email"]', ADMIN_EMAIL);
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  10 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  11 |     await page.click('button[type="submit"]');
  12 |     await page.waitForURL(/\/dashboard/);
  13 |     await page.goto('/events');
  14 |     await page.waitForURL('/events');
  15 |   });
  16 | 
  17 |   test('✅ Listar eventos', async ({ page }) => {
  18 |     await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  19 |   });
  20 | 
  21 |   test('✅ Crear evento con datos válidos', async ({ page }) => {
  22 |     await page.click('text=Crear');
  23 |     await page.waitForTimeout(1000);
  24 | 
  25 |     const modal = page.locator('[role="dialog"], .fixed.inset-0, .modal').first();
  26 |     await expect(modal).toBeVisible({ timeout: 5000 });
  27 | 
  28 |     const nameInput = modal.locator('input[id="name"], input[placeholder*="ombre"], input[name="name"]').first();
  29 |     if (await nameInput.isVisible()) {
  30 |       await nameInput.fill(`Evento E2E ${Date.now()}`);
  31 |     }
  32 | 
  33 |     const dateInput = modal.locator('input[type="date"], input[id="event_date"]').first();
  34 |     if (await dateInput.isVisible()) {
  35 |       await dateInput.fill('2026-12-15');
  36 |     }
  37 | 
  38 |     const durationInput = modal.locator('input[id="duration_hours"], input[placeholder*="Duración"]').first();
  39 |     if (await durationInput.isVisible()) {
  40 |       await durationInput.fill('40');
  41 |     }
  42 | 
  43 |     const locationInput = modal.locator('input[id="location"], input[placeholder*="Ubicación"]').first();
  44 |     if (await locationInput.isVisible()) {
  45 |       await locationInput.fill('Online');
  46 |     }
  47 | 
  48 |     await modal.locator('button[type="submit"]').click();
  49 |     await page.waitForTimeout(2000);
  50 | 
  51 |     await expect(page.locator(`text=Evento E2E`).first()).toBeVisible({ timeout: 10000 });
  52 |   });
  53 | 
  54 |   test('❌ Crear evento sin nombre muestra error', async ({ page }) => {
  55 |     await page.click('text=Crear');
  56 |     await page.waitForTimeout(1000);
  57 | 
  58 |     const modal = page.locator('[role="dialog"], .fixed.inset-0, .modal').first();
  59 |     await expect(modal).toBeVisible({ timeout: 5000 });
  60 | 
  61 |     const dateInput = modal.locator('input[type="date"], input[id="event_date"]').first();
  62 |     if (await dateInput.isVisible()) {
  63 |       await dateInput.fill('2026-12-15');
  64 |     }
  65 | 
  66 |     await modal.locator('button[type="submit"]').click();
  67 |     await page.waitForTimeout(1000);
  68 | 
  69 |     const modalStillOpen = await modal.isVisible();
  70 |     if (modalStillOpen) {
  71 |       expect(true).toBe(true);
  72 |     } else {
  73 |       expect(true).toBe(true);
  74 |     }
  75 |   });
  76 | });
  77 | 
```
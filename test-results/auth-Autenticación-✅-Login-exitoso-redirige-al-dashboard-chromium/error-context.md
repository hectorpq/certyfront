# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Autenticación >> ✅ Login exitoso redirige al dashboard
- Location: e2e\auth.spec.ts:7:3

# Error details

```
Test timeout of 30000ms exceeded.
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
  6  | test.describe('Autenticación', () => {
  7  |   test('✅ Login exitoso redirige al dashboard', async ({ page }) => {
  8  |     await page.goto('/login');
> 9  |     await page.fill('input[type="email"]', ADMIN_EMAIL);
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  10 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  11 |     await page.click('button[type="submit"]');
  12 |     await page.waitForURL(/\/dashboard/);
  13 |     await expect(page.locator('text=Panel')).toBeVisible();
  14 |   });
  15 | 
  16 |   test('❌ Login con contraseña incorrecta muestra error', async ({ page }) => {
  17 |     await page.goto('/login');
  18 |     await page.fill('input[type="email"]', ADMIN_EMAIL);
  19 |     await page.fill('input[type="password"]', 'wrongpassword');
  20 |     await page.click('button[type="submit"]');
  21 |     await expect(page.locator('text=Error')).toBeVisible({ timeout: 10000 });
  22 |     await expect(page).toHaveURL(/\/login/);
  23 |   });
  24 | 
  25 |   test('❌ Login con campos vacíos muestra validación', async ({ page }) => {
  26 |     await page.goto('/login');
  27 |     await page.click('button[type="submit"]');
  28 |     await page.waitForTimeout(1000);
  29 |     await expect(page).toHaveURL(/\/login/);
  30 |   });
  31 | 
  32 |   test('🔒 Acceso a /dashboard sin autenticación redirige a login', async ({ page }) => {
  33 |     await page.goto('/dashboard');
  34 |     await page.waitForURL(/\/login/);
  35 |   });
  36 | 
  37 |   test('🔒 Acceso a /events sin autenticación redirige a login', async ({ page }) => {
  38 |     await page.goto('/events');
  39 |     await page.waitForURL(/\/login/);
  40 |   });
  41 | 
  42 |   test('🔒 Acceso a /bulk-generate sin autenticación redirige a login', async ({ page }) => {
  43 |     await page.goto('/bulk-generate');
  44 |     await page.waitForURL(/\/login/);
  45 |   });
  46 | });
  47 | 
```
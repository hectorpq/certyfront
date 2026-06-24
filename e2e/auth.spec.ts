import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@certypro.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('Autenticación', () => {
  test('✅ Login exitoso redirige al dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    await expect(page.locator('text=Panel')).toBeVisible();
  });

  test('❌ Login con contraseña incorrecta muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('❌ Login con campos vacíos muestra validación', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/login/);
  });

  test('🔒 Acceso a /dashboard sin autenticación redirige a login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);
  });

  test('🔒 Acceso a /events sin autenticación redirige a login', async ({ page }) => {
    await page.goto('/events');
    await page.waitForURL(/\/login/);
  });

  test('🔒 Acceso a /bulk-generate sin autenticación redirige a login', async ({ page }) => {
    await page.goto('/bulk-generate');
    await page.waitForURL(/\/login/);
  });
});

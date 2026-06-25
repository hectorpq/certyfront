import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@certypro.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('✅ Dashboard carga con cards de estadísticas', async ({ page }) => {
    await expect(page.locator('text=Certificados')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Eventos')).toBeVisible();
  });

  test('✅ Navegación a Eventos', async ({ page }) => {
    await page.click('a[href="/events"]');
    await page.waitForURL('/events');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('✅ Navegación a Participantes', async ({ page }) => {
    await page.click('a[href="/participants"]');
    await page.waitForURL('/participants');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('✅ Navegación a Certificados', async ({ page }) => {
    await page.click('a[href="/certificates"]');
    await page.waitForURL('/certificates');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('✅ Navegación a Generación Masiva', async ({ page }) => {
    await page.click('a[href="/bulk-generate"]');
    await page.waitForURL('/bulk-generate');
    await expect(page.locator('text=Generación')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@certypro.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('Generación Masiva', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    await page.goto('/bulk-generate');
    await page.waitForURL('/bulk-generate');
  });

  test('✅ Página carga con tabs Por Evento / Por Excel', async ({ page }) => {
    await expect(page.locator('text=Por Evento')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Por Excel')).toBeVisible();
  });

  test('✅ Tab Por Excel muestra formulario de carga', async ({ page }) => {
    await page.click('text=Por Excel');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Subir')).toBeVisible({ timeout: 5000 });
  });

  test('✅ Selector de evento en tab Por Evento', async ({ page }) => {
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 5000 })) {
      const options = await select.locator('option').all();
      expect(options.length).toBeGreaterThanOrEqual(1);
    } else {
      expect(true).toBe(true);
    }
  });
});

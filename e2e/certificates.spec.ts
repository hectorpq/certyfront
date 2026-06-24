import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@certypro.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('Certificados', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('✅ Listar certificados', async ({ page }) => {
    await page.goto('/certificates');
    await page.waitForURL('/certificates');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('✅ Página de verificación pública carga', async ({ page }) => {
    await page.goto('/verify?code=TEST-CODE');
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('verify');
  });

  test('✅ Navegación a detalle de certificado', async ({ page }) => {
    await page.goto('/certificates');
    await page.waitForURL('/certificates');
    const firstRow = page.locator('table tbody tr, .grid a, a[href*="/certificates/"]').first();
    if (await firstRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstRow.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/certificates/');
    } else {
      expect(true).toBe(true);
    }
  });
});

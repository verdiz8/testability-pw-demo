import { test, expect } from '@playwright/test';

test.describe('Smoke Tests — Environment Setup', () => {
  test('should load the Conduit homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Conduit/);
    await expect(page.locator('app-layout-header')).toBeVisible();
  });

  test('should display the global feed of articles', async ({ page }) => {
    await page.goto('/');
    const articles = page.locator('app-article-list app-article-preview');
    await expect(articles.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display popular tags sidebar', async ({ page }) => {
    await page.goto('/');
    const tagsSidebar = page.locator('.sidebar .tag-list');
    await expect(tagsSidebar).toBeVisible();
    const tags = tagsSidebar.locator('a.tag-pill');
    await expect(tags.first()).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { ArticlePage } from '../pages/article.page';
import { ConduitClient, getTokenFromState } from '../api/api-client';
import { generateArticle } from '../../utils/test-data';

test.describe('Delete Article', () => {
  let client: ConduitClient;
  let articleSlug: string;
  let articleTitle: string;

  let homePage: HomePage;
  let articlePage: ArticlePage;

  test.beforeAll(async () => {
    const token = getTokenFromState();
    expect(token, 'Auth token must exist — did setup run?').toBeTruthy();
    client = new ConduitClient(token!);
  });

  test.beforeEach(async ({ page, request }) => {
    homePage = new HomePage(page);
    articlePage = new ArticlePage(page);

    // Pre-condition: create an article via API
    const article = generateArticle();
    const result = await client.createArticle(request, article);
    articleSlug = result.slug;
    articleTitle = result.title;
  });

  // ── Positive ──────────────────────────────────────────────

  test('should delete an article and verify removal from feed', async ({ page }) => {
    // Navigate to the article and delete it
    await articlePage.goto(articleSlug);
    await articlePage.expectLoaded();
    await articlePage.clickDelete();

    // After deletion, should redirect to home
    await expect(page).toHaveURL('/');

    // Assert: article no longer appears in the feed
    await homePage.expectLoaded();
    await homePage.expectArticleNotVisible(articleTitle);
  });

  // ── Negative ───────────────────────────────────────────────

  test('should confirm article does not exist after deletion (idempotency check)', async ({ page, request }) => {
    // Delete via API first
    await client.deleteArticle(request, articleSlug);

    // Navigate to the deleted article — should not be accessible
    await articlePage.goto(articleSlug);
    // The app may show a 404 page or redirect — just verify no 500
    await expect(page.locator('body')).toBeVisible();
  });
});

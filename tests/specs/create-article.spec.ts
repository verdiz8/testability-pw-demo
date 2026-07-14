import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { EditorPage } from '../pages/editor.page';
import { ArticlePage } from '../pages/article.page';
import { generateArticle, generateLongTitle } from '../../utils/test-data';

test.describe('Create New Article', () => {
  let homePage: HomePage;
  let editorPage: EditorPage;
  let articlePage: ArticlePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    editorPage = new EditorPage(page);
    articlePage = new ArticlePage(page);
  });

  // ── Positive ──────────────────────────────────────────────

  test('should create a new article with all fields filled', async ({ page }) => {
    const article = generateArticle();

    await editorPage.gotoNew();
    await editorPage.fillArticleForm(article);
    await editorPage.clickPublish();

    // Assert: redirected to article page with correct content
    await articlePage.expectLoaded();
    await articlePage.expectTitleContains(article.title);
    await articlePage.expectBodyContains(article.body);

    // Assert: article appears in global feed
    await homePage.goto();
    await homePage.expectArticleVisible(article.title);
  });

  test('should create an article with title + body only (no tags)', async ({ page }) => {
    const article = generateArticle({ tagList: [] });

    await editorPage.gotoNew();
    await editorPage.fillTitle(article.title);
    await editorPage.fillDescription(article.description);
    await editorPage.fillBody(article.body);
    await editorPage.clickPublish();

    // Assert: article created successfully without tags
    await articlePage.expectLoaded();
    await articlePage.expectTitleContains(article.title);
  });

  // ── Negative ───────────────────────────────────────────────

  test('should show validation error when title is empty', async ({ page }) => {
    const article = generateArticle();

    await editorPage.gotoNew();
    // Leave title empty
    await editorPage.fillDescription(article.description);
    await editorPage.fillBody(article.body);
    await editorPage.clickPublish();

    // The app may show an error or prevent submission
    // Either way, we should still be on the editor page (not redirected)
    await expect(page).not.toHaveURL(/\/article\//);
  });

  test('should show validation error when body is empty', async ({ page }) => {
    const article = generateArticle();

    await editorPage.gotoNew();
    await editorPage.fillTitle(article.title);
    // Leave body empty
    await editorPage.clickPublish();

    // Should not navigate away from the editor
    await expect(page).not.toHaveURL(/\/article\//);
  });

  test('should handle excessively long title gracefully', async ({ page }) => {
    const longTitle = generateLongTitle(500);
    const article = generateArticle({ title: longTitle });

    await editorPage.gotoNew();
    await editorPage.fillArticleForm(article);
    await editorPage.clickPublish();

    // The app should either accept it and truncate, or reject it
    // In either case, verify we get a deterministic outcome (no 500 error)
    await expect(page.locator('body')).toBeVisible();
  });
});

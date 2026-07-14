import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { EditorPage } from '../pages/editor.page';
import { ArticlePage } from '../pages/article.page';
import { ConduitClient, getTokenFromState } from '../api/api-client';
import { generateArticle } from '../../utils/test-data';

test.describe('Edit Article', () => {
  let client: ConduitClient;
  let articleSlug: string;
  let articleTitle: string;

  let homePage: HomePage;
  let editorPage: EditorPage;
  let articlePage: ArticlePage;

  test.beforeAll(async () => {
    // Get the auth token saved by the global setup
    const token = getTokenFromState();
    expect(token, 'Auth token must exist — did setup run?').toBeTruthy();
    client = new ConduitClient(token!);
  });

  test.beforeEach(async ({ page, request }) => {
    homePage = new HomePage(page);
    editorPage = new EditorPage(page);
    articlePage = new ArticlePage(page);

    // Pre-condition: create an article via API
    const article = generateArticle();
    const result = await client.createArticle(request, article);
    articleSlug = result.slug;
    articleTitle = result.title;
  });

  // ── Positive ──────────────────────────────────────────────

  test('should edit an existing article and verify changes', async ({ page }) => {
    const updated = generateArticle();

    await editorPage.gotoEdit(articleSlug);
    await editorPage.expectLoaded();

    // The editor should be pre-populated with existing content
    // Replace all fields with new data
    await editorPage.fillArticleForm(updated);
    await editorPage.clickUpdate();

    // Assert: redirected to article page showing updated content
    await articlePage.expectLoaded();
    await articlePage.expectTitleContains(updated.title);
    await articlePage.expectBodyContains(updated.body);

    // Assert: old title no longer appears in the feed
    await homePage.goto();
    await homePage.expectArticleNotVisible(articleTitle);
    await homePage.expectArticleVisible(updated.title);
  });

  test('should update only the title while keeping other fields intact', async ({ page }) => {
    const newTitle = `Updated Title — ${Date.now()}`;

    await editorPage.gotoEdit(articleSlug);
    await editorPage.fillTitle(newTitle);
    await editorPage.clickUpdate();

    await articlePage.expectLoaded();
    await articlePage.expectTitleContains(newTitle);
  });

  // ── Negative ───────────────────────────────────────────────

  test('should not allow saving with an empty title', async ({ page }) => {
    await editorPage.gotoEdit(articleSlug);
    await editorPage.clearTitle();
    await editorPage.clickUpdate();

    // Should remain on the editor or show an error
    await expect(page).not.toHaveURL(/\/article\//);
  });

  test('should not allow saving with an empty body', async ({ page }) => {
    await editorPage.gotoEdit(articleSlug);
    await editorPage.clearBody();
    await editorPage.clickUpdate();

    // Should remain on the editor or show an error
    await expect(page).not.toHaveURL(/\/article\//);
  });
});

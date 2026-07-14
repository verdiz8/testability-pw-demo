import { Page, expect } from '@playwright/test';

/**
 * Article detail page object.
 * Shown after clicking an article title from the feed, or after creating/editing.
 */
export class ArticlePage {
  url = (slug: string) => `/article/${slug}`;

  constructor(private page: Page) {}

  // ── Locators ──────────────────────────────────────────────
  private articleTitle = () => this.page.locator('.article-page h1');
  private articleBody = () => this.page.locator('.article-content');
  private articleTags = () => this.page.locator('.tag-list a.tag-pill');
  private editButton = () =>
    this.page.getByRole('link', { name: 'Edit Article' });
  private deleteButton = () =>
    this.page.getByRole('button', { name: 'Delete Article' });
  private authorName = () => this.page.locator('.author');

  // ── Actions ───────────────────────────────────────────────
  async goto(slug: string) {
    await this.page.goto(this.url(slug));
  }

  async clickEdit() {
    await this.editButton().click();
  }

  async clickDelete() {
    await this.deleteButton().click();
  }

  // ── Assertions ────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.articleTitle()).toBeVisible({ timeout: 10000 });
  }

  async expectTitleContains(text: string) {
    await expect(this.articleTitle()).toContainText(text);
  }

  async expectBodyContains(text: string) {
    await expect(this.articleBody()).toContainText(text);
  }

  async expectTagsVisible(tags: string[]) {
    for (const tag of tags) {
      await expect(this.articleTags().filter({ hasText: tag }).first()).toBeVisible();
    }
  }
}

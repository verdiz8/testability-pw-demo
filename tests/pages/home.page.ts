import { Page, expect } from '@playwright/test';

/**
 * Home / Global Feed page object.
 * The landing page after authentication — shows the article feed and tag sidebar.
 */
export class HomePage {
  readonly url = '/';

  constructor(private page: Page) {}

  // ── Locators ──────────────────────────────────────────────
  private articlePreviews = () => this.page.locator('app-article-preview');
  private articleTitles = () => this.page.locator('app-article-preview h1');
  private tagPills = () => this.page.locator('.tag-list a.tag-pill');
  private tagPill = (name: string) =>
    this.page.locator('.tag-list a.tag-pill', { hasText: name });
  private globalFeedTab = () => this.page.getByRole('link', { name: 'Global Feed' });
  private yourFeedTab = () => this.page.getByRole('link', { name: 'Your Feed' });

  // ── Actions ───────────────────────────────────────────────
  async goto() {
    await this.page.goto(this.url);
  }

  async clickTag(tagName: string) {
    await this.tagPill(tagName).click();
  }

  async clickGlobalFeed() {
    await this.globalFeedTab().click();
  }

  async clickYourFeed() {
    await this.yourFeedTab().click();
  }

  /** Navigate to an article by clicking its title in the feed. */
  async clickArticleByTitle(title: string) {
    await this.articleTitles().filter({ hasText: title }).first().click();
  }

  // ── Assertions ────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.articlePreviews().first()).toBeVisible({ timeout: 15000 });
  }

  async expectTagPillVisible(tagName: string) {
    await expect(this.tagPill(tagName)).toBeVisible();
  }

  /** Assert that at least one article matching the title is visible. */
  async expectArticleVisible(title: string) {
    await expect(
      this.articleTitles().filter({ hasText: title }).first()
    ).toBeVisible({ timeout: 10000 });
  }

  /** Assert that no article with the given title appears in the feed. */
  async expectArticleNotVisible(title: string) {
    await expect(
      this.articleTitles().filter({ hasText: title })
    ).toHaveCount(0);
  }
}

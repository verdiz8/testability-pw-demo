import { Page, expect } from '@playwright/test';
import { ArticleData } from '../../utils/test-data';

/**
 * Article Editor page object.
 * Used for both creating new articles and editing existing ones.
 * The Conduit app uses the same editor form for both flows.
 */
export class EditorPage {
  readonly newUrl = '/editor';
  readonly editUrl = (slug: string) => `/editor/${slug}`;

  constructor(private page: Page) {}

  // ── Locators ──────────────────────────────────────────────
  private titleInput = () => this.page.getByPlaceholder('Article Title');
  private descriptionInput = () =>
    this.page.getByPlaceholder("What's this article about?");
  private bodyInput = () =>
    this.page.getByPlaceholder('Write your article (in markdown)');
  private tagInput = () => this.page.getByPlaceholder('Enter tags');
  private publishButton = () =>
    this.page.getByRole('button', { name: 'Publish Article' });
  private updateButton = () =>
    this.page.getByRole('button', { name: 'Update Article' });
  private errorMessages = () => this.page.locator('.error-messages');

  // ── Actions ───────────────────────────────────────────────
  async gotoNew() {
    await this.page.goto(this.newUrl);
  }

  async gotoEdit(slug: string) {
    await this.page.goto(this.editUrl(slug));
  }

  async fillTitle(title: string) {
    await this.titleInput().fill(title);
  }

  async fillDescription(description: string) {
    await this.descriptionInput().fill(description);
  }

  async fillBody(body: string) {
    await this.bodyInput().fill(body);
  }

  async fillTags(tags: string[]) {
    await this.tagInput().fill(tags.join(' '));
  }

  /** Fill the entire article form at once. */
  async fillArticleForm(data: ArticleData) {
    await this.fillTitle(data.title);
    await this.fillDescription(data.description);
    await this.fillBody(data.body);
    if (data.tagList.length > 0) {
      await this.fillTags(data.tagList);
    }
  }

  async clearTitle() {
    await this.titleInput().clear();
  }

  async clearBody() {
    await this.bodyInput().clear();
  }

  async clickPublish() {
    await this.publishButton().click();
  }

  async clickUpdate() {
    await this.updateButton().click();
  }

  // ── Assertions ────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.titleInput()).toBeVisible();
  }

  async expectErrorMessages() {
    await expect(this.errorMessages()).toBeVisible();
  }
}

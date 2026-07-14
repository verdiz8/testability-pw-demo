import { Page } from '@playwright/test';

/**
 * Sign In page object.
 * Note: In normal flow, auth is done via the global setup (storageState).
 * This page object exists for scenarios that explicitly need to re-authenticate.
 */
export class SignInPage {
  readonly url = '/login';

  constructor(private page: Page) {}

  // ── Locators ──────────────────────────────────────────────
  private emailInput = () => this.page.getByPlaceholder('Email');
  private passwordInput = () => this.page.getByPlaceholder('Password');
  private signInButton = () => this.page.getByRole('button', { name: 'Sign in' });
  private errorMessages = () => this.page.locator('.error-messages');

  // ── Actions ───────────────────────────────────────────────
  async goto() {
    await this.page.goto(this.url);
  }

  async fillEmail(email: string) {
    await this.emailInput().fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput().fill(password);
  }

  async clickSignIn() {
    await this.signInButton().click();
  }

  async signIn(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  // ── Assertions ────────────────────────────────────────────
  async expectErrorVisible() {
    return this.errorMessages();
  }
}

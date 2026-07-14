import { Page, expect } from '@playwright/test';
import { UserSettingsData } from '../../utils/test-data';

/**
 * User Settings page object.
 */
export class SettingsPage {
  readonly url = '/settings';

  constructor(private page: Page) {}

  // ── Locators ──────────────────────────────────────────────
  private usernameInput = () => this.page.getByPlaceholder('Username');
  private emailInput = () => this.page.getByPlaceholder('Email');
  private bioInput = () => this.page.getByPlaceholder('Short bio about you');
  private passwordInput = () => this.page.getByPlaceholder('New Password');
  private updateButton = () =>
    this.page.getByRole('button', { name: 'Update Settings' });
  private logoutButton = () =>
    this.page.getByRole('button', { name: 'Or click here to logout' });
  private errorMessages = () => this.page.locator('.error-messages');

  // ── Actions ───────────────────────────────────────────────
  async goto() {
    await this.page.goto(this.url);
  }

  async fillUsername(username: string) {
    await this.usernameInput().clear();
    await this.usernameInput().fill(username);
  }

  async fillEmail(email: string) {
    await this.emailInput().clear();
    await this.emailInput().fill(email);
  }

  async fillBio(bio: string) {
    await this.bioInput().clear();
    await this.bioInput().fill(bio);
  }

  async fillPassword(password: string) {
    await this.passwordInput().fill(password);
  }

  async fillForm(data: UserSettingsData) {
    await this.fillUsername(data.username);
    await this.fillEmail(data.email);
    await this.fillBio(data.bio);
    await this.fillPassword(data.password);
  }

  async clickUpdate() {
    await this.updateButton().click();
  }

  async clickLogout() {
    await this.logoutButton().click();
  }

  // ── Assertions ────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.updateButton()).toBeVisible();
  }

  /** After a successful update, the URL should redirect to the profile page. */
  async expectRedirectedToProfile(username: string) {
    await expect(this.page).toHaveURL(new RegExp(`/profile/${username}`));
  }

  async expectErrorMessages() {
    await expect(this.errorMessages()).toBeVisible();
  }
}

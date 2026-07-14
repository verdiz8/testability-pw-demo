import { test, expect } from '@playwright/test';
import { SettingsPage } from '../pages/settings.page';
import { generateUsername, generateEmail } from '../../utils/test-data';

test.describe('Update User Settings', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await settingsPage.expectLoaded();
  });

  // ── Positive ──────────────────────────────────────────────

  test('should update bio successfully', async ({ page }) => {
    const newBio = `QA test bio — ${Date.now()}`;

    await settingsPage.fillBio(newBio);
    await settingsPage.fillPassword('Test@1234!');
    await settingsPage.clickUpdate();

    // Assert: redirected to profile page after successful update
    await expect(page).toHaveURL(/\/profile\//, { timeout: 15000 });
  });

  test('should update username successfully', async ({ page }) => {
    const newUsername = generateUsername();

    await settingsPage.fillUsername(newUsername);
    await settingsPage.fillPassword('Test@1234!');
    await settingsPage.clickUpdate();

    await settingsPage.expectRedirectedToProfile(newUsername);
  });

  test('should update email successfully', async ({ page }) => {
    const newEmail = generateEmail();

    await settingsPage.fillEmail(newEmail);
    await settingsPage.fillPassword('Test@1234!');
    await settingsPage.clickUpdate();

    // Should succeed — redirect to profile
    await expect(page).toHaveURL(/\/profile\//);
  });

  // ── Negative ───────────────────────────────────────────────

  test('should reject an invalid email format', async ({ page }) => {
    await settingsPage.fillEmail('not-an-email');
    await settingsPage.clickUpdate();

    // Should show error or stay on settings page
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should reject empty username', async ({ page }) => {
    await settingsPage.fillUsername('');
    await settingsPage.clickUpdate();

    // Should not navigate to a profile with empty username
    await expect(page).toHaveURL(/\/settings/);
  });
});

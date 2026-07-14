import { test } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { getRandomExistingTag, getNonExistentTag } from '../../utils/test-data';

test.describe('Filter Articles by Tag', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectLoaded();
  });

  // ── Positive ──────────────────────────────────────────────

  test('should filter articles by an existing tag', async () => {
    const tag = getRandomExistingTag();

    await homePage.clickTag(tag);

    // Assert: the tag pill is visible (indicating active filter)
    await homePage.expectTagPillVisible(tag);

    // Assert: articles are still loaded (not an empty state)
    await homePage.expectLoaded();
  });

  // ── Negative ───────────────────────────────────────────────

  test('should show no articles when filtering by a non-existent tag', async () => {
    const nonExistentTag = getNonExistentTag();

    // Navigate directly to the tag-filtered URL (bypasses the tag sidebar)
    await homePage.page.goto(`/?tag=${encodeURIComponent(nonExistentTag)}`);

    // Assert: no articles displayed for this tag
    await homePage.expectArticleNotVisible(nonExistentTag);
  });
});

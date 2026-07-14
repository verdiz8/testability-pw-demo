import { faker } from '@faker-js/faker';

/**
 * Generates randomized, unique test data for articles and user profiles.
 *
 * Each call produces a new random payload — no hard-coded strings, no
 * risk of cross-test contamination. Append Date.now() to slugs/titles
 * for guaranteed uniqueness across parallel test runs.
 */

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

export interface UserSettingsData {
  username: string;
  email: string;
  bio: string;
  password: string;
}

/** Generate a full article payload with random content. */
export function generateArticle(overrides?: Partial<ArticleData>): ArticleData {
  const timestamp = Date.now();
  return {
    title: `${faker.lorem.words(3)} — ${timestamp}`,
    description: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
    tagList: [faker.lorem.word(), faker.lorem.word()],
    ...overrides,
  };
}

/** Generate a short article title (for boundary testing). */
export function generateShortTitle(): string {
  return faker.lorem.word();
}

/** Generate an excessively long title (for negative testing). */
export function generateLongTitle(maxChars = 255): string {
  return faker.lorem.sentence(50).slice(0, maxChars);
}

/** Generate a unique username within the 20-char limit. */
export function generateUsername(): string {
  // Max 20 chars — use 3-char prefix + 10-digit truncated timestamp
  const suffix = Date.now().toString().slice(-10);
  return `pw_${suffix}`;
}

/** Generate a unique email address. */
export function generateEmail(): string {
  const suffix = Date.now().toString().slice(-10);
  return `pw_${suffix}@test.io`;
}

/** Generate user settings data for the Update Settings test. */
export function generateUserSettings(overrides?: Partial<UserSettingsData>): UserSettingsData {
  return {
    username: generateUsername(),
    email: generateEmail(),
    bio: faker.lorem.sentence(),
    password: 'Updated@123!',
    ...overrides,
  };
}

/** Pick a random tag from the known Conduit tag list. */
export function getRandomExistingTag(): string {
  const tags = ['Test', 'Blog', 'Coding', 'YouTube', 'Git', 'Slack', 'Zoom', 'GitHub'];
  return tags[Math.floor(Math.random() * tags.length)];
}

/** A tag that definitely doesn't exist on the platform. */
export function getNonExistentTag(): string {
  return `no-such-tag-${Date.now()}`;
}

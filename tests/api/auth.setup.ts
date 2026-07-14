import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '../../playwright/.auth/user.json');
const API_URL = 'https://conduit-api.bondaracademy.com/api';
const APP_URL = 'https://conduit.bondaracademy.com';

/**
 * Global setup: registers a new user via the Conduit API using the
 * Playwright `request` fixture (no CORS concerns), then opens a browser
 * page to inject the JWT token into localStorage and save the full
 * authenticated browser state.
 *
 * All downstream test specs reuse this saved state via `storageState`
 * in playwright.config.ts — no per-test login required.
 */
setup('authenticate via API + persist session', async ({ request, page }) => {
  // Username max 20 chars — use short prefix + truncated timestamp
  const timestamp = Date.now().toString().slice(-10);
  const user = {
    username: `pw_${timestamp}`,
    email: `pw_${timestamp}@test.io`,
    password: 'Test@1234!',
  };

  // Step 1: Register user via API (request fixture bypasses CORS)
  const registerRes = await request.post(`${API_URL}/users`, {
    data: { user },
  });

  // The RealWorld API returns 422 for validation errors (e.g. duplicate
  // username). Log the response body so failed registrations are debuggable.
  if (registerRes.status() === 422) {
    const errorBody = await registerRes.json();
    console.error('[Setup] Registration failed:', JSON.stringify(errorBody, null, 2));
  }

  // RealWorld API returns 201 Created for user registration
  expect(registerRes.status()).toBe(201);
  const registerBody = await registerRes.json();
  const token = registerBody.user.token;
  expect(token).toBeDefined();

  // Step 2: Navigate to the app and inject the JWT token into localStorage
  await page.goto(APP_URL);
  await page.evaluate((t) => {
    localStorage.setItem('jwtToken', t);
  }, token);

  // Step 3: Persist the browser context state (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });

  console.log(`[Setup] Registered & authenticated: ${user.username}`);
  console.log(`[Setup] Session saved to: ${AUTH_FILE}`);
});

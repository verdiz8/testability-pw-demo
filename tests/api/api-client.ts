import { APIRequestContext } from '@playwright/test';

const API_URL = 'https://conduit-api.bondaracademy.com/api';

/**
 * Lightweight wrapper around the Conduit REST API.
 * Used primarily for test pre-conditions — creating articles before
 * edit/delete tests — and for any setup that needs to bypass the UI.
 */
export class ConduitClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Token ${this.token}`,
    };
  }

  /** Create an article via the API. Returns the created article's slug. */
  async createArticle(
    request: APIRequestContext,
    article: { title: string; description: string; body: string; tagList?: string[] }
  ): Promise<{ slug: string; title: string }> {
    const res = await request.post(`${API_URL}/articles`, {
      headers: this.headers(),
      data: { article },
    });
    if (!res.ok()) {
      throw new Error(`Failed to create article: ${res.status()} ${await res.text()}`);
    }
    const json = await res.json();
    return { slug: json.article.slug, title: json.article.title };
  }

  /** Delete an article by slug. */
  async deleteArticle(request: APIRequestContext, slug: string): Promise<void> {
    const res = await request.delete(`${API_URL}/articles/${slug}`, {
      headers: this.headers(),
    });
    if (!res.ok()) {
      throw new Error(`Failed to delete article '${slug}': ${res.status()}`);
    }
  }

  /** Get an article by slug. */
  async getArticle(
    request: APIRequestContext,
    slug: string
  ): Promise<Record<string, unknown> | null> {
    const res = await request.get(`${API_URL}/articles/${slug}`);
    if (res.status() === 404) return null;
    if (!res.ok()) {
      throw new Error(`Failed to fetch article: ${res.status()}`);
    }
    const json = await res.json();
    return json.article;
  }

  /** Update current user's settings. */
  async updateUser(
    request: APIRequestContext,
    updates: { email?: string; username?: string; bio?: string; image?: string; password?: string }
  ): Promise<Record<string, unknown>> {
    const res = await request.put(`${API_URL}/user`, {
      headers: this.headers(),
      data: { user: updates },
    });
    if (!res.ok()) {
      throw new Error(`Failed to update user: ${res.status()} ${await res.text()}`);
    }
    const json = await res.json();
    return json.user;
  }
}

/**
 * Read the auth token from the saved storageState JSON file.
 * This token is used to construct API clients for pre-condition setup.
 */
export function getTokenFromState(): string | null {
  try {
    const fs = require('fs');
    const path = require('path');
    const statePath = path.join(__dirname, '../../playwright/.auth/user.json');

    if (!fs.existsSync(statePath)) {
      return null;
    }

    const raw = fs.readFileSync(statePath, 'utf-8');
    const state = JSON.parse(raw);

    // The JWT token is stored in localStorage under 'jwtToken'
    for (const origin of state.origins || []) {
      for (const item of origin.localStorage || []) {
        if (item.name === 'jwtToken') {
          return item.value;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

# Design Decisions

A record of key architectural and testing strategy decisions made during the development of this Playwright test framework for [Conduit](https://conduit.bondaracademy.com/).

---

## 1. Authentication: Session Reuse via `storageState`

### Decision
Authenticate once via Playwright's global setup and persist the session using `storageState`. All test specs reuse this saved state — no per-test login.

### Rationale
- **Efficiency:** Logging in before every test repeats a slow, non-deterministic UI flow. One auth setup reduces execution time significantly.
- **Reliability:** Single point of auth failure isolates issues — if login breaks, it fails once in setup, not N times across specs.
- **Industry Standard:** The Playwright docs themselves [recommend this approach](https://playwright.dev/docs/auth#basic-shared-account-in-all-tests) for tests that require a shared authenticated state.
- **Focus:** The assignment's required scenarios (Create/Edit/Delete Article, Filter by Tag, Update Settings) are feature-focused. Auth is infrastructure, not a test scenario. Adding sign-up/sign-in tests would dilute coverage on the core scenarios.

### Trade-off
We don't have explicit test coverage of the sign-up and sign-in flows. If the auth UI breaks, our global setup catches it — but individual edge cases (duplicate email, weak password) are not covered. For a take-home assignment, this keeps the scope tight and focused on the explicitly requested scenarios.

---

## 2. Page Object Models (POM)

### Decision
Each page/view gets its own class in `tests/pages/` that encapsulates locators and actions. Tests in `tests/specs/` call page objects — they never touch raw locators.

### Rationale
- **Maintainability:** If the app's structure changes, locators are updated in one place.
- **Readability:** Tests read as intent: `articlePage.fillForm({ title, body })` rather than `page.fill('[data-testid=title]', ...)`.
- **Scalability:** As the suite grows, page objects can be composed and extended without duplicating logic.

### Structure
```
tests/
├── pages/         # POMs — one class per page/view
├── specs/         # Test specs — one file per scenario
├── api/           # API helpers for pre-conditions
utils/             # Shared utilities (data generators, config)
```

---

## 3. API-Driven Pre-Conditions

### Decision
For Edit Article and Delete Article tests, the target article is created via a REST API call in a `test.beforeEach` hook — not via the UI.

### Rationale
- **Test Isolation:** Each test starts from a known, deterministic state.
- **Speed:** API calls are sub-second vs multi-second UI flows.
- **Test What Matters:** The Edit test validates the *edit* flow, not the create flow. Confounding the two muddies failure diagnosis.

### How
A utility in `tests/api/` wraps the Conduit API (`https://conduit-api.bondaracademy.com/api`). Authenticated requests carry the JWT token obtained during global setup.

---

## 4. Locator Strategy

### Decision
Prefer Playwright's built-in locator chains with role-based and text-based selectors over brittle CSS/XPath paths.

### Priority Order
1. **Role-based:** `page.getByRole('button', { name: 'Publish Article' })`
2. **Text-based:** `page.getByText('New Article')`
3. **Placeholder:** `page.getByPlaceholder('Article Title')`
4. **CSS fallback:** `page.locator('.article-content')` (only when the above don't apply)

### Rationale
- Role/text selectors are resilient to CSS class changes and DOM restructuring.
- They mirror how users interact with the page — a hallmark of good E2E tests.
- The Conduit app uses semantic HTML (forms, buttons, inputs) which maps well to role-based selection.

---

## 5. Test Data: Dynamic & Randomized

### Decision
Use `@faker-js/faker` to generate unique test data (article titles, descriptions, body text, user details) per test run rather than hard-coded strings.

### Rationale
- **Uniqueness:** Avoids accidental test coupling through shared data.
- **Coverage:** Randomized inputs surface edge cases (special characters, lengths) that static data would miss.
- **Cleanup:** Unique article slugs mean delete tests won't collide with leftover state from prior runs.

### Example
```typescript
const title = `Test Article — ${faker.lorem.words(3)} ${Date.now()}`;
```

---

## 6. Reporting: Allure + Playwright HTML

### Decision
Dual reporters:
- **Allure** for CI-friendly, structured dashboards with trends and history
- **Playwright HTML** for local development with embedded screenshots/traces

### Rationale
- Allure integrates well with CI pipelines and produces shareable reports.
- Playwright's built-in HTML reporter is zero-config and excellent for debugging.

---

## 7. Traceability: Screenshots, Traces, Video on Failure

### Decision
- `screenshot: 'only-on-failure'` — captures the page at the moment of failure
- `trace: 'on-first-retry'` — Playwright trace is a debuggable replay of the test
- `video: 'retain-on-failure'` — video recording of the failed test session

### Rationale
Flaky failures are the hardest to debug. Having multiple artifacts (screenshot + trace + video) gives the team everything needed to reproduce and fix without re-running.

---

## 8. Cross-Browser Testing

### Decision
Configure three browser projects: Chromium, Firefox, and WebKit. Run Chromium as the default; Firefox/WebKit as optional CI matrix.

### Rationale
- The Conduit app is a standard web application that users access from any modern browser.
- Chromium covers the majority of real-world users, but cross-browser parity is table-stakes for a professional QA framework.
- WebKit covers Safari users (important for a reading platform).

---

## 9. Parallel Execution

### Decision
Enable worker-level parallelism (up to 4 workers) via `playwright.config.ts`. Each worker gets its own browser context.

### Rationale
- As the suite grows, parallel execution keeps CI run times manageable.
- Playwright's worker isolation means no shared state between workers.
- 4 workers is a safe default for CI runners without overwhelming resources.

---

## 10. CI/CD: GitHub Actions

### Decision
A single workflow (`.github/workflows/playwright.yml`) that:
- Triggers on `push` and `pull_request` to `main`
- Runs on Ubuntu with a matrix of Chromium, Firefox, WebKit
- Uploads Allure reports as artifacts

### Rationale
- GitHub Actions is free for public repos and tightly integrated — no external CI setup.
- Matrix strategy gives cross-browser coverage in a single workflow.
- Report uploads mean failures are debuggable without re-running locally.

---

## Out of Scope (Intentionally)

| Item | Reason |
|---|---|
| **Sign-up / Sign-in test specs** | Auth is infrastructure (session management), not a requested scenario. See §1. |
| **Article comments** | Not in the assignment requirements. |
| **User profiles / following** | Not in the assignment requirements. |
| **Pagination** | Implicitly covered by feed tests but not a standalone scenario. |
| **Performance / load testing** | Out of scope for a functional E2E framework. |

---

*Last updated: 2026-07-14*

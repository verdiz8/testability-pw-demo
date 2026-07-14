# testability-pw-demo

[![Playwright E2E Tests](https://github.com/verdiz8/testability-pw-demo/actions/workflows/playwright.yml/badge.svg)](https://github.com/verdiz8/testability-pw-demo/actions/workflows/playwright.yml)

Playwright E2E test automation framework for **Conduit** — a RealWorld blogging platform by [Bondar Academy](https://conduit.bondaracademy.com/).

## 📋 Test Scenarios

| # | Scenario | Positive | Negative |
|---|---|---|---|
| 1 | Create New Article | ✅ | ✅ |
| 2 | Edit Article (API pre-condition) | ✅ | ✅ |
| 3 | Delete Article (API pre-condition) | ✅ | ✅ |
| 4 | Filter Articles by Tag | ✅ | ✅ |
| 5 | Update User Settings | ✅ | ✅ |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Run with headed browser
npm run test:headed

# View HTML report
npm run report
```

## 📁 Project Structure

```
├── tests/
│   ├── pages/        # Page Object Models
│   ├── specs/        # Test specifications
│   └── api/          # API helpers (pre-conditions)
├── utils/            # Shared utilities (data generation)
├── playwright.config.ts
├── DESIGN_DECISIONS.md
└── tsconfig.json
```

## ⚙️ Tech Stack

- **Framework:** Playwright + TypeScript
- **Test Data:** @faker-js/faker
- **Reporting:** Allure + Playwright HTML
- **CI/CD:** GitHub Actions
- **Target Browsers:** Chromium, Firefox, WebKit

## 📊 Reports

```bash
# Playwright HTML report
npm run report

# Allure report
npm run report:allure
```

## 🔧 CI/CD

Tests run automatically on push/PR to `main` via GitHub Actions. The workflow runs across Chromium, Firefox, and WebKit and uploads Allure reports as artifacts.

## 📝 Design Decisions

See [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) for rationale on architecture, session management, locator strategy, and other key choices.

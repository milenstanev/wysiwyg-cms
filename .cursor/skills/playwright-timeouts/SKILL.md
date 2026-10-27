---
name: playwright-timeouts
description: >-
  Playwright e2e conventions for this repo: global 3000ms timeouts, and
  assign every locator to a named variable before asserting visibility.
  Use when writing or editing e2e/*.spec.ts, e2e/helpers, or playwright.config.ts.
---

# Playwright e2e conventions (wysiwyg-cms)

## Global defaults ([`playwright.config.ts`](../../../playwright.config.ts))

| Setting | Value | Purpose |
|---------|-------|---------|
| `expect.timeout` | **3000** ms | `toBeVisible`, `toHaveText`, `toHaveCount`, … |
| `use.actionTimeout` | **3000** ms | `click`, `fill`, `press`, … |
| `use.navigationTimeout` | 15000 ms | `goto` / full navigations only |
| `timeout` (test) | 30000 ms | Whole test budget — not per assertion |

## Locators: variable then visibility

Every selector used for an assertion (or reused for click/fill) must be assigned to a named `const` first. Then assert visibility on that variable (global 3000ms — no per-call timeout).

### Do

```ts
const bannerTitle = page.getByText("Banner title");
await expect(bannerTitle).toBeVisible();

const editorBar = page.getByTestId(TEST_ID.editorBar);
await expect(editorBar).toBeVisible();

const saveButton = page.getByRole("button", { name: /Save/i });
await expect(saveButton).toBeVisible();
await saveButton.click();
```

### Do not

```ts
// Inline locator in expect — extract to a variable first
await expect(page.getByText("Banner title")).toBeVisible();
await expect(page.getByTestId(TEST_ID.editorBar)).toBeVisible();

// Per-call timeouts — use the global 3000ms expect timeout instead
await expect(locator).toBeVisible({ timeout: 10000 });
await expect(locator).toBeVisible({ timeout: 5000 });
await button.click({ timeout: 10000 });
```

Name variables after what they represent (`bannerTitle`, `editorBar`, `saveButton`), not generic names like `el` or `loc` unless the locator is truly ephemeral in a tiny helper.

## Timeout exceptions

- Prefer fixing flaky waits (proper selectors, `?edit=1`, network idle) over raising timeouts.
- Only override with an explicit `{ timeout: N }` when the step is intentionally slow (rare); document why in a one-line comment.
- Never use `timeout: 10000` or higher on visibility asserts.

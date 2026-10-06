import { test, expect } from "@playwright/test";

/**
 * E2E: Block settings button must be clickable and panel must open.
 * These tests FAIL if: settings button doesn't show, doesn't receive click, or panel doesn't appear.
 */

function addBlockMain(page: import("@playwright/test").Page) {
  return page
    .getByRole("button", { name: /Add block \(main\)/i })
    .scrollIntoViewIfNeeded()
    .then((b) => b.click({ force: true }));
}

test.describe("Block settings button is clickable and panel opens", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: /Choose layout/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test("Block settings button is visible after hover and click opens panel", async ({ page }) => {
    await addBlockMain(page);
    await page.getByRole("button", { name: "Table" }).click();
    await expect(page.getByText("Header 1")).toBeVisible({ timeout: 3000 });

    const tableBlock = page.getByTestId("content-block").filter({ hasText: "Header 1" }).first();
    await tableBlock.hover();
    await page.waitForTimeout(150);
    const settingsBtn = tableBlock.getByRole("button", { name: "Block settings" });
    await expect(settingsBtn).toBeVisible({ timeout: 2000 });
    await settingsBtn.click();

    await expect(page.getByLabel(/Table caption/i)).toBeVisible({ timeout: 3000 });
  });

  test("Block settings by role and name (gear) opens panel with form fields", async ({ page }) => {
    await addBlockMain(page);
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByRole("heading", { name: "New heading" })).toBeVisible({ timeout: 3000 });

    const headingBlock = page
      .getByTestId("content-block")
      .filter({ hasText: "New heading" })
      .first();
    await headingBlock.hover();
    await page.waitForTimeout(150);
    await headingBlock.getByRole("button", { name: "Block settings" }).click();

    await expect(page.getByLabel(/Heading level/i)).toBeVisible({ timeout: 3000 });
  });

  test("table: set caption in settings, save, caption persists after reload", async ({ page }) => {
    await addBlockMain(page);
    await page.getByRole("button", { name: "Table" }).click();
    await expect(page.getByText("Header 1")).toBeVisible({ timeout: 3000 });

    const tableBlock = page.getByTestId("content-block").filter({ hasText: "Header 1" }).first();
    await tableBlock.hover();
    await page.waitForTimeout(150);
    await tableBlock.getByRole("button", { name: "Block settings" }).click();

    await expect(page.getByLabel(/Table caption/i)).toBeVisible({ timeout: 3000 });
    await page.getByLabel(/Table caption/i).fill("E2E Table Caption");
    await page.getByRole("button", { name: /Close/i }).click();

    await expect(page.getByText("E2E Table Caption")).toBeVisible({ timeout: 2000 });

    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });

    await page.reload();
    await expect(page.getByText("E2E Table Caption")).toBeVisible({ timeout: 5000 });
    const caption = page.locator("caption").filter({ hasText: "E2E Table Caption" });
    await expect(caption).toBeVisible();
  });

  test("table: toggle Striped rows in settings, setting is applied", async ({ page }) => {
    await addBlockMain(page);
    await page.getByRole("button", { name: "Table" }).click();
    await expect(page.getByText("Header 1")).toBeVisible({ timeout: 3000 });

    const tableBlock = page.getByTestId("content-block").filter({ hasText: "Header 1" }).first();
    await tableBlock.hover();
    await page.waitForTimeout(150);
    await tableBlock.getByRole("button", { name: "Block settings" }).click();

    const stripedCheckbox = page.getByRole("checkbox", { name: /Striped rows/i });
    await expect(stripedCheckbox).toBeVisible();
    await stripedCheckbox.check();

    await page.getByRole("button", { name: /Close/i }).click();

    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });

    await page.reload();
    const table = page.locator("table").filter({ hasText: "Header 1" }).first();
    await expect(table).toBeVisible();
    const tbody = table.locator("tbody tr").first();
    await expect(tbody).toHaveClass(/even:bg/);
  });

  test("heading: change level to H2 in settings, save, heading is h2 after reload", async ({
    page,
  }) => {
    await addBlockMain(page);
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByRole("heading", { name: "New heading" })).toBeVisible({ timeout: 3000 });

    const headingBlock = page
      .getByTestId("content-block")
      .filter({ hasText: "New heading" })
      .first();
    await headingBlock.hover();
    await page.waitForTimeout(150);
    await headingBlock.getByRole("button", { name: "Block settings" }).click();

    await page.getByLabel(/Heading level/i).selectOption("2");
    await page.getByRole("button", { name: /Close/i }).click();

    const h2 = page.getByRole("heading", { name: "New heading", level: 2 });
    await expect(h2).toBeVisible({ timeout: 2000 });

    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });

    await page.reload();
    await expect(page.locator("h2").filter({ hasText: "New heading" })).toBeVisible();
  });
});

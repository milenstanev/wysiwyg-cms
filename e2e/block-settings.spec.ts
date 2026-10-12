import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";

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
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
  });

  test("Block settings button is visible after hover and click opens panel", async ({ page }) => {
    await addBlockMain(page);
    const table = page.getByRole("button", { name: "Table" });
    await expect(table).toBeVisible();
    await table.click();
    const header1 = page.getByText("Header 1");
    await expect(header1).toBeVisible();

    const tableBlock = page.getByTestId(TEST_ID.contentBlock).filter({ hasText: "Header 1" }).first();
    await tableBlock.hover();
    await page.waitForTimeout(150);
    const settingsBtn = tableBlock.getByRole("button", { name: "Block settings" });
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    const tableCaption = page.getByLabel(/Table caption/i);
    await expect(tableCaption).toBeVisible();
  });

  test("Block settings by role and name (gear) opens panel with form fields", async ({ page }) => {
    await addBlockMain(page);
    const heading = page.getByRole("button", { name: "Heading" });
    await expect(heading).toBeVisible();
    await heading.click();
    const newHeading = page.getByRole("heading", { name: "New heading" });
    await expect(newHeading).toBeVisible();

    const headingBlock = page
      .getByTestId(TEST_ID.contentBlock)
      .filter({ hasText: "New heading" })
      .first();
    await headingBlock.hover();
    await page.waitForTimeout(150);
    const blockSettings = headingBlock.getByRole("button", { name: "Block settings" });
    await expect(blockSettings).toBeVisible();
    await blockSettings.click();

    const headingLevel = page.getByLabel(/Heading level/i);
    await expect(headingLevel).toBeVisible();
  });

  test("table: set caption in settings, save, caption persists after reload", async ({ page }) => {
    await addBlockMain(page);
    const table = page.getByRole("button", { name: "Table" });
    await expect(table).toBeVisible();
    await table.click();
    const header1 = page.getByText("Header 1");
    await expect(header1).toBeVisible();

    const tableBlock = page.getByTestId(TEST_ID.contentBlock).filter({ hasText: "Header 1" }).first();
    await tableBlock.hover();
    await page.waitForTimeout(150);
    const blockSettings = tableBlock.getByRole("button", { name: "Block settings" });
    await expect(blockSettings).toBeVisible();
    await blockSettings.click();

    const tableCaption = page.getByLabel(/Table caption/i);
    await expect(tableCaption).toBeVisible();
    const tableCaption2 = page.getByLabel(/Table caption/i);
    await expect(tableCaption2).toBeVisible();
    await tableCaption2.fill("E2E Table Caption");
    const close = page.getByRole("button", { name: /Close/i });
    await expect(close).toBeVisible();
    await close.click();

    const e2ETableCaption = page.getByText("E2E Table Caption");
    await expect(e2ETableCaption).toBeVisible();

    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);

    await page.reload();
    const e2ETableCaption2 = page.getByText("E2E Table Caption");
    await expect(e2ETableCaption2).toBeVisible();
    const caption = page.locator("caption").filter({ hasText: "E2E Table Caption" });
    await expect(caption).toBeVisible();
  });

  test("table: toggle Striped rows in settings, setting is applied", async ({ page }) => {
    await addBlockMain(page);
    const table = page.getByRole("button", { name: "Table" });
    await expect(table).toBeVisible();
    await table.click();
    const header1 = page.getByText("Header 1");
    await expect(header1).toBeVisible();

    const tableBlock = page.getByTestId(TEST_ID.contentBlock).filter({ hasText: "Header 1" }).first();
    await tableBlock.hover();
    await page.waitForTimeout(150);
    const blockSettings = tableBlock.getByRole("button", { name: "Block settings" });
    await expect(blockSettings).toBeVisible();
    await blockSettings.click();

    const stripedCheckbox = page.getByRole("checkbox", { name: /Striped rows/i });
    await expect(stripedCheckbox).toBeVisible();
    await stripedCheckbox.check();

    const close = page.getByRole("button", { name: /Close/i });
    await expect(close).toBeVisible();
    await close.click();

    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);

    await page.reload();
    const stripedTable = page.locator("table").filter({ hasText: "Header 1" }).first();
    await expect(stripedTable).toBeVisible();
    const firstBodyRow = stripedTable.locator("tbody tr").first();
    await expect(firstBodyRow).toHaveClass(/even:bg/);
  });

  test("heading: change level to H2 in settings, save, heading is h2 after reload", async ({
    page,
  }) => {
    await addBlockMain(page);
    const heading = page.getByRole("button", { name: "Heading" });
    await expect(heading).toBeVisible();
    await heading.click();
    const newHeading = page.getByRole("heading", { name: "New heading" });
    await expect(newHeading).toBeVisible();

    const headingBlock = page
      .getByTestId(TEST_ID.contentBlock)
      .filter({ hasText: "New heading" })
      .first();
    await headingBlock.hover();
    await page.waitForTimeout(150);
    const blockSettings = headingBlock.getByRole("button", { name: "Block settings" });
    await expect(blockSettings).toBeVisible();
    await blockSettings.click();

    const headingLevel = page.getByLabel(/Heading level/i);
    await expect(headingLevel).toBeVisible();
    await headingLevel.selectOption("2");
    const close = page.getByRole("button", { name: /Close/i });
    await expect(close).toBeVisible();
    await close.click();

    const h2 = page.getByRole("heading", { name: "New heading", level: 2 });
    await expect(h2).toBeVisible();

    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);

    await page.reload();
    const headingAsH2 = page.locator("h2").filter({ hasText: "New heading" });
    await expect(headingAsH2).toBeVisible();
  });
});

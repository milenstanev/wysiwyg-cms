import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";

/**
 * E2E: block move up/down and remove.
 * Uses data-testid for stable selectors, getByRole/getByTitle for accessibility, scopes by block content.
 */

test.describe("Block sort and remove", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: /Choose layout/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test("move block up: second block moves above first, order persists after save", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByRole("heading", { name: "New heading" })).toBeVisible({ timeout: 3000 });

    const firstHeading = page.getByRole("heading", { name: "Hello from the CMS" }).first();
    await firstHeading.click({ clickCount: 3 });
    await page.keyboard.type("First block");
    await expect(page.getByText("First block").first()).toBeVisible();

    const newHeading = page.getByRole("heading", { name: "New heading" }).first();
    await newHeading.click({ clickCount: 3 });
    await page.keyboard.type("Second block");
    await expect(page.getByText("Second block").first()).toBeVisible();

    const blocks = page.getByTestId(TEST_ID.contentBlock);
    await expect(blocks.first()).toContainText("First block");
    await expect(blocks.last()).toContainText("Second block");

    const secondBlock = page
      .getByTestId(TEST_ID.blockEditUnit)
      .filter({ hasText: "Second block" })
      .first();
    await secondBlock.getByTestId(TEST_ID.blockControlsTrigger).hover();
    await secondBlock.getByTestId(TEST_ID.moveBlockUp).click();

    await expect(blocks.first()).toContainText("Second block", { timeout: 3000 });
    await expect(blocks.last()).toContainText("First block");

    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("Second block")).toBeVisible({ timeout: 5000 });
    const blocksAfter = page.getByTestId(TEST_ID.contentBlock);
    await expect(blocksAfter.first()).toContainText("Second block");
    await expect(blocksAfter.last()).toContainText("First block");
  });

  test("move block down: first block moves below second", async ({ page }) => {
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph").first()).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph")).toHaveCount(2, { timeout: 3000 });

    const blocksWithNewParagraph = page
      .getByTestId(TEST_ID.contentBlock)
      .filter({ hasText: "New paragraph" });
    await blocksWithNewParagraph.first().locator("p").first().fill("Top paragraph");
    await blocksWithNewParagraph.last().locator("p").first().fill("Bottom paragraph");

    await expect(blocksWithNewParagraph.first()).toContainText("Top paragraph");
    await expect(blocksWithNewParagraph.last()).toContainText("Bottom paragraph");

    const topBlock = page.getByTestId(TEST_ID.blockEditUnit).filter({ hasText: "Top paragraph" }).first();
    await topBlock.getByTestId(TEST_ID.blockControlsTrigger).hover();
    await topBlock.getByTestId(TEST_ID.moveBlockDown).click();

    const twoParagraphBlocks = page
      .getByTestId(TEST_ID.contentBlock)
      .filter({ hasText: /Top paragraph|Bottom paragraph/ });
    await expect(twoParagraphBlocks.first()).toContainText("Bottom paragraph", { timeout: 3000 });
    await expect(twoParagraphBlocks.last()).toContainText("Top paragraph");
  });

  test("remove block: click remove, block disappears and save persists", async ({ page }) => {
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByRole("heading", { name: "New heading" }).first()).toBeVisible({
      timeout: 3000,
    });
    const newHeading = page.getByRole("heading", { name: "New heading" }).first();
    await newHeading.click({ clickCount: 3 });
    await page.keyboard.type("To remove");
    await expect(page.getByText("To remove").first()).toBeVisible();

    const block = page.getByTestId(TEST_ID.blockEditUnit).filter({ hasText: "To remove" }).first();
    await block.getByTestId(TEST_ID.blockControlsTrigger).hover();
    await block.getByTestId(TEST_ID.removeBlock).click();

    await expect(page.getByText("To remove")).not.toBeVisible({ timeout: 2000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("To remove")).not.toBeVisible();
  });

  test("move up only visible for block that is not first", async ({ page }) => {
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph").first()).toBeVisible({ timeout: 3000 });

    const blocks = page.locator(".layout-content-card").getByTestId(TEST_ID.blockEditUnit);
    await blocks.first().getByTestId(TEST_ID.blockControlsTrigger).hover();
    await expect(blocks.first().getByTestId(TEST_ID.moveBlockUp)).not.toBeVisible();
    await expect(blocks.first().getByTestId(TEST_ID.moveBlockDown)).toBeVisible();

    await blocks.last().getByTestId(TEST_ID.blockControlsTrigger).hover();
    await expect(blocks.last().getByTestId(TEST_ID.moveBlockUp)).toBeVisible();
    await expect(blocks.last().getByTestId(TEST_ID.moveBlockDown)).not.toBeVisible();
  });

  test("toolbar buttons are accessible by role and name (aria-label)", async ({ page }) => {
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByRole("heading", { name: "New heading" }).first()).toBeVisible({
      timeout: 3000,
    });

    const block = page.getByTestId(TEST_ID.blockEditUnit).filter({ hasText: "New heading" }).first();
    await block.getByTestId(TEST_ID.blockControlsTrigger).hover();

    await expect(block.getByRole("button", { name: "Move up" })).toBeVisible();
    await expect(block.getByRole("button", { name: "Move down" })).toBeVisible();
    await expect(block.getByRole("button", { name: "Remove block" })).toBeVisible();
  });

  test("block settings button is accessible by role and name", async ({ page }) => {
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Table" }).click();
    await expect(page.getByText("Header 1")).toBeVisible({ timeout: 3000 });

    const tableBlock = page.getByTestId(TEST_ID.blockEditUnit).filter({ hasText: "Header 1" }).first();
    await tableBlock.getByTestId(TEST_ID.blockControlsTrigger).hover();

    await expect(tableBlock.getByRole("button", { name: "Block settings" })).toBeVisible();
  });
});

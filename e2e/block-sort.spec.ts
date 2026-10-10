import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";

/**
 * E2E: block move up/down and remove.
 * Uses data-testid for stable selectors, getByRole/getByTitle for accessibility, scopes by block content.
 */

test.describe("Block sort and remove", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const chooseLayoutButton = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayoutButton).toBeVisible();
  });

  test("move block up: second block moves above first, order persists after save", async ({
    page,
  }) => {
    const addButton = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    const headingButton = page.getByRole("button", { name: "Heading" });
    await expect(headingButton).toBeVisible();
    await headingButton.click();
    const newHeading = page.getByRole("heading", { name: "New heading" });
    await expect(newHeading).toBeVisible();

    const firstHeading = page.getByRole("heading", { name: "Hello from the CMS" }).first();
    await expect(firstHeading).toBeVisible();
    await firstHeading.click({ clickCount: 3 });
    await page.keyboard.type("First block");
    const firstBlockText = page.getByText("First block").first();
    await expect(firstBlockText).toBeVisible();

    const newHeadingEditable = page.getByRole("heading", { name: "New heading" }).first();
    await expect(newHeadingEditable).toBeVisible();
    await newHeadingEditable.click({ clickCount: 3 });
    await page.keyboard.type("Second block");
    const secondBlockText = page.getByText("Second block").first();
    await expect(secondBlockText).toBeVisible();

    const blocks = page.getByTestId(TEST_ID.contentBlock);
    const firstContentBlock = blocks.first();
    const lastContentBlock = blocks.last();
    await expect(firstContentBlock).toContainText("First block");
    await expect(lastContentBlock).toContainText("Second block");

    const secondBlockUnit = page
      .getByTestId(TEST_ID.blockEditUnit)
      .filter({ hasText: "Second block" })
      .first();
    const secondBlockTrigger = secondBlockUnit.getByTestId(TEST_ID.blockControlsTrigger);
    await expect(secondBlockTrigger).toBeVisible();
    await secondBlockTrigger.hover();
    const moveUpButton = secondBlockUnit.getByTestId(TEST_ID.moveBlockUp);
    await expect(moveUpButton).toBeVisible();
    await moveUpButton.click();

    await expect(firstContentBlock).toContainText("Second block");
    await expect(lastContentBlock).toContainText("First block");

    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.reload();
    await expect(secondBlockText).toBeVisible();
    const blocksAfter = page.getByTestId(TEST_ID.contentBlock);
    const firstAfter = blocksAfter.first();
    const lastAfter = blocksAfter.last();
    await expect(firstAfter).toContainText("Second block");
    await expect(lastAfter).toContainText("First block");
  });

  test("move block down: first block moves below second", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    const paragraphButton = page.getByRole("button", { name: "Paragraph" });
    await expect(paragraphButton).toBeVisible();
    await paragraphButton.click();
    const firstNewParagraph = page.getByText("New paragraph").first();
    await expect(firstNewParagraph).toBeVisible();
    await expect(addButton).toBeVisible();
    await addButton.click();
    await expect(paragraphButton).toBeVisible();
    await paragraphButton.click();
    const newParagraphs = page.getByText("New paragraph");
    await expect(newParagraphs).toHaveCount(2);

    const blocksWithNewParagraph = page
      .getByTestId(TEST_ID.contentBlock)
      .filter({ hasText: "New paragraph" });
    const topParagraphField = blocksWithNewParagraph.first().locator("p").first();
    const bottomParagraphField = blocksWithNewParagraph.last().locator("p").first();
    await expect(topParagraphField).toBeVisible();
    await topParagraphField.fill("Top paragraph");
    await expect(bottomParagraphField).toBeVisible();
    await bottomParagraphField.fill("Bottom paragraph");

    const topParagraphBlock = blocksWithNewParagraph.first();
    const bottomParagraphBlock = blocksWithNewParagraph.last();
    await expect(topParagraphBlock).toContainText("Top paragraph");
    await expect(bottomParagraphBlock).toContainText("Bottom paragraph");

    const topBlock = page.getByTestId(TEST_ID.blockEditUnit).filter({ hasText: "Top paragraph" }).first();
    const topBlockTrigger = topBlock.getByTestId(TEST_ID.blockControlsTrigger);
    await expect(topBlockTrigger).toBeVisible();
    await topBlockTrigger.hover();
    const moveDownButton = topBlock.getByTestId(TEST_ID.moveBlockDown);
    await expect(moveDownButton).toBeVisible();
    await moveDownButton.click();

    const twoParagraphBlocks = page
      .getByTestId(TEST_ID.contentBlock)
      .filter({ hasText: /Top paragraph|Bottom paragraph/ });
    const firstTwo = twoParagraphBlocks.first();
    const lastTwo = twoParagraphBlocks.last();
    await expect(firstTwo).toContainText("Bottom paragraph");
    await expect(lastTwo).toContainText("Top paragraph");
  });

  test("remove block: click remove, block disappears and save persists", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    const headingButton = page.getByRole("button", { name: "Heading" });
    await expect(headingButton).toBeVisible();
    await headingButton.click();
    const newHeading = page.getByRole("heading", { name: "New heading" }).first();
    await expect(newHeading).toBeVisible();
    await newHeading.click({ clickCount: 3 });
    await page.keyboard.type("To remove");
    const toRemove = page.getByText("To remove").first();
    await expect(toRemove).toBeVisible();

    const block = page.getByTestId(TEST_ID.blockEditUnit).filter({ hasText: "To remove" }).first();
    const blockTrigger = block.getByTestId(TEST_ID.blockControlsTrigger);
    await expect(blockTrigger).toBeVisible();
    await blockTrigger.hover();
    const removeButton = block.getByTestId(TEST_ID.removeBlock);
    await expect(removeButton).toBeVisible();
    await removeButton.click();

    const toRemoveGone = page.getByText("To remove");
    await expect(toRemoveGone).not.toBeVisible();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.reload();
    await expect(toRemoveGone).not.toBeVisible();
  });

  test("move up only visible for block that is not first", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    const paragraphButton = page.getByRole("button", { name: "Paragraph" });
    await expect(paragraphButton).toBeVisible();
    await paragraphButton.click();
    const newParagraph = page.getByText("New paragraph").first();
    await expect(newParagraph).toBeVisible();

    const blocks = page.locator(".layout-content-card").getByTestId(TEST_ID.blockEditUnit);
    const firstBlock = blocks.first();
    const lastBlock = blocks.last();
    const firstTrigger = firstBlock.getByTestId(TEST_ID.blockControlsTrigger);
    await expect(firstTrigger).toBeVisible();
    await firstTrigger.hover();
    const firstMoveUp = firstBlock.getByTestId(TEST_ID.moveBlockUp);
    const firstMoveDown = firstBlock.getByTestId(TEST_ID.moveBlockDown);
    await expect(firstMoveUp).not.toBeVisible();
    await expect(firstMoveDown).toBeVisible();

    const lastTrigger = lastBlock.getByTestId(TEST_ID.blockControlsTrigger);
    await expect(lastTrigger).toBeVisible();
    await lastTrigger.hover();
    const lastMoveUp = lastBlock.getByTestId(TEST_ID.moveBlockUp);
    const lastMoveDown = lastBlock.getByTestId(TEST_ID.moveBlockDown);
    await expect(lastMoveUp).toBeVisible();
    await expect(lastMoveDown).not.toBeVisible();
  });

  test("toolbar buttons are accessible by role and name (aria-label)", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    const headingButton = page.getByRole("button", { name: "Heading" });
    await expect(headingButton).toBeVisible();
    await headingButton.click();
    const newHeading = page.getByRole("heading", { name: "New heading" }).first();
    await expect(newHeading).toBeVisible();

    const block = page.getByTestId(TEST_ID.blockEditUnit).filter({ hasText: "New heading" }).first();
    const blockTrigger = block.getByTestId(TEST_ID.blockControlsTrigger);
    await expect(blockTrigger).toBeVisible();
    await blockTrigger.hover();

    const moveUpButton = block.getByRole("button", { name: "Move up" });
    const moveDownButton = block.getByRole("button", { name: "Move down" });
    const removeBlockButton = block.getByRole("button", { name: "Remove block" });
    await expect(moveUpButton).toBeVisible();
    await expect(moveDownButton).toBeVisible();
    await expect(removeBlockButton).toBeVisible();
  });

  test("block settings button is accessible by role and name", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    const tableButton = page.getByRole("button", { name: "Table" });
    await expect(tableButton).toBeVisible();
    await tableButton.click();
    const header1 = page.getByText("Header 1");
    await expect(header1).toBeVisible();

    const tableBlock = page.getByTestId(TEST_ID.blockEditUnit).filter({ hasText: "Header 1" }).first();
    const tableBlockTrigger = tableBlock.getByTestId(TEST_ID.blockControlsTrigger);
    await expect(tableBlockTrigger).toBeVisible();
    await tableBlockTrigger.hover();

    const blockSettingsButton = tableBlock.getByRole("button", { name: "Block settings" });
    await expect(blockSettingsButton).toBeVisible();
  });
});

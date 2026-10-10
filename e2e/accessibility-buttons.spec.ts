import { test, expect, type Page } from "@playwright/test";
import { TEST_ID, testIdSelector } from "../src/lib/test-ids";

/**
 * E2E: Edit buttons and toolbar must be accessible. These tests FAIL if:
 * - Edit this page is not visible, not focusable, or covered
 * - Save/Cancel/layout are not findable by role and name in edit mode
 * - Block toolbar is not visible when block has focus (keyboard) or on hover
 */

function getEditButton(page: Page) {
  return page.getByRole("button", { name: /Edit this page/i });
}

test.describe("Edit button is accessible", () => {
  test("Edit this page is visible and enabled", async ({ page }) => {
    await page.goto("/");
    const editBtn = getEditButton(page);
    await expect(editBtn).toBeVisible();
    await expect(editBtn).toBeEnabled();
  });

  test("Edit this page is focusable and receives focus", async ({ page }) => {
    await page.goto("/");
    const editBtn = getEditButton(page);
    await expect(editBtn).toBeVisible();
    await editBtn.focus();
    const focusedIsEdit = await page.evaluate((editId) => {
      const el = document.activeElement;
      return (
        el?.getAttribute("data-testid") === editId ||
        el?.textContent?.includes("Edit this page")
      );
    }, TEST_ID.editPageButton);
    expect(focusedIsEdit, "Edit button must receive focus when focused").toBe(true);
  });

  test("Edit this page is not covered by another element (clickable)", async ({ page }) => {
    await page.goto("/");
    const editBtn = getEditButton(page);
    await expect(editBtn).toBeVisible();
    const box = await editBtn.boundingBox();
    expect(box, "Edit button must have a bounding box").not.toBeNull();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      const topElement = await page.evaluate(
        ({ x, y, sel }) => {
          const el = document.elementFromPoint(x, y);
          return (
            el?.closest(sel) != null || el?.textContent?.includes("Edit this page")
          );
        },
        { x: centerX, y: centerY, sel: testIdSelector(TEST_ID.editPageButton) }
      );
      expect(topElement, "Edit button must not be covered at its center (elementFromPoint)").toBe(
        true
      );
    }
  });

  test("Edit this page click enters edit mode and Save/Cancel are visible", async ({ page }) => {
    await page.goto("/");
    const editPageButton = getEditButton(page);
    await expect(editPageButton).toBeVisible();
    await editPageButton.click();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    const cancelButton = page.getByRole("button", { name: /Cancel/i });
    await expect(cancelButton).toBeVisible();
  });
});

test.describe("Edit mode buttons are accessible", () => {
  test("Save and Cancel are findable by role and name and enabled", async ({ page }) => {
    await page.goto("/?edit=1");
    const saveBtn = page.getByRole("button", { name: /Save/i });
    const cancelBtn = page.getByRole("button", { name: /Cancel/i });
    await expect(saveBtn).toBeVisible();
    await expect(cancelBtn).toBeVisible();
    await expect(saveBtn).toBeEnabled();
    await expect(cancelBtn).toBeEnabled();
  });

  test("Layout dropdown and options are findable by role and name", async ({ page }) => {
    await page.goto("/?edit=1");
    const layoutBtn = page.getByRole("button", { name: /Choose layout/i });
    await expect(layoutBtn).toBeVisible();
    await layoutBtn.click();
    const singleButton = page.getByRole("button", { name: "Single column" });
    await expect(singleButton).toBeVisible();
    const twoButton = page.getByRole("button", { name: "Two columns" });
    await expect(twoButton).toBeVisible();
    const threeButton = page.getByRole("button", { name: "Three columns" });
    await expect(threeButton).toBeVisible();
  });

  test("Add block (main) and block type options are findable", async ({ page }) => {
    await page.goto("/?edit=1");
    const addBlock = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addBlock).toBeVisible();
    await addBlock.click();
    const headingButton = page.getByRole("button", { name: "Heading" });
    await expect(headingButton).toBeVisible();
    const paragraphButton = page.getByRole("button", { name: "Paragraph" });
    await expect(paragraphButton).toBeVisible();
  });
});

/** Block controls live in an overlay popover on the block unit, opened from the "Block actions" chip. */
function mainBlockUnits(page: Page) {
  return page.locator(`.layout-content-card ${testIdSelector(TEST_ID.blockEditUnit)}`);
}

test.describe("Block toolbar is accessible", () => {
  test("Move down and Remove block visible after hovering the block actions chip (mouse)", async ({
    page,
  }) => {
    await page.goto("/?edit=1");
    const unit = mainBlockUnits(page).first();
    await expect(unit).toBeVisible();
    const blockActions = unit.getByRole("button", { name: "Block actions" });
    await expect(blockActions).toBeVisible();
    await blockActions.hover();
    const moveDownButton = unit.getByRole("button", { name: "Move down" });
    const removeBlockButton = unit.getByRole("button", { name: "Remove block" });
    await expect(moveDownButton).toBeVisible();
    await expect(removeBlockButton).toBeVisible();
  });

  test("Block toolbar opens when the chip has keyboard focus (focus-within) and Remove block is enabled", async ({
    page,
  }) => {
    await page.goto("/?edit=1");
    const unit = mainBlockUnits(page).first();
    await expect(unit).toBeVisible();
    await unit.getByRole("button", { name: "Block actions" }).focus();
    const removeBtn = unit.getByRole("button", { name: "Remove block" });
    await expect(removeBtn).toBeVisible();
    await expect(removeBtn).toBeEnabled();
  });

  test("Block settings findable for a new table block from its chip", async ({ page }) => {
    await page.goto("/?edit=1");
    const addButton = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    const tableButton = page.getByRole("button", { name: "Table" });
    await expect(tableButton).toBeVisible();
    await tableButton.click();
    const header1 = page.getByText("Header 1");
    await expect(header1).toBeVisible();
    const tableUnit = mainBlockUnits(page).filter({ hasText: "Header 1" }).first();
    const blockActions = tableUnit.getByRole("button", { name: "Block actions" });
    await expect(blockActions).toBeVisible();
    await blockActions.hover();
    const blockSettingsButton = tableUnit.getByRole("button", { name: "Block settings" });
    await expect(blockSettingsButton).toBeVisible();
  });
});

test.describe("Keyboard activation", () => {
  test("Enter on focused Edit this page activates edit mode", async ({ page }) => {
    await page.goto("/");
    const editBtn = getEditButton(page);
    await expect(editBtn).toBeVisible();
    await editBtn.focus();
    await page.keyboard.press("Enter");
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
  });

  test("Enter on focused Cancel exits edit mode", async ({ page }) => {
    await page.goto("/?edit=1");
    const cancelButton = page.getByRole("button", { name: /Cancel/i });
    await expect(cancelButton).toBeVisible();
    await cancelButton.focus();
    await page.keyboard.press("Enter");
    const editButton = getEditButton(page);
    await expect(editButton).toBeVisible();
    await expect(cancelButton).not.toBeVisible();
  });
});

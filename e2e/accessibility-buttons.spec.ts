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
    await expect(editBtn).toBeVisible({ timeout: 10000 });
    await expect(editBtn).toBeEnabled();
  });

  test("Edit this page is focusable and receives focus", async ({ page }) => {
    await page.goto("/");
    const editBtn = getEditButton(page);
    await expect(editBtn).toBeVisible({ timeout: 10000 });
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
    await expect(editBtn).toBeVisible({ timeout: 10000 });
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
    await getEditButton(page).click();
    await expect(page.getByRole("button", { name: /Save/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /Cancel/i })).toBeVisible();
  });
});

test.describe("Edit mode buttons are accessible", () => {
  test("Save and Cancel are findable by role and name and enabled", async ({ page }) => {
    await page.goto("/?edit=1");
    const saveBtn = page.getByRole("button", { name: /Save/i });
    const cancelBtn = page.getByRole("button", { name: /Cancel/i });
    await expect(saveBtn).toBeVisible({ timeout: 10000 });
    await expect(cancelBtn).toBeVisible();
    await expect(saveBtn).toBeEnabled();
    await expect(cancelBtn).toBeEnabled();
  });

  test("Layout dropdown and options are findable by role and name", async ({ page }) => {
    await page.goto("/?edit=1");
    const layoutBtn = page.getByRole("button", { name: /Choose layout/i });
    await expect(layoutBtn).toBeVisible({ timeout: 5000 });
    await layoutBtn.click();
    await expect(page.getByRole("button", { name: "Single column" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Two columns" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Three columns" })).toBeVisible();
  });

  test("Add block (main) and block type options are findable", async ({ page }) => {
    await page.goto("/?edit=1");
    const addBlock = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addBlock).toBeVisible({ timeout: 5000 });
    await addBlock.click();
    await expect(page.getByRole("button", { name: "Heading" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Paragraph" })).toBeVisible();
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
    await expect(unit).toBeVisible({ timeout: 10000 });
    await unit.getByRole("button", { name: "Block actions" }).hover();
    await expect(unit.getByRole("button", { name: "Move down" })).toBeVisible({ timeout: 2000 });
    await expect(unit.getByRole("button", { name: "Remove block" })).toBeVisible();
  });

  test("Block toolbar opens when the chip has keyboard focus (focus-within) and Remove block is enabled", async ({
    page,
  }) => {
    await page.goto("/?edit=1");
    const unit = mainBlockUnits(page).first();
    await expect(unit).toBeVisible({ timeout: 10000 });
    await unit.getByRole("button", { name: "Block actions" }).focus();
    const removeBtn = unit.getByRole("button", { name: "Remove block" });
    await expect(removeBtn).toBeVisible({ timeout: 3000 });
    await expect(removeBtn).toBeEnabled();
  });

  test("Block settings findable for a new table block from its chip", async ({ page }) => {
    await page.goto("/?edit=1");
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Table" }).click();
    await expect(page.getByText("Header 1")).toBeVisible({ timeout: 3000 });
    const tableUnit = mainBlockUnits(page).filter({ hasText: "Header 1" }).first();
    await tableUnit.getByRole("button", { name: "Block actions" }).hover();
    await expect(tableUnit.getByRole("button", { name: "Block settings" })).toBeVisible();
  });
});

test.describe("Keyboard activation", () => {
  test("Enter on focused Edit this page activates edit mode", async ({ page }) => {
    await page.goto("/");
    const editBtn = getEditButton(page);
    await editBtn.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: /Save/i })).toBeVisible({ timeout: 5000 });
  });

  test("Enter on focused Cancel exits edit mode", async ({ page }) => {
    await page.goto("/?edit=1");
    await page.getByRole("button", { name: /Cancel/i }).focus();
    await page.keyboard.press("Enter");
    await expect(getEditButton(page)).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole("button", { name: /Cancel/i })).not.toBeVisible();
  });
});

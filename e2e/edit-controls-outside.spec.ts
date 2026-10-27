import { test, expect } from "@playwright/test";
import { TEST_ID, testIdSelector } from "../src/lib/test-ids";

/**
 * Edit chrome (toolbar, add block) must sit outside `.content-block`, not overlay the card.
 */
test.describe("Edit controls outside content wrapper", () => {
  test("block toolbar is a sibling outside content-block", async ({ page }) => {
    await page.goto("/?edit=1");
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();

    const units = page.getByTestId(TEST_ID.blockEditUnit);
    const firstUnit = units.first();
    await expect(firstUnit).toBeVisible();
    const count = await units.count();
    expect(count).toBeGreaterThan(0);

    const sels = {
      toolbar: testIdSelector(TEST_ID.blockToolbar),
      content: testIdSelector(TEST_ID.contentBlock),
    };

    for (let i = 0; i < Math.min(count, 8); i++) {
      const unit = units.nth(i);
      const outside = await unit.evaluate((el, s) => {
        const toolbar = el.querySelector(s.toolbar);
        const content = el.querySelector(s.content);
        if (!toolbar || !content) return { ok: false, reason: "missing toolbar or content" };
        return {
          ok:
            !content.contains(toolbar) &&
            !!(toolbar.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING),
          reason: content.contains(toolbar) ? "toolbar inside content-block" : "",
        };
      }, sels);
      expect(outside.ok, `unit ${i}: ${outside.reason}`).toBe(true);
    }
  });

  test("add-block slots are outside content-block", async ({ page }) => {
    await page.goto("/?edit=1");
    const firstAddSlot = page.getByTestId(TEST_ID.blockAddSlot).first();
    await expect(firstAddSlot).toBeVisible();

    const contentSel = testIdSelector(TEST_ID.contentBlock);
    const addSlots = page.getByTestId(TEST_ID.blockAddSlot);
    const nested = await addSlots.evaluateAll((slots, sel) => slots.filter((s) => s.closest(sel)).length, contentSel);
    expect(nested).toBe(0);
  });
});

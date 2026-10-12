import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";

/**
 * Content must not be clipped by a fixed-height parent, and stacked blocks must not overlap.
 * Covers BOTH view and edit mode (same content-sized stack).
 */

async function enterEditMode(page: import("@playwright/test").Page) {
  await page.goto("/");
  const editPageButton = page.getByRole("button", { name: /Edit this page/i });
  await expect(editPageButton).toBeVisible();
  await editPageButton.click();
  const saveButton = page.getByRole("button", { name: /Save/i });
  await expect(saveButton).toBeVisible();
  const blockStack = page.getByTestId(TEST_ID.blockStack).first();
  await expect(blockStack).toBeVisible();
}

/**
 * Runs in the browser. Real clipping = a clipping overflow mode hiding content, or a child box
 * spilling past the block. Glyph ink taller than the line box raises scrollHeight a few px
 * under overflow: visible — that is not clipping.
 */
function clipCheck(el: Element) {
  const body = el.querySelector(".block-body") as HTMLElement | null;
  if (!body) return { ok: false, hasFixedHeight: false, reason: "missing .block-body" };
  const block = el as HTMLElement;
  const clips = (node: HTMLElement) => getComputedStyle(node).overflowY !== "visible";
  const hidden = [block, body].find((n) => clips(n) && n.scrollHeight > n.clientHeight + 2);
  const blockBottom = block.getBoundingClientRect().bottom;
  const spill = Math.max(
    0,
    ...[...body.children].map((c) => c.getBoundingClientRect().bottom - blockBottom)
  );
  const hasFixedHeight =
    block.style.height !== "" && block.style.height !== "auto" && !block.style.height.includes("%");
  return {
    ok: !hidden && spill <= 2,
    hasFixedHeight,
    reason: hidden
      ? `content clipped (scroll=${hidden.scrollHeight} client=${hidden.clientHeight})`
      : spill > 2
        ? `child spills ${Math.round(spill)}px past the block`
        : "",
  };
}

test.describe("Content does not overlap or clip", () => {
  test("view mode: block content is not clipped by its parent", async ({ page }) => {
    await page.goto("/");
    const welcomeHeading = page.getByRole("heading", { name: "Welcome" });
    await expect(welcomeHeading).toBeVisible();

    const blocks = page.getByTestId(TEST_ID.contentBlock);
    const firstBlock = blocks.first();
    await expect(firstBlock).toBeVisible();
    const count = await blocks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const block = blocks.nth(i);
      const result = await block.evaluate(clipCheck);
      expect(result.ok, `block ${i}: ${result.reason}`).toBe(true);
      expect(result.hasFixedHeight, `block ${i}: view mode must not use fixed height`).toBe(false);
    }
  });

  test("view mode: consecutive blocks do not overlap", async ({ page }) => {
    await page.goto("/");
    const firstContentBlock = page.getByTestId(TEST_ID.contentBlock).first();
    await expect(firstContentBlock).toBeVisible();

    const contentBlocks = page.getByTestId(TEST_ID.contentBlock);
    const boxes = await contentBlocks.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left };
      })
    );

    expect(boxes.length).toBeGreaterThan(1);
    for (let i = 1; i < boxes.length; i++) {
      const prev = boxes[i - 1];
      const curr = boxes[i];
      if (Math.abs(prev.left - curr.left) > 40) continue;
      expect(
        curr.top,
        `block ${i} overlaps block ${i - 1} (prev.bottom=${prev.bottom}, curr.top=${curr.top})`
      ).toBeGreaterThanOrEqual(prev.bottom - 1);
    }
  });

  test("edit mode: block shell fits body content", async ({ page }) => {
    await enterEditMode(page);

    const blocks = page.getByTestId(TEST_ID.contentBlock);
    const count = await blocks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const result = await blocks.nth(i).evaluate(clipCheck);
      expect(result.ok, `edit block ${i}: ${result.reason}`).toBe(true);
      expect(result.hasFixedHeight, `edit block ${i}: must not use fixed height`).toBe(false);
    }
  });

  test("edit mode: consecutive blocks in the same column do not overlap", async ({ page }) => {
    await enterEditMode(page);

    const contentBlocks = page.getByTestId(TEST_ID.contentBlock);
    const boxes = await contentBlocks.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left };
      })
    );

    expect(boxes.length).toBeGreaterThan(1);
    for (let i = 1; i < boxes.length; i++) {
      const prev = boxes[i - 1];
      const curr = boxes[i];
      if (Math.abs(prev.left - curr.left) > 40) continue;
      expect(
        curr.top,
        `edit block ${i} overlaps ${i - 1} (prev.bottom=${prev.bottom}, curr.top=${curr.top})`
      ).toBeGreaterThanOrEqual(prev.bottom - 1);
    }
  });
});

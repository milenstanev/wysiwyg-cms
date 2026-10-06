import { test, expect } from "@playwright/test";

/**
 * E2E: Block resize behavior in edit mode.
 * - Height-only types (heading, text, list, table, banner): resizing keeps width constant.
 * - Image and showcase: can be resized in both dimensions.
 */

async function dragResizeHandleDown(
  page: import("@playwright/test").Page,
  block: import("@playwright/test").Locator,
  pixels: number
) {
  await block.hover();
  const handle = block.locator(".react-resizable-handle");
  await expect(handle).toBeVisible({ timeout: 2000 });
  const handleBox = await handle.boundingBox();
  expect(handleBox).not.toBeNull();
  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    handleBox!.x + handleBox!.width / 2,
    handleBox!.y + handleBox!.height / 2 + pixels
  );
  await page.mouse.up();
  await page.waitForTimeout(400);
}

async function dragResizeHandleLeft(
  page: import("@playwright/test").Page,
  block: import("@playwright/test").Locator,
  pixels: number
) {
  await block.hover();
  const handle = block.locator(".react-resizable-handle");
  await expect(handle).toBeVisible({ timeout: 2000 });
  const handleBox = await handle.boundingBox();
  expect(handleBox).not.toBeNull();
  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    handleBox!.x + handleBox!.width / 2 - pixels,
    handleBox!.y + handleBox!.height / 2
  );
  await page.mouse.up();
  await page.waitForTimeout(200);
}

test.describe("Block resize in edit mode", () => {
  test("heading block: resize handle visible; vertical drag changes height only (width unchanged)", async ({
    page,
  }) => {
    await page.goto("/?edit=1");
    const headingBlock = page
      .getByTestId("content-block")
      .filter({ has: page.getByRole("heading") })
      .first();
    await expect(headingBlock).toBeVisible({ timeout: 10000 });

    const boxBefore = await headingBlock.boundingBox();
    expect(boxBefore).not.toBeNull();
    const widthBefore = boxBefore!.width;

    await dragResizeHandleDown(page, headingBlock, 80);

    await expect(async () => {
      const boxAfter = await headingBlock.boundingBox();
      expect(boxAfter).not.toBeNull();
      expect(boxAfter!.width).toBe(widthBefore);
      expect(boxAfter!.height).toBeGreaterThan(boxBefore!.height);
    }).toPass({ timeout: 3000 });
  });

  test("paragraph block: height-only resize (width unchanged when dragging handle down)", async ({
    page,
  }) => {
    await page.goto("/?edit=1");
    await page.getByRole("button", { name: /Add block \(main\)/i }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ force: true });
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });

    const block = page.getByTestId("content-block").filter({ hasText: "New paragraph" }).first();
    const boxBefore = await block.boundingBox();
    expect(boxBefore).not.toBeNull();
    const wBefore = boxBefore!.width;

    await dragResizeHandleDown(page, block, 50);

    const boxAfter = await block.boundingBox();
    expect(boxAfter).not.toBeNull();
    expect(boxAfter!.width).toBe(wBefore);
  });

  test("image block: can be resized in both dimensions (width can change)", async ({ page }) => {
    await page.goto("/?edit=1");
    await page.getByRole("button", { name: /Add block \(main\)/i }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ force: true });
    await page.getByRole("button", { name: "Image" }).click();
    await expect(page.getByPlaceholder("Image URL")).toBeVisible({ timeout: 3000 });

    const block = page
      .getByTestId("content-block")
      .filter({ has: page.getByPlaceholder("Image URL") })
      .first();
    const boxBefore = await block.boundingBox();
    expect(boxBefore).not.toBeNull();
    const wBefore = boxBefore!.width;

    await dragResizeHandleLeft(page, block, 120);

    const boxAfter = await block.boundingBox();
    expect(boxAfter).not.toBeNull();
    expect(boxAfter!.width).toBeLessThan(wBefore);
  });

  test("showcase block: can be resized in both dimensions", async ({ page }) => {
    await page.goto("/?edit=1");
    await page.getByRole("button", { name: /Add block \(main\)/i }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ force: true });
    await page.getByRole("button", { name: "Showcase" }).click();
    await expect(page.getByText("Feature title")).toBeVisible({ timeout: 3000 });

    const block = page.getByTestId("content-block").filter({ hasText: "Feature title" }).first();
    const boxBefore = await block.boundingBox();
    expect(boxBefore).not.toBeNull();
    const wBefore = boxBefore!.width;

    await dragResizeHandleLeft(page, block, 100);

    const boxAfter = await block.boundingBox();
    expect(boxAfter).not.toBeNull();
    expect(boxAfter!.width).toBeLessThan(wBefore);
  });
});

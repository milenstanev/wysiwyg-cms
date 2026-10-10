import { expect, type Locator, type Page } from "@playwright/test";
import { TEST_ID } from "../../src/lib/test-ids";

/** Navigate to a page in edit mode (`home` → `/?edit=1`). */
export async function gotoEdit(page: Page, slug = "about") {
  const path = slug === "home" ? "/?edit=1" : `/${slug}?edit=1`;
  await page.goto(path);
  const pageTitle = page.locator("h1").first();
  await expect(pageTitle).toBeVisible();
  const editorBar = page.getByTestId(TEST_ID.editorBar);
  await expect(editorBar).toBeVisible();
}

/** Enter edit from view mode via the Edit button. */
export async function enterEdit(page: Page) {
  const editPageButton = page.getByTestId(TEST_ID.editPageButton);
  await expect(editPageButton).toBeVisible();
  await editPageButton.click();
  const editorBar = page.getByTestId(TEST_ID.editorBar);
  await expect(editorBar).toBeVisible();
}

/** First paragraph/text rich field (not headings — those hide list/link controls). */
export function getRichField(page: Page): Locator {
  return page.locator('.rich-text-block[data-rich-edit="true"]').first();
}

/** Assert Save succeeded (status region; avoids strict-mode clash with visible ✓ Saved!). */
export async function expectSaved(page: Page) {
  const savedStatus = page.getByRole("status");
  await expect(savedStatus).toHaveText(/Saved!/i);
}

/** Select all text inside a contentEditable (or focusable) field. */
export async function selectAllIn(locator: Locator) {
  await locator.click();
  await locator.press(
    process.platform === "darwin" ? "Meta+A" : "Control+A"
  );
}

/** Assert the selection format toolbar is visible. */
export async function expectToolbar(page: Page) {
  const selectionFormatToolbar = page.getByTestId(TEST_ID.selectionFormatToolbar);
  await expect(selectionFormatToolbar).toBeVisible();
}

/** Drag a locator by dx/dy from its center. */
export async function dragBy(page: Page, locator: Locator, dx: number, dy: number) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("dragBy: locator has no bounding box");
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(box.height / 2, 40);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 12 });
  await page.mouse.up();
}

/** Accept the next native dialog; assert message matches optional pattern. */
export function acceptNextDialog(page: Page, messageRe?: RegExp) {
  page.once("dialog", async (dialog) => {
    if (messageRe) expect(dialog.message()).toMatch(messageRe);
    await dialog.accept();
  });
}

/** Dismiss the next native dialog; assert message matches optional pattern. */
export function dismissNextDialog(page: Page, messageRe?: RegExp) {
  page.once("dialog", async (dialog) => {
    if (messageRe) expect(dialog.message()).toMatch(messageRe);
    await dialog.dismiss();
  });
}

/** Snapshot a CMS page JSON via API for restore-after-test. */
export async function fetchPageJson(
  request: { get: (url: string) => Promise<{ ok: () => boolean; json: () => Promise<unknown> }> },
  slug: string
) {
  const res = await request.get(`/api/content/${slug}`);
  expect(res.ok()).toBeTruthy();
  return res.json();
}

export async function putPageJson(
  request: {
    put: (
      url: string,
      opts: { data: unknown }
    ) => Promise<{ ok: () => boolean }>;
  },
  slug: string,
  data: unknown
) {
  const res = await request.put(`/api/content/${slug}`, { data });
  expect(res.ok()).toBeTruthy();
}

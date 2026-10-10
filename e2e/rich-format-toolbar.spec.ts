import { test, expect } from "@playwright/test";
import type { Page as CmsPage } from "../src/lib/cms/types";
import { TEST_ID } from "../src/lib/test-ids";
import {
  dragBy,
  expectSaved,
  expectToolbar,
  fetchPageJson,
  getRichField,
  gotoEdit,
  putPageJson,
  selectAllIn,
} from "./helpers/editor";

async function fieldHtml(page: import("@playwright/test").Page) {
  return getRichField(page).evaluate((el) => el.innerHTML);
}

test.describe("Rich format toolbar", () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  // Serial: shared /blog mutations + restore
  test.describe.configure({ mode: "serial" });

  const SLUG = "blog";

  test("select text shows toolbar; bold persists after save", async ({ page, request }) => {
    const original = (await fetchPageJson(request, SLUG)) as CmsPage;
    try {
      await gotoEdit(page, SLUG);
      const field = getRichField(page);
      await selectAllIn(field);
      await expectToolbar(page);

      const bold = page.getByTestId(TEST_ID.formatBold);
      await bold.click();
      await expect(bold).toHaveAttribute("aria-pressed", "true");

      const html = await fieldHtml(page);
      expect(html.toLowerCase()).toMatch(/<(b|strong)[\s>]/);

      const saveButton = page.getByRole("button", { name: "Save changes" });
      await expect(saveButton).toBeVisible();
      await saveButton.click();
      await expectSaved(page);

      await page.goto(`/${SLUG}`);
      const viewHtml = await page.locator(".rich-text-block").first().innerHTML();
      expect(viewHtml.toLowerCase()).toMatch(/<(b|strong)[\s>]/);
    } finally {
      await putPageJson(request, SLUG, original);
    }
  });

  test("italic, underline, style select", async ({ page, request }) => {
    const original = (await fetchPageJson(request, SLUG)) as CmsPage;
    try {
      await gotoEdit(page, SLUG);
      const field = getRichField(page);
      await selectAllIn(field);
      await expectToolbar(page);

      const formatItalic = page.getByTestId(TEST_ID.formatItalic);
      await expect(formatItalic).toBeVisible();
      await formatItalic.click();
      const formatUnderline = page.getByTestId(TEST_ID.formatUnderline);
      await expect(formatUnderline).toBeVisible();
      await formatUnderline.click();
      let html = await fieldHtml(page);
      expect(html.toLowerCase()).toMatch(/<(i|em)[\s>]/);
      expect(html.toLowerCase()).toMatch(/<u[\s>]/);

      const formatStyle = page.getByTestId(TEST_ID.formatStyle);
      await expect(formatStyle).toBeVisible();
      await formatStyle.selectOption({ label: "Paragraph Style 1" });
      html = await fieldHtml(page);
      expect(html).toMatch(/padding-bottom-20|line-height-18/);
    } finally {
      await putPageJson(request, SLUG, original);
    }
  });

  test("link and unlink", async ({ page, request }) => {
    const original = (await fetchPageJson(request, SLUG)) as CmsPage;
    try {
      await gotoEdit(page, SLUG);
      const field = getRichField(page);
      await selectAllIn(field);
      await expectToolbar(page);

      const formatLink = page.getByTestId(TEST_ID.formatLink);
      await expect(formatLink).toBeVisible();
      await formatLink.click();
      const formatLinkInput = page.getByTestId(TEST_ID.formatLinkInput);
      await expect(formatLinkInput).toBeVisible();
      await formatLinkInput.fill("https://example.com/qa");
      const applyButton = page.getByRole("button", { name: "Apply link" });
      await expect(applyButton).toBeVisible();
      await applyButton.click();
      let html = await fieldHtml(page);
      expect(html).toContain('href="https://example.com/qa"');

      await selectAllIn(field);
      await expectToolbar(page);
      const formatUnlink = page.getByTestId(TEST_ID.formatUnlink);
      await expect(formatUnlink).toBeVisible();
      await formatUnlink.click();
      html = await fieldHtml(page);
      expect(html).not.toContain("example.com/qa");
    } finally {
      await putPageJson(request, SLUG, original);
    }
  });

  test("image URL insert stays layout-safe", async ({ page, request }) => {
    const original = (await fetchPageJson(request, SLUG)) as CmsPage;
    try {
      await gotoEdit(page, SLUG);
      const field = getRichField(page);
      await field.click();
      await expectToolbar(page);

      const formatImage = page.getByTestId(TEST_ID.formatImage);
      await expect(formatImage).toBeVisible();
      await formatImage.click();
      await page
        .getByTestId(TEST_ID.formatLinkInput)
        .fill("https://placehold.co/600x200/png");
      const pageLocator = page.locator(".editor-set-value");
      await expect(pageLocator).toBeVisible();
      await pageLocator.click();
      const insertedImage = field.locator("img");
      await expect(insertedImage).toBeVisible();
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
      });
      expect(overflow, "no horizontal page overflow from image").toBe(false);
    } finally {
      await putPageJson(request, SLUG, original);
    }
  });

  test("lists, quote, align", async ({ page, request }) => {
    const original = (await fetchPageJson(request, SLUG)) as CmsPage;
    try {
      await gotoEdit(page, SLUG);
      const field = getRichField(page);
      await selectAllIn(field);
      await expectToolbar(page);

      const formatUnorderedList = page.getByTestId(TEST_ID.formatUnorderedList);
      await expect(formatUnorderedList).toBeVisible();
      await formatUnorderedList.click();
      expect(await fieldHtml(page)).toMatch(/<ul[\s>]/i);

      const formatQuote = page.getByTestId(TEST_ID.formatQuote);
      await expect(formatQuote).toBeVisible();
      await formatQuote.click();
      expect(await fieldHtml(page)).toMatch(/<blockquote[\s>]/i);

      await selectAllIn(field);
      const formatAlignCenter = page.getByTestId(TEST_ID.formatAlignCenter);
      await expect(formatAlignCenter).toBeVisible();
      await formatAlignCenter.click();
      const html = await fieldHtml(page);
      expect(html).toMatch(/text-align:\s*center/i);
    } finally {
      await putPageJson(request, SLUG, original);
    }
  });

  test("field Submit closes toolbar; field Cancel restores HTML", async ({ page }) => {
    await gotoEdit(page, SLUG);
    const field = getRichField(page);
    await field.click();
    await expectToolbar(page);
    const start = await fieldHtml(page);

    await field.press("End");
    await page.keyboard.type(" FIELD_EDIT");
    const formatCancel = page.getByTestId(TEST_ID.formatCancel);
    await expect(formatCancel).toBeVisible();
    await formatCancel.click();
    const selectionFormatToolbar = page.getByTestId(TEST_ID.selectionFormatToolbar);
    await expect(selectionFormatToolbar).toHaveCount(0);
    expect(await field.innerHTML()).toBe(start);

    await field.click();
    await expectToolbar(page);
    await field.press("End");
    await page.keyboard.type(" KEEP");
    const formatSubmit = page.getByTestId(TEST_ID.formatSubmit);
    await expect(formatSubmit).toBeVisible();
    await formatSubmit.click();
    await expect(selectionFormatToolbar).toHaveCount(0);
    const editorBar = page.getByTestId(TEST_ID.editorBar);
    await expect(editorBar).toBeVisible();
    await expect(field).toContainText("KEEP");
  });

  test("drag chrome persists position in localStorage", async ({ page }) => {
    await gotoEdit(page, SLUG);
    const field = getRichField(page);
    await field.click();
    await expectToolbar(page);

    const drag = page.getByTestId(TEST_ID.formatDrag);
    const before = await page.getByTestId(TEST_ID.selectionFormatToolbar).boundingBox();
    expect(before).toBeTruthy();
    await dragBy(page, drag, 80, 40);
    const stored = await page.evaluate(() => localStorage.getItem("inlineEditor"));
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as { x: number; y: number };
    expect(typeof parsed.x).toBe("number");
    expect(typeof parsed.y).toBe("number");

    await page.reload();
    const editorBar = page.getByTestId(TEST_ID.editorBar);
    await expect(editorBar).toBeVisible();
    const fieldAfterReload = getRichField(page);
    await expect(fieldAfterReload).toBeVisible();
    await fieldAfterReload.click();
    await expectToolbar(page);
    const toolbar = page.getByTestId(TEST_ID.selectionFormatToolbar);
    const after = await toolbar.boundingBox();
    expect(after).toBeTruthy();
    expect(Math.abs(after!.x - parsed.x)).toBeLessThan(40);
    expect(Math.abs(after!.y - parsed.y)).toBeLessThan(40);
  });

  test("heading style hides list controls; undo works", async ({ page, request }) => {
    const original = (await fetchPageJson(request, SLUG)) as CmsPage;
    try {
      await gotoEdit(page, SLUG);
      const field = getRichField(page);
      await selectAllIn(field);
      await expectToolbar(page);

      const before = await fieldHtml(page);
      const formatBold = page.getByTestId(TEST_ID.formatBold);
      await expect(formatBold).toBeVisible();
      await formatBold.click();
      const formatUndo = page.getByTestId(TEST_ID.formatUndo);
      await expect(formatUndo).toBeVisible();
      await formatUndo.click();
      // Undo may restore selection markup; HTML should move toward prior
      const afterUndo = await fieldHtml(page);
      expect(afterUndo === before || !afterUndo.toLowerCase().includes("<b")).toBeTruthy();

      const formatStyle = page.getByTestId(TEST_ID.formatStyle);
      await expect(formatStyle).toBeVisible();
      await formatStyle.selectOption({ label: "Page Title Style 1" });
      const formatOrderedList = page.getByTestId(TEST_ID.formatOrderedList);
      await expect(formatOrderedList).toHaveCount(0);
      const formatLink = page.getByTestId(TEST_ID.formatLink);
      await expect(formatLink).toHaveCount(0);
    } finally {
      await putPageJson(request, SLUG, original);
    }
  });
});

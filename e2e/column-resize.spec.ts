import { test, expect } from "@playwright/test";
import type { Page as CmsPage } from "../src/lib/cms/types";
import { TEST_ID } from "../src/lib/test-ids";
import { dragBy, expectSaved, fetchPageJson, gotoEdit, putPageJson } from "./helpers/editor";

async function columnKidWidths(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const row = document.querySelector(".layout-column-row");
    if (!row) return [] as number[];
    return [...row.children]
      .filter((c) => !c.hasAttribute("data-column-resize-layer"))
      .map((c) => Math.round(c.getBoundingClientRect().width));
  });
}

async function layoutColsVar(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const row = document.querySelector(".layout-column-row") as HTMLElement | null;
    return row?.style.getPropertyValue("--layout-cols") ?? "";
  });
}

test.describe("Column resize", () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test.describe.configure({ mode: "serial" });

  test("desktop two-col edit shows resize handle", async ({ page }) => {
    await gotoEdit(page, "about");
    // Ensure two-col layout
    const chooseButton = page.getByRole("button", { name: "Choose layout" });
    await expect(chooseButton).toBeVisible();
    await chooseButton.click();
    const twoButton = page.getByRole("button", { name: "Two columns" });
    await expect(twoButton).toBeVisible();
    await twoButton.click();
    const handle = page.getByTestId(TEST_ID.columnResizeHandle).first();
    await expect(handle).toBeVisible();
    await expect(handle).toHaveAttribute("aria-label", /Resize columns/i);
  });

  test("narrow viewport hides handles", async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await gotoEdit(page, "about");
    const chooseButton = page.getByRole("button", { name: "Choose layout" });
    await expect(chooseButton).toBeVisible();
    await chooseButton.click();
    const twoButton = page.getByRole("button", { name: "Two columns" });
    await expect(twoButton).toBeVisible();
    await twoButton.click();
    const handles = page.getByTestId(TEST_ID.columnResizeHandle);
    // May exist in DOM but must not be interactively visible
    const count = await handles.count();
    if (count > 0) {
      const firstHandle = handles.first();
      await expect(firstHandle).toBeHidden();
    } else {
      expect(count).toBe(0);
    }
  });

  test("drag handle widens left column; save persists", async ({ page, request }) => {
    const original = (await fetchPageJson(request, "about")) as CmsPage;
    try {
      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoEdit(page, "about");
      const chooseButton = page.getByRole("button", { name: "Choose layout" });
      await expect(chooseButton).toBeVisible();
      await chooseButton.click();
      const twoButton = page.getByRole("button", { name: "Two columns" });
      await expect(twoButton).toBeVisible();
      await twoButton.click();

      const handle = page.getByTestId(TEST_ID.columnResizeHandle).first();
      await expect(handle).toBeVisible();
      const before = await columnKidWidths(page);
      expect(before.length).toBeGreaterThanOrEqual(2);
      const leftBefore = before[0];

      await dragBy(page, handle, 220, 0);
      await page.waitForTimeout(100);
      const mid = await columnKidWidths(page);
      expect(mid[0]).toBeGreaterThan(leftBefore);

      const colsBeforeSave = await layoutColsVar(page);
      expect(colsBeforeSave).toMatch(/fr/);

      const saveButton = page.getByRole("button", { name: "Save changes" });
      await expect(saveButton).toBeVisible();
      await saveButton.click();
      await expectSaved(page);

      // Persist check via API (avoids race with other suites mutating About in parallel)
      const saved = (await fetchPageJson(request, "about")) as CmsPage;
      expect(saved.columnWidths).toBeTruthy();
      expect(Number(saved.columnWidths?.left ?? 0)).toBeGreaterThan(1);

      await page.goto("/about");
      const pageTitle = page.locator("h1");
      await expect(pageTitle).toBeVisible();
      const columnResizeHandle = page.getByTestId(TEST_ID.columnResizeHandle);
      await expect(columnResizeHandle).toHaveCount(0);

      await gotoEdit(page, "about");
      const colsAfter = await layoutColsVar(page);
      expect(colsAfter).toMatch(/fr/);
      expect(colsAfter).not.toBe("minmax(0, 1fr) minmax(0, 2fr)");
    } finally {
      await putPageJson(request, "about", original);
    }
  });

  test("three-col at lg has two handles when regions visible", async ({ page, request }) => {
    const original = (await fetchPageJson(request, "about")) as CmsPage;
    try {
      // Seed left + right so three tracks are visible (empty regions are omitted)
      const seeded: CmsPage = {
        ...original,
        layout: "three-col",
        leftBlocks: original.leftBlocks?.length
          ? original.leftBlocks
          : [
              {
                id: "e2e-left",
                type: "text",
                content: "Left column seed",
              },
            ],
        rightBlocks: [
          {
            id: "e2e-right",
            type: "text",
            content: "Right column seed",
          },
        ],
      };
      await putPageJson(request, "about", seeded);

      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoEdit(page, "about");

      const handles = page.getByTestId(TEST_ID.columnResizeHandle);
      await expect(handles).toHaveCount(2);

      const firstHandle = handles.first();
      await expect(firstHandle).toBeVisible();
      await firstHandle.focus();
      await expect(firstHandle).toBeFocused();
      await expect(firstHandle).toHaveAttribute("aria-label", /Resize columns/i);
    } finally {
      await putPageJson(request, "about", original);
    }
  });
});

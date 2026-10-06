import { test, expect } from "@playwright/test";

/**
 * E2E: Layout must not move when switching between view and edit mode.
 * - Layout selector flies: trigger in header opens a createPortal dropdown (position fixed in body).
 * - Add-block UI is absolutely positioned so the grid stays fixed.
 * Tests assert content position and attach screenshots for documentation.
 */

test.describe("Layout does not shift between view and edit mode", () => {
  test("Layout dropdown flies (portal, position fixed) and does not push article content", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await expect(page.getByText("Welcome")).toBeVisible({ timeout: 10000 });

    const article = page.locator("[data-page-renderer]");
    await expect(article).toBeVisible();
    const articleBoxView = await article.boundingBox();
    const titleView = article.getByRole("heading", { level: 1 });
    const titleBoxView = await titleView.boundingBox();
    expect(articleBoxView).toBeTruthy();
    expect(titleBoxView).toBeTruthy();
    const titleOffsetInArticleView = titleBoxView!.y - articleBoxView!.y;

    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: /Choose layout/i })).toBeVisible({
      timeout: 5000,
    });

    const articleBoxEdit = await article.boundingBox();
    const titleEdit = article.getByRole("heading", { level: 1 });
    const titleBoxEdit = await titleEdit.boundingBox();
    expect(articleBoxEdit).toBeTruthy();
    expect(titleBoxEdit).toBeTruthy();
    const titleOffsetInArticleEdit = titleBoxEdit!.y - articleBoxEdit!.y;

    expect(
      Math.abs(titleOffsetInArticleEdit - titleOffsetInArticleView),
      "Title offset inside article should be the same (Layout is a trigger, not in article flow)"
    ).toBeLessThanOrEqual(2);

    await page.getByRole("button", { name: /Choose layout/i }).click();
    await expect(page.getByTestId("layout-dropdown")).toBeVisible({ timeout: 2000 });
    await expect(page.getByRole("button", { name: "Single column" })).toBeVisible();

    const headerScreenshot = await page.locator("[data-page-header]").screenshot();
    await testInfo.attach("edit-header-with-layout-trigger.png", {
      body: headerScreenshot,
      contentType: "image/png",
    });
  });
  test("main content grid position is the same in view and edit mode", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await expect(page.getByText("Welcome")).toBeVisible({ timeout: 10000 });

    const grid = page.locator(".block-grid-layout").first();
    await expect(grid).toBeVisible({ timeout: 3000 });

    const firstBlock = page.getByTestId("content-block").first();
    await expect(firstBlock).toBeVisible();

    const gridBoxView = await grid.boundingBox();
    const blockBoxView = await firstBlock.boundingBox();
    expect(gridBoxView).toBeTruthy();
    expect(blockBoxView).toBeTruthy();

    const offsetTopView = blockBoxView!.y - gridBoxView!.y;
    const gridHeightView = gridBoxView!.height;

    await page.screenshot({
      path: testInfo.outputPath("view-mode.png"),
      fullPage: false,
    });
    await testInfo.attach("view-mode.png", {
      path: testInfo.outputPath("view-mode.png"),
      contentType: "image/png",
    });

    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: /Choose layout/i })).toBeVisible({
      timeout: 5000,
    });

    const gridBoxEdit = await grid.boundingBox();
    const blockBoxEdit = await firstBlock.boundingBox();
    expect(gridBoxEdit).toBeTruthy();
    expect(blockBoxEdit).toBeTruthy();

    const offsetTopEdit = blockBoxEdit!.y - gridBoxEdit!.y;
    const gridHeightEdit = gridBoxEdit!.height;

    await page.screenshot({
      path: testInfo.outputPath("edit-mode.png"),
      fullPage: false,
    });
    await testInfo.attach("edit-mode.png", {
      path: testInfo.outputPath("edit-mode.png"),
      contentType: "image/png",
    });

    expect(
      Math.abs(offsetTopEdit - offsetTopView),
      "First block offset inside grid should be the same in view and edit mode"
    ).toBeLessThanOrEqual(2);

    expect(
      Math.abs(gridHeightEdit - gridHeightView),
      "Grid height should be the same (no extra space from Add block UI)"
    ).toBeLessThanOrEqual(2);
  });

  test("content area looks the same in edit mode as in view (visual regression + screenshots)", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await expect(page.getByTestId("content-block").first()).toBeVisible({ timeout: 10000 });

    const contentArea = page.locator(".block-grid-layout").first();
    await expect(contentArea).toBeVisible();

    await expect(contentArea).toHaveScreenshot("content-area-baseline-view.png");
    const viewScreenshot = await contentArea.screenshot();
    await testInfo.attach("content-area-view-mode.png", {
      body: viewScreenshot,
      contentType: "image/png",
    });

    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: /Choose layout/i })).toBeVisible({
      timeout: 5000,
    });

    const editScreenshot = await contentArea.screenshot();
    await testInfo.attach("content-area-edit-mode.png", {
      body: editScreenshot,
      contentType: "image/png",
    });

    await expect(contentArea).toHaveScreenshot("content-area-baseline-view.png");
  });
});

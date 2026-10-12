import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";

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
    const welcomeHeading = page.getByRole("heading", { name: "Welcome" });
    await expect(welcomeHeading).toBeVisible();

    const article = page.locator("[data-page-renderer]");
    await expect(article).toBeVisible();
    const articleBoxView = await article.boundingBox();
    const titleView = article.locator(".page-title");
    const titleBoxView = await titleView.boundingBox();
    expect(articleBoxView).toBeTruthy();
    expect(titleBoxView).toBeTruthy();
    const titleOffsetInArticleView = titleBoxView!.y - articleBoxView!.y;

    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const chooseButton = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseButton).toBeVisible();

    const articleBoxEdit = await article.boundingBox();
    const titleEdit = article.locator(".page-title");
    const titleBoxEdit = await titleEdit.boundingBox();
    expect(articleBoxEdit).toBeTruthy();
    expect(titleBoxEdit).toBeTruthy();
    const titleOffsetInArticleEdit = titleBoxEdit!.y - articleBoxEdit!.y;

    expect(
      Math.abs(titleOffsetInArticleEdit - titleOffsetInArticleView),
      "Title offset inside article should be the same (Layout is a trigger, not in article flow)"
    ).toBeLessThanOrEqual(2);

    await expect(chooseButton).toBeVisible();
    await chooseButton.click();
    const layoutDropdown = page.getByTestId(TEST_ID.layoutDropdown);
    await expect(layoutDropdown).toBeVisible();
    const singleButton = page.getByRole("button", { name: "Single column" });
    await expect(singleButton).toBeVisible();

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
    await expect(welcomeHeading).toBeVisible();

    const grid = page.locator(".block-grid-layout").first();
    await expect(grid).toBeVisible();

    const firstBlock = page.getByTestId(TEST_ID.contentBlock).first();
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

    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    await expect(chooseButton).toBeVisible();

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
    const contentBlock = page.getByTestId(TEST_ID.contentBlock).first();
    await expect(contentBlock).toBeVisible();

    const contentArea = page.locator(".layout-content-card").first();
    await expect(contentArea).toBeVisible();
    await page.mouse.move(0, 0);

    // The sticky header overlays the card while a tall element is captured; it is not card content
    const hideHeader = await page.addStyleTag({
      content: "[data-page-header] { visibility: hidden !important; }",
    });
    const viewScreenshot = await contentArea.screenshot({ animations: "disabled" });
    await hideHeader.evaluate((el) => el.remove());
    await testInfo.attach("content-area-view-mode.png", {
      body: viewScreenshot,
      contentType: "image/png",
    });

    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    await expect(chooseButton).toBeVisible();
    await page.mouse.move(0, 0);
    // Capture from the same scroll position: fixed background decoration shows through the card
    await page.evaluate(() => window.scrollTo(0, 0));

    // Overlay chips and the fixed editor bar sit on top of the card; hide them to compare the content pixels underneath
    const hide = await page.addStyleTag({
      content:
        ".edit-popover, .block-region-add, .editor-bar, [data-page-header] { visibility: hidden !important; }",
    });
    const editScreenshot = await contentArea.screenshot({ animations: "disabled" });
    await hide.evaluate((el) => el.remove());
    await testInfo.attach("content-area-edit-mode.png", {
      body: editScreenshot,
      contentType: "image/png",
    });

    expect(Buffer.compare(viewScreenshot, editScreenshot)).toBe(0);
  });
});

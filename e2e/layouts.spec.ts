import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";

// Empty sections stay hidden in edit mode (WYSIWYG); their add buttons live in the "+ Section" hover menu.
test.describe("Layouts", () => {
  test("can click through all four layout options", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const layouts = [
      "Single column",
      "Two columns",
      "Three columns",
      "RocketTheme-style (complex)",
    ];
    for (const name of layouts) {
      const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
      await expect(chooseLayout).toBeVisible();
      await chooseLayout.click();
      const layoutOption = page.getByRole("button", { name });
      await expect(layoutOption).toBeVisible();
      await layoutOption.click();
      await chooseLayout.click();
      await expect(layoutOption).toHaveClass(/bg-\[var\(--accent\)\]/);
      await page.keyboard.press("Escape");
    }
  });

  test("two-col + save, reload shows left add block", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
    await chooseLayout.click();
    const twoColumns = page.getByRole("button", { name: "Two columns" });
    await expect(twoColumns).toBeVisible();
    await twoColumns.click();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.reload();
    const welcome = page.getByRole("heading", { name: "Welcome" });
    await expect(welcome).toBeVisible();
    const editButton2 = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton2).toBeVisible();
    await editButton2.click();
    const emptySectionsMenu = page.getByTestId(TEST_ID.emptySectionsMenu);
    await expect(emptySectionsMenu).toBeVisible();
    await emptySectionsMenu.hover();
    const addBlockLeft = page.getByRole("button", { name: /Add block \(left\)/i });
    await expect(addBlockLeft).toBeVisible();
  });

  test("three-col + save, reload still has left and right", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
    await chooseLayout.click();
    const threeColumns = page.getByRole("button", { name: "Three columns" });
    await expect(threeColumns).toBeVisible();
    await threeColumns.click();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.reload();
    const editButton2 = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton2).toBeVisible();
    await editButton2.click();
    const emptySectionsMenu = page.getByTestId(TEST_ID.emptySectionsMenu);
    await expect(emptySectionsMenu).toBeVisible();
    await emptySectionsMenu.hover();
    const addBlockLeft = page.getByRole("button", { name: /Add block \(left\)/i });
    await expect(addBlockLeft).toBeVisible();
    const emptySectionsMenu2 = page.getByTestId(TEST_ID.emptySectionsMenu);
    await expect(emptySectionsMenu2).toBeVisible();
    await emptySectionsMenu2.hover();
    const addBlockRight = page.getByRole("button", { name: /Add block \(right\)/i });
    await expect(addBlockRight).toBeVisible();
  });

  test("rockettheme layout saves, main still editable after reload", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
    await chooseLayout.click();
    const rocketThemeStyle = page.getByRole("button", { name: /RocketTheme-style/ });
    await expect(rocketThemeStyle).toBeVisible();
    await rocketThemeStyle.click();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.reload();
    const editButton2 = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton2).toBeVisible();
    await editButton2.click();
    const chooseLayout2 = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout2).toBeVisible();
    const firstEl = page.locator("[data-module-position]").first();
    await expect(firstEl).toBeVisible();
    const addBlockMain = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addBlockMain).toBeVisible();
  });

  test("admin: set about to single column, save, frontend shows single", async ({ page }) => {
    await page.goto("/admin?page=about");
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
    await chooseLayout.click();
    const singleColumn = page.getByRole("button", { name: "Single column" });
    await expect(singleColumn).toBeVisible();
    await singleColumn.click();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.goto("/about");
    const aboutUs = page.getByRole("heading", { name: "About Us" });
    await expect(aboutUs).toBeVisible();
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const singleColumn2 = page.getByRole("button", { name: "Single column" });
    await expect(singleColumn2).toHaveClass(/bg-\[var\(--accent\)\]/);
  });

  test("single column save and reload — no sidebar add buttons", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
    await chooseLayout.click();
    const singleColumn = page.getByRole("button", { name: "Single column" });
    await expect(singleColumn).toBeVisible();
    await singleColumn.click();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.reload();
    const editButton2 = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton2).toBeVisible();
    await editButton2.click();
    const addBlockLeft = page.getByRole("button", { name: /Add block \(left\)/i });
    await expect(addBlockLeft).not.toBeVisible();
    const addBlockRight = page.getByRole("button", { name: /Add block \(right\)/i });
    await expect(addBlockRight).not.toBeVisible();
  });

  test("two-col: add in left and main, save — both visible after reload", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
    await chooseLayout.click();
    const twoColumns = page.getByRole("button", { name: "Two columns" });
    await expect(twoColumns).toBeVisible();
    await twoColumns.click();
    const emptySectionsMenu = page.getByTestId(TEST_ID.emptySectionsMenu);
    await expect(emptySectionsMenu).toBeVisible();
    await emptySectionsMenu.hover();
    const addBlockLeft = page.getByRole("button", { name: /Add block \(left\)/i });
    await expect(addBlockLeft).toBeVisible();
    await addBlockLeft.click();
    const heading = page.getByRole("button", { name: "Heading" });
    await expect(heading).toBeVisible();
    await heading.click();
    const newHeading = page.getByText("New heading");
    await expect(newHeading).toBeVisible();
    const addBlockMain = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addBlockMain).toBeVisible();
    await addBlockMain.click();
    const paragraph = page.getByRole("button", { name: "Paragraph" });
    await expect(paragraph).toBeVisible();
    await paragraph.click();
    const newParagraph = page.getByText("New paragraph...");
    await expect(newParagraph).toBeVisible();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.reload();
    const newHeading2 = page.getByText("New heading");
    await expect(newHeading2).toBeVisible();
    const newParagraph2 = page.getByText("New paragraph...");
    await expect(newParagraph2).toBeVisible();
  });

  test("admin: set blog to two-col, save, frontend has two columns", async ({ page }) => {
    await page.goto("/admin?page=blog");
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
    await chooseLayout.click();
    const twoColumns = page.getByRole("button", { name: "Two columns" });
    await expect(twoColumns).toBeVisible();
    await twoColumns.click();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.goto("/blog");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const emptySectionsMenu = page.getByTestId(TEST_ID.emptySectionsMenu);
    await expect(emptySectionsMenu).toBeVisible();
    await emptySectionsMenu.hover();
    const addBlockLeft = page.getByRole("button", { name: /Add block \(left\)/i });
    await expect(addBlockLeft).toBeVisible();
  });

  test("rockettheme: add block in main, save, visible on reload", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const rocketThemeStyle = page.getByRole("button", { name: /RocketTheme-style/ });
    await expect(rocketThemeStyle).toBeVisible();
    await rocketThemeStyle.click();
    const addBlockMain = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addBlockMain).toBeVisible();
    await addBlockMain.click();
    const heading = page.getByRole("button", { name: "Heading" });
    await expect(heading).toBeVisible();
    await heading.click();
    const newHeading = page.getByText("New heading");
    await expect(newHeading).toBeVisible();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.reload();
    const newHeading2 = page.getByText("New heading");
    await expect(newHeading2).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("shows welcome and edit button", async ({ page }) => {
    await page.goto("/");
    const welcome = page.getByRole("heading", { name: "Welcome" });
    await expect(welcome).toBeVisible();
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
  });

  test("edit heading, save, content stays", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const heading = page.getByRole("heading", { name: "Hello from the CMS" });
    await heading.click({ clickCount: 3 });
    await page.keyboard.type("Edited from page UI");
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    const editedFromPageUI = page.getByText("Edited from page UI");
    await expect(editedFromPageUI).toBeVisible();
  });

  test("click About goes to about page", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /About Us/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/about/);
    const aboutUs = page.getByRole("heading", { name: "About Us" });
    await expect(aboutUs).toBeVisible();
  });

  test("cancel leaves you in view mode", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const cancel = page.getByRole("button", { name: /Cancel/i });
    await expect(cancel).toBeVisible();
    await cancel.click();
    const editButton2 = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton2).toBeVisible();
    const cancel2 = page.getByRole("button", { name: /Cancel/i });
    await expect(cancel2).not.toBeVisible();
  });

  test("can switch between single / two / three column in edit mode", async ({ page }) => {
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
    const chooseLayout2 = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout2).toBeVisible();
    await chooseLayout2.click();
    const twoColumns2 = page.getByRole("button", { name: "Two columns" });
    await expect(twoColumns2).toHaveClass(/bg-\[var\(--accent\)\]/);
    const chooseLayout3 = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout3).toBeVisible();
    await chooseLayout3.click();
    const threeColumns = page.getByRole("button", { name: "Three columns" });
    await expect(threeColumns).toBeVisible();
    await threeColumns.click();
    const chooseLayout4 = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout4).toBeVisible();
    await chooseLayout4.click();
    const threeColumns2 = page.getByRole("button", { name: "Three columns" });
    await expect(threeColumns2).toHaveClass(/bg-\[var\(--accent\)\]/);
  });

  test("add paragraph block shows up", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const addBlockMain = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addBlockMain).toBeVisible();
    await addBlockMain.click();
    const paragraph = page.getByRole("button", { name: "Paragraph" });
    await expect(paragraph).toBeVisible();
    await paragraph.click();
    const newParagraph = page.getByText("New paragraph...");
    await expect(newParagraph).toBeVisible();
  });

  test("remove block reduces count", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const removeBtns = page.getByTitle("Remove block");
    const n = await removeBtns.count();
    if (n > 0) {
      await removeBtns.first().click();
      await expect(removeBtns).toHaveCount(n - 1);
    }
  });

  test("edit mode shows Save and Cancel", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    const cancel = page.getByRole("button", { name: /Cancel/i });
    await expect(cancel).toBeVisible();
  });

  test("add heading then cancel — new block gone", async ({ page }) => {
    await page.goto("/");
    const editButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton).toBeVisible();
    await editButton.click();
    const addBlockMain = page.getByRole("button", { name: /Add block \(main\)/i });
    await expect(addBlockMain).toBeVisible();
    await addBlockMain.click();
    const heading = page.getByRole("button", { name: "Heading" });
    await expect(heading).toBeVisible();
    await heading.click();
    const newHeading = page.getByText("New heading");
    await expect(newHeading).toBeVisible();
    const cancel = page.getByRole("button", { name: /Cancel/i });
    await expect(cancel).toBeVisible();
    await cancel.click();
    const editButton2 = page.getByRole("button", { name: /Edit this page/i });
    await expect(editButton2).toBeVisible();
    await editButton2.click();
    const newHeading2 = page.getByText("New heading");
    await expect(newHeading2).not.toBeVisible();
  });

  test("click Home in nav when on about", async ({ page }) => {
    await page.goto("/about");
    const firstHome = page.getByRole("link", { name: "Home" }).first();
    await expect(firstHome).toBeVisible();
    await firstHome.click();
    await expect(page).toHaveURL("/");
    const welcome = page.getByRole("heading", { name: "Welcome" });
    await expect(welcome).toBeVisible();
  });
});

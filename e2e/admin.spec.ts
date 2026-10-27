import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";

/** Wait for admin to finish loading (toolbar and page content ready). */
async function waitForAdminLoaded(page: import("@playwright/test").Page, timeout = 15000) {
  const adminLoaded = page.getByTestId(TEST_ID.adminLoaded);
  await expect(adminLoaded).toBeVisible({ timeout });
  const combobox = page.getByRole("combobox");
  await expect(combobox).toBeVisible();
}

test.describe("Admin", () => {
  test("has save, page dropdown and content", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    const combobox = page.getByRole("combobox");
    await expect(combobox).toBeVisible();
    const combobox2 = page.getByRole("combobox");
    await expect(combobox2).toHaveValue("home");
    const firstHeading = page.getByRole("heading").first();
    await expect(firstHeading).toBeVisible();
  });

  test("edit about page, save, then see it on frontend", async ({ page }) => {
    await page.goto("/admin?page=about");
    await waitForAdminLoaded(page);
    const mainHeading = page.locator("main").getByRole("heading").first();
    await mainHeading.click({ clickCount: 3 });
    await page.keyboard.type("Edited via Admin E2E");
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    await page.goto("/about");
    const editedViaAdminE2E = page.getByText("Edited via Admin E2E");
    await expect(editedViaAdminE2E).toBeVisible();
  });

  test("page dropdown loads about content", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const combobox = page.getByRole("combobox");
    await expect(combobox).toBeVisible();
    await combobox.selectOption("about");
    const combobox2 = page.getByRole("combobox");
    await expect(combobox2).toHaveValue("about");
    const firstHeading = page.locator("main").getByRole("heading").first();
    await expect(firstHeading).toBeVisible();
  });

  test("can flip through all pages in dropdown", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const combobox = page.getByRole("combobox");
    await combobox.selectOption("about");
    await expect(combobox).toHaveValue("about");
    const firstHeading = page.getByRole("heading").first();
    await expect(firstHeading).toBeVisible();
    await combobox.selectOption("blog");
    await expect(combobox).toHaveValue("blog");
    await combobox.selectOption("contact");
    await expect(combobox).toHaveValue("contact");
    await combobox.selectOption("home");
    await expect(combobox).toHaveValue("home");
  });

  test("can pick two-column layout", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
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
  });

  test("add heading block", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const addBlockBtn = page.getByRole("button", { name: /Add block \(main\)/i });
    await addBlockBtn.scrollIntoViewIfNeeded();
    await addBlockBtn.click();
    const heading = page.getByRole("button", { name: "Heading" });
    await expect(heading).toBeVisible();
    await heading.click();
    const newHeading = page.getByText("New heading");
    await expect(newHeading).toBeVisible();
  });

  test("footer Home link goes to site", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const home = page.getByRole("link", { name: "Home" });
    await expect(home).toBeVisible();
    await home.click();
    await expect(page).toHaveURL("/");
  });

  test("footer Admin link stays in admin", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const admin = page.getByRole("link", { name: "Admin" });
    await expect(admin).toBeVisible();
    await admin.click();
    await expect(page).toHaveURL("/admin");
  });

  test("admin?page=blog shows blog content", async ({ page }) => {
    await page.goto("/admin?page=blog");
    await waitForAdminLoaded(page);
    const combobox = page.getByRole("combobox");
    await expect(combobox).toHaveValue("blog");
    const firstHeading = page.locator("main").getByRole("heading").first();
    await expect(firstHeading).toBeVisible();
  });

  test("admin?page=contact shows contact content", async ({ page }) => {
    await page.goto("/admin?page=contact");
    await waitForAdminLoaded(page);
    const combobox = page.getByRole("combobox");
    await expect(combobox).toHaveValue("contact");
    const firstHeading = page.locator("main").getByRole("heading").first();
    await expect(firstHeading).toBeVisible();
  });

  test("can pick three-column layout", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
    await chooseLayout.click();
    const threeColumns = page.getByRole("button", { name: "Three columns" });
    await expect(threeColumns).toBeVisible();
    await threeColumns.click();
    const chooseLayout2 = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout2).toBeVisible();
    await chooseLayout2.click();
    const threeColumns2 = page.getByRole("button", { name: "Three columns" });
    await expect(threeColumns2).toHaveClass(/bg-\[var\(--accent\)\]/);
  });

  test("can pick rockettheme layout", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
    await chooseLayout.click();
    const rocketThemeStyle = page.getByRole("button", { name: /RocketTheme-style/ });
    await expect(rocketThemeStyle).toBeVisible();
    await rocketThemeStyle.click();
    const chooseLayout2 = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout2).toBeVisible();
    await chooseLayout2.click();
    const rocketThemeStyle2 = page.getByRole("button", { name: /RocketTheme-style/ });
    await expect(rocketThemeStyle2).toHaveClass(
      /bg-\[var\(--accent\)\]/
    );
  });

  test("add block in left column when two-col in admin", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const chooseLayout = page.getByRole("button", { name: /Choose layout/i });
    await expect(chooseLayout).toBeVisible();
    await chooseLayout.click();
    const twoColumns = page.getByRole("button", { name: "Two columns" });
    await expect(twoColumns).toBeVisible();
    await twoColumns.click();
    const twoColumns2 = page.getByRole("button", { name: "Two columns" });
    await expect(twoColumns2).toHaveClass(/bg-\[var\(--accent\)\]/);
    const addLeftBtn = page.getByRole("button", { name: /Add block \(left\)/i });
    await addLeftBtn.scrollIntoViewIfNeeded();
    await addLeftBtn.click();
    const paragraph = page.getByRole("button", { name: "Paragraph" });
    await expect(paragraph).toBeVisible();
    await paragraph.click();
    const newParagraph = page.getByText("New paragraph...");
    await expect(newParagraph).toBeVisible();
  });

  test("after save combobox still shows current page", async ({ page }) => {
    await page.goto("/admin?page=about");
    await waitForAdminLoaded(page);
    const combobox = page.getByRole("combobox");
    await expect(combobox).toHaveValue("about");
    const saveButton = page.getByRole("button", { name: /Save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
    const combobox2 = page.getByRole("combobox");
    await expect(combobox2).toHaveValue("about");
  });
});

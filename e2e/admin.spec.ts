import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";

/** Wait for admin to finish loading (toolbar and page content ready). */
async function waitForAdminLoaded(page: import("@playwright/test").Page, timeout = 15000) {
  await expect(page.getByTestId(TEST_ID.adminLoaded)).toBeVisible({ timeout });
  await expect(page.getByRole("combobox")).toBeVisible({ timeout: 5000 });
}

test.describe("Admin", () => {
  test("has save, page dropdown and content", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    await expect(page.getByRole("button", { name: /Save/i })).toBeVisible();
    await expect(page.getByRole("combobox")).toBeVisible();
    await expect(page.getByRole("combobox")).toHaveValue("home");
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 5000 });
  });

  test("edit about page, save, then see it on frontend", async ({ page }) => {
    await page.goto("/admin?page=about");
    await waitForAdminLoaded(page);
    const mainHeading = page.locator("main").getByRole("heading").first();
    await mainHeading.tripleClick();
    await page.keyboard.type("Edited via Admin E2E");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.goto("/about");
    await expect(page.getByText("Edited via Admin E2E")).toBeVisible({ timeout: 5000 });
  });

  test("page dropdown loads about content", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    await page.getByRole("combobox").selectOption("about");
    await expect(page.getByRole("combobox")).toHaveValue("about", { timeout: 10000 });
    await expect(page.locator("main").getByRole("heading").first()).toBeVisible({ timeout: 5000 });
  });

  test("can flip through all pages in dropdown", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const combobox = page.getByRole("combobox");
    await combobox.selectOption("about");
    await expect(combobox).toHaveValue("about", { timeout: 5000 });
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 5000 });
    await combobox.selectOption("blog");
    await expect(combobox).toHaveValue("blog", { timeout: 5000 });
    await combobox.selectOption("contact");
    await expect(combobox).toHaveValue("contact", { timeout: 5000 });
    await combobox.selectOption("home");
    await expect(combobox).toHaveValue("home", { timeout: 5000 });
  });

  test("can pick two-column layout", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    await page.getByRole("button", { name: /Choose layout/i }).click();
    await page.getByRole("button", { name: "Two columns" }).click();
    await page.getByRole("button", { name: /Choose layout/i }).click();
    await expect(page.getByRole("button", { name: "Two columns" })).toHaveClass(/bg-zinc-900/);
  });

  test("add heading block", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    const addBlockBtn = page.getByRole("button", { name: /Add block \(main\)/i });
    await addBlockBtn.scrollIntoViewIfNeeded();
    await addBlockBtn.click({ timeout: 10000 });
    await page.getByRole("button", { name: "Heading" }).click({ timeout: 5000 });
    await expect(page.getByText("New heading")).toBeVisible({ timeout: 5000 });
  });

  test("footer Home link goes to site", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    await page.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("footer Admin link stays in admin", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    await page.getByRole("link", { name: "Admin" }).click();
    await expect(page).toHaveURL("/admin");
  });

  test("admin?page=blog shows blog content", async ({ page }) => {
    await page.goto("/admin?page=blog");
    await waitForAdminLoaded(page);
    await expect(page.getByRole("combobox")).toHaveValue("blog");
    await expect(page.locator("main").getByRole("heading").first()).toBeVisible({ timeout: 5000 });
  });

  test("admin?page=contact shows contact content", async ({ page }) => {
    await page.goto("/admin?page=contact");
    await waitForAdminLoaded(page);
    await expect(page.getByRole("combobox")).toHaveValue("contact");
    await expect(page.locator("main").getByRole("heading").first()).toBeVisible({ timeout: 5000 });
  });

  test("can pick three-column layout", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    await page.getByRole("button", { name: /Choose layout/i }).click();
    await page.getByRole("button", { name: "Three columns" }).click();
    await page.getByRole("button", { name: /Choose layout/i }).click();
    await expect(page.getByRole("button", { name: "Three columns" })).toHaveClass(/bg-zinc-900/);
  });

  test("can pick rockettheme layout", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    await page.getByRole("button", { name: /Choose layout/i }).click();
    await page.getByRole("button", { name: /RocketTheme-style/ }).click();
    await page.getByRole("button", { name: /Choose layout/i }).click();
    await expect(page.getByRole("button", { name: /RocketTheme-style/ })).toHaveClass(
      /bg-zinc-900/
    );
  });

  test("add block in left column when two-col in admin", async ({ page }) => {
    await page.goto("/admin");
    await waitForAdminLoaded(page);
    await page.getByRole("button", { name: /Choose layout/i }).click();
    await page.getByRole("button", { name: "Two columns" }).click();
    await expect(page.getByRole("button", { name: "Two columns" })).toHaveClass(/bg-zinc-900/, {
      timeout: 3000,
    });
    const addLeftBtn = page.getByRole("button", { name: /Add block \(left\)/i });
    await addLeftBtn.scrollIntoViewIfNeeded();
    await addLeftBtn.click({ timeout: 10000 });
    await page.getByRole("button", { name: "Paragraph" }).click({ timeout: 5000 });
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 5000 });
  });

  test("after save combobox still shows current page", async ({ page }) => {
    await page.goto("/admin?page=about");
    await waitForAdminLoaded(page);
    await expect(page.getByRole("combobox")).toHaveValue("about");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("combobox")).toHaveValue("about");
  });
});

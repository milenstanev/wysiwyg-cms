import { test, expect } from "@playwright/test";

test.describe("Admin", () => {
  test("has save, page dropdown and content", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("button", { name: /Save/i })).toBeVisible();
    await expect(page.getByRole("combobox")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hello from the CMS" })).toBeVisible({ timeout: 5000 });
  });

  test("edit about page, save, then see it on frontend", async ({ page }) => {
    await page.goto("/admin?page=about");
    const heading = page.getByRole("heading").nth(1);
    await heading.tripleClick();
    await page.keyboard.type("Edited via Admin E2E");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.goto("/about");
    await expect(page.getByText("Edited via Admin E2E")).toBeVisible();
  });

  test("page dropdown loads about content", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("combobox").selectOption("about");
    await expect(page.getByText("We build modern web experiences")).toBeVisible({ timeout: 10000 });
  });

  test("can flip through all pages in dropdown", async ({ page }) => {
    await page.goto("/admin");
    const combobox = page.getByRole("combobox");
    await combobox.selectOption("about");
    await expect(page.getByText("We build modern web experiences")).toBeVisible({ timeout: 5000 });
    await combobox.selectOption("blog");
    await expect(page.getByText("Latest Posts")).toBeVisible({ timeout: 5000 });
    await combobox.selectOption("contact");
    await expect(page.getByText("Get in Touch")).toBeVisible({ timeout: 5000 });
    await combobox.selectOption("home");
    await expect(page.getByText("Hello from the CMS")).toBeVisible({ timeout: 5000 });
  });

  test("can pick two-column layout", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Layout:")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Two columns" }).click();
    await expect(page.getByRole("button", { name: "Two columns" })).toHaveClass(/bg-zinc-900/);
  });

  test("add heading block", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByText("New heading")).toBeVisible({ timeout: 3000 });
  });

  test("footer Home link goes to site", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("footer Admin link stays in admin", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("link", { name: "Admin" }).click();
    await expect(page).toHaveURL("/admin");
  });

  test("admin?page=blog shows blog content", async ({ page }) => {
    await page.goto("/admin?page=blog");
    await expect(page.getByText("Latest Posts")).toBeVisible({ timeout: 5000 });
  });

  test("admin?page=contact shows contact content", async ({ page }) => {
    await page.goto("/admin?page=contact");
    await expect(page.getByText("Get in Touch")).toBeVisible({ timeout: 5000 });
  });

  test("can pick three-column layout", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Layout:")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Three columns" }).click();
    await expect(page.getByRole("button", { name: "Three columns" })).toHaveClass(/bg-zinc-900/);
  });

  test("can pick rockettheme layout", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Layout:")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /RocketTheme-style/ }).click();
    await expect(page.getByRole("button", { name: /RocketTheme-style/ })).toHaveClass(/bg-zinc-900/);
  });

  test("add block in left column when two-col in admin", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: "Two columns" }).click();
    await page.getByRole("button", { name: /Add block \(left\)/i }).click({ timeout: 3000 });
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });
  });

  test("after save combobox still shows current page", async ({ page }) => {
    await page.goto("/admin?page=about");
    await expect(page.getByRole("combobox")).toHaveValue("about");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("combobox")).toHaveValue("about");
  });
});

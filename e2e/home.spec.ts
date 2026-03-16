import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("shows welcome and edit button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Welcome")).toBeVisible();
    await expect(page.getByRole("button", { name: /Edit this page/i })).toBeVisible();
  });

  test("edit heading, save, content stays", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    const heading = page.getByRole("heading", { name: "Hello from the CMS" });
    await heading.tripleClick();
    await page.keyboard.type("Edited from page UI");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Edited from page UI")).toBeVisible();
  });

  test("click About goes to about page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /About Us/i }).first().click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole("heading", { name: "About Us" })).toBeVisible();
  });

  test("cancel leaves you in view mode", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Cancel/i }).click();
    await expect(page.getByRole("button", { name: /Edit this page/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Cancel/i })).not.toBeVisible();
  });

  test("can switch between single / two / three column in edit mode", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByText("Layout:")).toBeVisible();
    await page.getByRole("button", { name: "Two columns" }).click();
    await expect(page.getByRole("button", { name: "Two columns" })).toHaveClass(/bg-zinc-900/);
    await page.getByRole("button", { name: "Three columns" }).click();
    await expect(page.getByRole("button", { name: "Three columns" })).toHaveClass(/bg-zinc-900/);
  });

  test("add paragraph block shows up", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });
  });

  test("remove block reduces count", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    const removeBtns = page.getByTitle("Remove block");
    const n = await removeBtns.count();
    if (n > 0) {
      await removeBtns.first().click();
      await expect(removeBtns).toHaveCount(n - 1, { timeout: 2000 });
    }
  });

  test("edit mode shows Save and Cancel", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: /Save/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Cancel/i })).toBeVisible();
  });

  test("add heading then cancel — new block gone", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByText("New heading")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Cancel/i }).click();
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByText("New heading")).not.toBeVisible();
  });

  test("click Home in nav when on about", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("link", { name: "Home" }).first().click();
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Welcome")).toBeVisible();
  });
});

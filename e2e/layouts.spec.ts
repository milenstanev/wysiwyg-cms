import { test, expect } from "@playwright/test";

test.describe("Layouts", () => {
  test("can click through all four layout options", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    const layouts = ["Single column", "Two columns", "Three columns", "RocketTheme-style (complex)"];
    for (const name of layouts) {
      await page.getByRole("button", { name }).click();
      await expect(page.getByRole("button", { name })).toHaveClass(/bg-zinc-900/);
    }
  });

  test("two-col + save, reload shows left add block", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: "Two columns" }).click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("Welcome")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: /Add block \(left\)/i })).toBeVisible({ timeout: 3000 });
  });

  test("three-col + save, reload still has left and right", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: "Three columns" }).click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: /Add block \(left\)/i })).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole("button", { name: /Add block \(right\)/i })).toBeVisible({ timeout: 3000 });
  });

  test("rockettheme layout saves, main still editable after reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /RocketTheme-style/ }).click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByText("Layout:")).toBeVisible();
    await expect(page.locator("[data-module-position]").first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole("button", { name: /Add block \(main\)/i })).toBeVisible({ timeout: 3000 });
  });

  test("admin: set about to single column, save, frontend shows single", async ({ page }) => {
    await page.goto("/admin?page=about");
    await expect(page.getByText("Layout:")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Single column" }).click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "About Us" })).toBeVisible();
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: "Single column" })).toHaveClass(/bg-zinc-900/);
  });

  test("single column save and reload — no sidebar add buttons", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: "Single column" }).click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: /Add block \(left\)/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /Add block \(right\)/i })).not.toBeVisible();
  });

  test("two-col: add in left and main, save — both visible after reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: "Two columns" }).click();
    await page.getByRole("button", { name: /Add block \(left\)/i }).click({ timeout: 3000 });
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByText("New heading")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("New heading")).toBeVisible();
    await expect(page.getByText("New paragraph...")).toBeVisible();
  });

  test("admin: set blog to two-col, save, frontend has two columns", async ({ page }) => {
    await page.goto("/admin?page=blog");
    await expect(page.getByText("Layout:")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Two columns" }).click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.goto("/blog");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await expect(page.getByRole("button", { name: /Add block \(left\)/i })).toBeVisible({ timeout: 3000 });
  });

  test("rockettheme: add block in main, save, visible on reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /RocketTheme-style/ }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ timeout: 3000 });
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByText("New heading")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("New heading")).toBeVisible();
  });
});

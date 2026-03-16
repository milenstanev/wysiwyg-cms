import { test, expect } from "@playwright/test";

test.describe("Pages and navigation", () => {
  test("home shows Welcome", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Welcome")).toBeVisible();
  });

  test("about shows About Us heading", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "About Us" })).toBeVisible();
    await expect(page.getByText("We build modern web")).toBeVisible();
  });

  test("blog shows Blog heading", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
    await expect(page.getByText("Latest Posts")).toBeVisible();
  });

  test("contact shows Contact heading", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
    await expect(page.getByText("Get in Touch")).toBeVisible();
  });

  test("bad slug gives 404", async ({ page }) => {
    await page.goto("/no-such-page-xyz");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("Page not found")).toBeVisible();
  });

  test("404 has go home link", async ({ page }) => {
    await page.goto("/nope");
    await page.getByRole("link", { name: "Go home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("from home to blog to contact to home", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Blog/i }).first().click();
    await expect(page).toHaveURL(/\/blog/);
    await page.getByRole("link", { name: /Contact/i }).first().click();
    await expect(page).toHaveURL(/\/contact/);
    await page.getByRole("link", { name: "Home" }).first().click();
    await expect(page).toHaveURL("/");
  });

  test("footer on home has Admin link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
  });

  test("footer on about has Admin link", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
  });

  test("edit button on about", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("button", { name: /Edit this page/i })).toBeVisible();
  });

  test("edit button on blog", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("button", { name: /Edit this page/i })).toBeVisible();
  });

  test("edit button on contact", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("button", { name: /Edit this page/i })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("Pages and navigation", () => {
  test("home shows Welcome", async ({ page }) => {
    await page.goto("/");
    const welcomeHeading = page.getByRole("heading", { name: "Welcome" });
    await expect(welcomeHeading).toBeVisible();
  });

  test("about shows About Us heading", async ({ page }) => {
    await page.goto("/about");
    const aboutHeading = page.getByRole("heading", { name: "About Us" });
    await expect(aboutHeading).toBeVisible();
    const introText = page.getByText("We build modern web");
    await expect(introText).toBeVisible();
  });

  test("blog shows Blog heading", async ({ page }) => {
    await page.goto("/blog");
    const blogHeading = page.getByRole("heading", { name: "Blog" });
    await expect(blogHeading).toBeVisible();
    const latestPosts = page.getByText("Latest Posts");
    await expect(latestPosts).toBeVisible();
  });

  test("contact shows Contact heading", async ({ page }) => {
    await page.goto("/contact");
    const contactHeading = page.getByRole("heading", { name: "Contact" });
    await expect(contactHeading).toBeVisible();
    const getInTouch = page.getByText("Get in Touch");
    await expect(getInTouch).toBeVisible();
  });

  test("bad slug gives 404", async ({ page }) => {
    await page.goto("/no-such-page-xyz");
    const notFoundCode = page.getByText("404");
    await expect(notFoundCode).toBeVisible();
    const notFoundMessage = page.getByText("Page not found");
    await expect(notFoundMessage).toBeVisible();
  });

  test("404 has go home link", async ({ page }) => {
    await page.goto("/nope");
    const goHomeLink = page.getByRole("link", { name: "Go home" });
    await expect(goHomeLink).toBeVisible();
    await goHomeLink.click();
    await expect(page).toHaveURL("/");
  });

  test("from home to blog to contact to home", async ({ page }) => {
    await page.goto("/");
    const blogLink = page.getByRole("link", { name: /Blog/i }).first();
    await expect(blogLink).toBeVisible();
    await blogLink.click();
    await expect(page).toHaveURL(/\/blog/);
    const contactLink = page.getByRole("link", { name: /Contact/i }).first();
    await expect(contactLink).toBeVisible();
    await contactLink.click();
    await expect(page).toHaveURL(/\/contact/);
    const homeLink = page.getByRole("link", { name: "Home" }).first();
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL("/");
  });

  test("footer on home has Admin link", async ({ page }) => {
    await page.goto("/");
    const adminLink = page.getByRole("link", { name: "Admin" });
    await expect(adminLink).toBeVisible();
  });

  test("footer on about has Admin link", async ({ page }) => {
    await page.goto("/about");
    const adminLink = page.getByRole("link", { name: "Admin" });
    await expect(adminLink).toBeVisible();
  });

  test("edit button on about", async ({ page }) => {
    await page.goto("/about");
    const editPageButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editPageButton).toBeVisible();
  });

  test("edit button on blog", async ({ page }) => {
    await page.goto("/blog");
    const editPageButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editPageButton).toBeVisible();
  });

  test("edit button on contact", async ({ page }) => {
    await page.goto("/contact");
    const editPageButton = page.getByRole("button", { name: /Edit this page/i });
    await expect(editPageButton).toBeVisible();
  });
});

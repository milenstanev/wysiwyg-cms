import { test, expect } from "@playwright/test";

test.describe("Blocks", () => {
  test("heading: add, change text, save, reload shows new text", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByText("New heading")).toBeVisible({ timeout: 3000 });
    const heading = page.getByRole("heading", { name: "New heading" });
    await heading.tripleClick();
    await page.keyboard.type("E2E Heading Block");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByRole("heading", { name: "E2E Heading Block" })).toBeVisible({
      timeout: 5000,
    });
  });

  test("paragraph: add, type something, save, still there after reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });
    const p = page.locator("p").filter({ hasText: "New paragraph" });
    await p.click();
    await p.fill("Persisted paragraph from E2E.");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("Persisted paragraph from E2E.")).toBeVisible();
  });

  test("banner: add in admin, save, appears on home", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "Banner" }).click();
    await expect(page.getByText("Banner title")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.goto("/");
    await expect(page.getByText("Banner title")).toBeVisible();
  });

  test("list: add, save, items still there after reload", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "List" }).click();
    await expect(page.getByText("First item")).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("Second item")).toBeVisible();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("First item")).toBeVisible({ timeout: 5000 });
  });

  test("table: add, save, headers/cells on frontend", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "Table" }).click();
    await expect(page.getByText("Header 1")).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("Cell 1")).toBeVisible();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.goto("/");
    await expect(page.getByText("Header 1")).toBeVisible();
  });

  test("image: add and save — block appears", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "Image" }).click();
    await expect(page.getByPlaceholder("Image URL")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
  });

  test("showcase: add and save", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "Showcase" }).click();
    await expect(page.getByText("Feature title")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
  });

  test("add paragraph then remove it, save — gone after reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });
    const removeBtn = page.getByTitle("Remove block").last();
    await removeBtn.click();
    await expect(page.getByText("New paragraph...")).not.toBeVisible({ timeout: 2000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("New paragraph...")).not.toBeVisible();
  });

  test("move block down, save — order kept after reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByText("New heading")).toBeVisible({ timeout: 3000 });
    const moveDown = page.getByTitle("Move down").first();
    await moveDown.click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    const headings = page.getByRole("heading");
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("two-col: add block in left column, save, visible on reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: "Two columns" }).click();
    await page.getByRole("button", { name: /Add block \(left\)/i }).click({ timeout: 3000 });
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("New paragraph...")).toBeVisible();
  });

  test("edit about page title, save — new title on reload", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    const h1 = page.getByRole("heading", { level: 1 });
    await h1.tripleClick();
    await page.keyboard.type(" About Updated");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("About Updated");
  });

  test("add two paragraphs, save — both on reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Paragraph" }).click();
    const paras = page.locator("p").filter({ hasText: "New paragraph" });
    await expect(paras).toHaveCount(2, { timeout: 3000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.locator("p").filter({ hasText: "New paragraph" })).toHaveCount(2);
  });

  test("move block up, save — order kept", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByText("New heading")).toBeVisible({ timeout: 3000 });
    const moveUp = page.getByTitle("Move up").last();
    await moveUp.click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("New heading")).toBeVisible();
  });

  test("three-col: add block in right column, save, visible on reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: "Three columns" }).click();
    await page.getByRole("button", { name: /Add block \(right\)/i }).click({ timeout: 3000 });
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("New paragraph...")).toBeVisible();
  });

  test("remove block from left column when two-col", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: "Two columns" }).click();
    await page.getByRole("button", { name: /Add block \(left\)/i }).click({ timeout: 3000 });
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });
    const removeInLeft = page.locator(".layout-sidebar-left").getByTitle("Remove block");
    await removeInLeft.click();
    await expect(page.getByText("New paragraph...")).not.toBeVisible({ timeout: 2000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("New paragraph...")).not.toBeVisible();
  });

  test("edit banner title, save — new title on frontend", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "Banner" }).click();
    await expect(page.getByText("Banner title")).toBeVisible({ timeout: 3000 });
    const bannerTitle = page.getByText("Banner title");
    await bannerTitle.tripleClick();
    await page.keyboard.type(" Custom Banner");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.goto("/");
    await expect(page.getByText("Banner title Custom Banner")).toBeVisible();
  });

  test("edit list item, save — text on frontend", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "List" }).click();
    await expect(page.getByText("First item")).toBeVisible({ timeout: 3000 });
    const first = page.getByText("First item");
    await first.tripleClick();
    await page.keyboard.type(" E2E edited");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("First item E2E edited")).toBeVisible({ timeout: 5000 });
  });

  test("edit showcase title, save", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "Showcase" }).click();
    await expect(page.getByText("Feature title")).toBeVisible({ timeout: 3000 });
    const title = page.getByText("Feature title");
    await title.tripleClick();
    await page.keyboard.type(" Edited");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("Feature title Edited")).toBeVisible({ timeout: 5000 });
  });

  test("add heading on blog page, save, visible on reload", async ({ page }) => {
    await page.goto("/blog");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Heading" }).click();
    await expect(page.getByText("New heading")).toBeVisible({ timeout: 3000 });
    const h = page.getByRole("heading", { name: "New heading" });
    await h.tripleClick();
    await page.keyboard.type(" Blog E2E");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("New heading Blog E2E")).toBeVisible();
  });

  test("add paragraph on contact page, save", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: /Edit this page/i }).click();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText("New paragraph...")).toBeVisible();
  });
});

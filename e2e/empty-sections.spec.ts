import { test, expect } from "@playwright/test";
import type { Page as CmsPage } from "../src/lib/cms/types";

/**
 * Empty layout sections must disappear; remaining columns adapt (view mode).
 */
test.describe("Empty sections collapse", () => {
  test("about (single, no modules): no rockettheme module chrome", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "About Us" })).toBeVisible({ timeout: 10000 });
    await expect(page.locator("[data-module-position]")).toHaveCount(0);
    await expect(page.locator(".rockettheme-utility")).toHaveCount(0);
  });

  test("home rockettheme: only positions with content appear", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible({ timeout: 10000 });

    await expect(page.locator('[data-module-position="utility-a"]')).toBeVisible();
    await expect(page.locator('[data-module-position="header"]')).toBeVisible();

    const rows = page.locator("[data-template-row]");
    const count = await rows.count();
    expect(count).toBeGreaterThan(1);

    for (let i = 0; i < count; i++) {
      const visible = await rows.nth(i).getAttribute("data-visible-count");
      expect(Number(visible), `row ${i} visible count`).toBeGreaterThan(0);
    }
  });

  test("view mode: empty module is omitted and utility row adapts", async ({ page, request }) => {
    const res = await request.get("/api/content/home");
    expect(res.ok()).toBeTruthy();
    const original = (await res.json()) as CmsPage;
    const savedUtilityC = original.positionBlocks?.["utility-c"] ?? [];

    const cleared: CmsPage = {
      ...original,
      positionBlocks: {
        ...(original.positionBlocks ?? {}),
        "utility-c": [],
      },
    };

    const put = await request.put("/api/content/home", { data: cleared });
    expect(put.ok()).toBeTruthy();

    try {
      await page.goto("/");
      await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-module-position="utility-c"]')).toHaveCount(0);

      const utilityRow = page.locator(".rockettheme-utility");
      await expect(utilityRow).toBeVisible();
      const visible = await utilityRow.getAttribute("data-visible-count");
      expect(Number(visible)).toBe(2);
      await expect(page.locator('[data-module-position="utility-a"]')).toBeVisible();
      await expect(page.locator('[data-module-position="utility-b"]')).toBeVisible();
    } finally {
      await request.put("/api/content/home", {
        data: {
          ...original,
          positionBlocks: {
            ...(original.positionBlocks ?? {}),
            "utility-c": savedUtilityC,
          },
        },
      });
    }
  });
});

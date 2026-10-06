import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";

/**
 * Edit-mode block sizing: content-sized stack (no fixed RGL heights).
 * Height-only types stay full column width; content must not clip.
 */

test.describe("Block sizing in edit mode", () => {
  test("heading block: full width, content not clipped", async ({ page }) => {
    await page.goto("/?edit=1");
    const headingBlock = page
      .getByTestId(TEST_ID.contentBlock)
      .filter({ has: page.getByRole("heading") })
      .first();
    await expect(headingBlock).toBeVisible({ timeout: 10000 });

    const result = await headingBlock.evaluate((el) => {
      const body = el.querySelector(".block-body") as HTMLElement | null;
      const parent = el.closest("[data-page-renderer]") as HTMLElement | null;
      const itemH = el.getBoundingClientRect().height;
      const bodyH = body?.scrollHeight ?? 0;
      const itemW = el.getBoundingClientRect().width;
      const parentW = parent?.getBoundingClientRect().width ?? itemW;
      return {
        clipped: itemH + 2 < bodyH,
        fullWidth: itemW >= parentW * 0.5,
        itemH,
        bodyH,
      };
    });
    expect(result.clipped).toBe(false);
    expect(result.fullWidth).toBe(true);
  });

  test("paragraph block: content-sized height, no clip", async ({ page }) => {
    await page.goto("/?edit=1");
    await page.getByRole("button", { name: /Add block \(main\)/i }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /Add block \(main\)/i }).click({ force: true });
    await page.getByRole("button", { name: "Paragraph" }).click();
    await expect(page.getByText("New paragraph...")).toBeVisible({ timeout: 3000 });

    const block = page.getByTestId(TEST_ID.contentBlock).filter({ hasText: "New paragraph" }).first();
    const clipped = await block.evaluate((el) => {
      const body = el.querySelector(".block-body") as HTMLElement | null;
      if (!body) return true;
      return el.getBoundingClientRect().height + 2 < body.scrollHeight;
    });
    expect(clipped).toBe(false);
  });

  test("edit stack has no fixed inline heights on blocks", async ({ page }) => {
    await page.goto("/?edit=1");
    await expect(page.getByTestId(TEST_ID.blockStack).first()).toBeVisible({ timeout: 10000 });
    const fixed = await page.getByTestId(TEST_ID.contentBlock).evaluateAll((els) =>
      els.filter((el) => el.style.height && el.style.height !== "auto").length
    );
    expect(fixed).toBe(0);
  });
});

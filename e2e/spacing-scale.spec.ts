import { test, expect } from "@playwright/test";
import { TEST_ID, testIdSelector } from "../src/lib/test-ids";

/**
 * Spacing best practices from the web-design skill / 8pt research:
 * - One 8pt scale only (4…96px)
 * - Semantic aliases resolve to that scale
 * - Page chrome: header→title and title→content on the scale, each from one source
 * - Proximity ladder: heading→its content (12) < block→block (24) < section / before heading (32)
 * - Blocks are flat inside their region card (no nested card per block)
 * - Prose capped at a readable measure (45–75 characters)
 */

const SCALE_PX = {
  "--space-1": 4,
  "--space-2": 8,
  "--space-3": 12,
  "--space-4": 16,
  "--space-5": 24,
  "--space-6": 32,
  "--space-7": 48,
  "--space-8": 64,
  "--space-9": 96,
} as const;

test.describe("Suitable spacings (8pt research)", () => {
  test("CSS 8pt scale tokens resolve to expected pixel steps", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible({ timeout: 10000 });

    const tokens = await page.evaluate((keys) => {
      const styles = getComputedStyle(document.documentElement);
      const out: Record<string, number> = {};
      for (const key of keys) {
        // Resolve via a probe so var() aliases compute to px
        const el = document.createElement("div");
        el.style.width = `var(${key})`;
        document.body.appendChild(el);
        out[key] = Math.round(parseFloat(getComputedStyle(el).width));
        el.remove();
      }
      // Also raw custom property strings for documentation
      out.__rootFontSize = Math.round(parseFloat(styles.fontSize));
      return out;
    }, Object.keys(SCALE_PX));

    expect(tokens.__rootFontSize).toBe(16);
    for (const [key, expected] of Object.entries(SCALE_PX)) {
      expect(tokens[key], key).toBe(expected);
    }
  });

  test("layout aliases map onto the 8pt scale", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible({ timeout: 10000 });

    const aliases = await page.evaluate(() => {
      const probe = (expr: string) => {
        const el = document.createElement("div");
        el.style.width = expr;
        document.body.appendChild(el);
        const w = Math.round(parseFloat(getComputedStyle(el).width));
        el.remove();
        return w;
      };
      return {
        layoutGapSm: probe("var(--layout-gap-sm)"),
        layoutGapMd: probe("var(--layout-gap-md)"),
        layoutGapLg: probe("var(--layout-gap-lg)"),
        layoutGapXl: probe("var(--layout-gap-xl)"),
        pageVertical: probe("var(--page-vertical-padding)"),
        pageHeaderGap: probe("var(--page-header-gap)"),
        pageTitleGap: probe("var(--page-title-gap)"),
        sectionGap: probe("var(--section-gap)"),
        blockGap: probe("var(--block-gap)"),
        headingGap: probe("var(--heading-gap)"),
        cardPadding: probe("var(--card-padding)"),
        footerGap: probe("var(--footer-gap)"),
      };
    });

    // Aliases → scale steps (editorial bumps header/title gaps)
    expect(aliases.layoutGapSm).toBe(16); // space-4
    expect(aliases.layoutGapMd).toBe(24); // space-5
    expect(aliases.layoutGapLg).toBe(32); // space-6
    expect(aliases.layoutGapXl).toBe(48); // space-7
    expect(aliases.pageVertical).toBe(24);
    expect(aliases.sectionGap).toBe(32);
    expect(aliases.blockGap).toBe(24);
    expect(aliases.headingGap).toBe(12);
    expect(aliases.cardPadding).toBe(24);
    expect(aliases.footerGap).toBe(48);

    // Research ranges: header gap 32–48, title gap 32–48 (editorial uses the upper step)
    expect(aliases.pageHeaderGap).toBeGreaterThanOrEqual(32);
    expect(aliases.pageHeaderGap).toBeLessThanOrEqual(48);
    expect(aliases.pageTitleGap).toBeGreaterThanOrEqual(32);
    expect(aliases.pageTitleGap).toBeLessThanOrEqual(48);

    // Proximity ladder: heading → content < block → block < section ≤ title → content
    expect(aliases.headingGap).toBeLessThan(aliases.blockGap);
    expect(aliases.blockGap).toBeLessThan(aliases.sectionGap);
    expect(aliases.sectionGap).toBeLessThanOrEqual(aliases.pageTitleGap);
  });

  test("page chrome: title margin and header gap use token rhythm", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible({ timeout: 10000 });

    const chrome = await page.evaluate(() => {
      const header = document.querySelector(".site-header") as HTMLElement | null;
      const title = document.querySelector(".page-title") as HTMLElement | null;
      const content = document.querySelector(".page-content") as HTMLElement | null;
      if (!header || !title || !content) return null;

      const headerStyle = getComputedStyle(header);
      const titleStyle = getComputedStyle(title);
      const contentStyle = getComputedStyle(content);

      const probe = (expr: string) => {
        const el = document.createElement("div");
        el.style.width = expr;
        document.body.appendChild(el);
        const w = Math.round(parseFloat(getComputedStyle(el).width));
        el.remove();
        return w;
      };

      const next = title.nextElementSibling as HTMLElement | null;
      return {
        headerMarginBottom: Math.round(parseFloat(headerStyle.marginBottom)),
        titleToContent: next
          ? Math.round(next.getBoundingClientRect().top - title.getBoundingClientRect().bottom)
          : -1,
        contentGap: Math.round(parseFloat(contentStyle.gap || "0")),
        tokenHeaderGap: probe("var(--page-header-gap)"),
        tokenTitleGap: probe("var(--page-title-gap)"),
        tokenSectionGap: probe("var(--section-gap)"),
      };
    });

    expect(chrome).not.toBeNull();
    expect(chrome!.headerMarginBottom).toBe(chrome!.tokenHeaderGap);
    expect(chrome!.contentGap).toBe(chrome!.tokenSectionGap);

    // Title → content is exactly --page-title-gap (margin + flex gap don't stack past the token)
    expect(Math.abs(chrome!.titleToContent - chrome!.tokenTitleGap)).toBeLessThanOrEqual(1);
    expect(chrome!.titleToContent).toBeLessThanOrEqual(48);
    expect(chrome!.headerMarginBottom).toBeLessThanOrEqual(48);
  });

  test("block stack gap matches token; blocks are flat inside the region card", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId(TEST_ID.blockStack).first()).toBeVisible({ timeout: 10000 });

    const spacing = await page.evaluate(() => {
      const stack = document.querySelector(".block-stack") as HTMLElement | null;
      const body = document.querySelector(".block-body") as HTMLElement | null;
      const card = document.querySelector(".layout-content-card") as HTMLElement | null;

      const probe = (expr: string) => {
        const el = document.createElement("div");
        el.style.width = expr;
        document.body.appendChild(el);
        const w = Math.round(parseFloat(getComputedStyle(el).width));
        el.remove();
        return w;
      };

      const stackGap = stack ? Math.round(parseFloat(getComputedStyle(stack).gap || "0")) : -1;
      const bodyPad = body
        ? {
            t: Math.round(parseFloat(getComputedStyle(body).paddingTop)),
            r: Math.round(parseFloat(getComputedStyle(body).paddingRight)),
            b: Math.round(parseFloat(getComputedStyle(body).paddingBottom)),
            l: Math.round(parseFloat(getComputedStyle(body).paddingLeft)),
          }
        : null;
      const cardPad = card ? Math.round(parseFloat(getComputedStyle(card).paddingTop)) : -1;
      const block = document.querySelector(".layout-content-card .content-block") as HTMLElement | null;
      const blockStyle = block ? getComputedStyle(block) : null;

      return {
        stackGap,
        bodyPad,
        cardPad,
        blockBorder: blockStyle ? Math.round(parseFloat(blockStyle.borderTopWidth)) : -1,
        blockShadow: blockStyle?.boxShadow ?? "",
        blockGap: probe("var(--block-gap)"),
        cardPadding: probe("var(--card-padding)"),
      };
    });

    expect(spacing.stackGap).toBe(spacing.blockGap);
    expect(spacing.stackGap).toBe(24);
    expect(spacing.bodyPad).toEqual({ t: 0, r: 0, b: 0, l: 0 });
    expect(spacing.blockBorder).toBe(0);
    expect(spacing.blockShadow).toBe("none");
    expect(spacing.cardPad).toBe(spacing.cardPadding);
    expect(spacing.cardPad).toBe(24);
  });

  for (const mode of ["view", "edit"] as const) {
    test(`proximity ladder between stacked main blocks (${mode})`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(mode === "edit" ? "/about?edit=1" : "/about");
      const mainStack = page.locator(".layout-content-card .block-stack");
      await expect(mainStack).toBeVisible({ timeout: 10000 });
      if (mode === "edit") await expect(page.getByTestId(TEST_ID.editorBar)).toBeVisible();

      const pairs = await mainStack.locator(testIdSelector(TEST_ID.contentBlock)).evaluateAll((els) => {
        const out: { from: string; to: string; gap: number }[] = [];
        for (let i = 1; i < els.length; i++) {
          out.push({
            from: els[i - 1].getAttribute("data-block-type") ?? "",
            to: els[i].getAttribute("data-block-type") ?? "",
            gap: Math.round(els[i].getBoundingClientRect().top - els[i - 1].getBoundingClientRect().bottom),
          });
        }
        return out;
      });

      expect(pairs.length).toBeGreaterThan(0);
      expect(pairs.some((p) => p.from === "heading")).toBe(true);
      for (const { from, to, gap } of pairs) {
        const expected = from === "heading" ? 12 : to === "heading" ? 32 : 24;
        expect(Math.abs(gap - expected), `${from}→${to} gap ${gap}, expected ${expected}`).toBeLessThanOrEqual(1);
      }
    });
  }

  test("body prose stays within a readable measure (≤ 75 characters per line)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/blog");
    await expect(page.locator(".page-title")).toBeVisible({ timeout: 10000 });

    const chars = await page.locator(".layout-content-card .block-body p").evaluateAll((els) =>
      els.map((p) => {
        const probe = document.createElement("span");
        probe.textContent = "0";
        p.appendChild(probe);
        const ch = probe.getBoundingClientRect().width;
        probe.remove();
        return Math.round(p.getBoundingClientRect().width / ch);
      })
    );

    expect(chars.length).toBeGreaterThan(0);
    for (const c of chars) expect(c, `line measure ${c}ch`).toBeLessThanOrEqual(75);
  });
});

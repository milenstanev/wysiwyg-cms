import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { TEST_ID, testIdSelector } from "../src/lib/test-ids";

/**
 * Accessibility gate (WCAG 2.2 AA + axe best practices) for every page, in view AND edit mode,
 * in every theme. Read-only: nothing here saves to the database.
 *
 * Automated (axe-core): contrast, names/labels, landmarks, heading order, ARIA validity,
 * target size, alt text, lang, duplicate ids, …
 * Behavioural (this file): skip link, visible + unobscured focus, Escape dismisses overlays,
 * focus moves into / back from dropdowns, reflow at 320px, text spacing, reduced motion.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const THEMES = [
  "editorial",
  "pebble",
  "atelier",
  "harbor",
  "nord",
  "ink",
  "gallery",
];
const SITE_PAGES = [
  { path: "/", title: "Welcome" },
  { path: "/about", title: "About Us" },
  { path: "/blog", title: "Blog" },
  { path: "/contact", title: "Contact" },
];

async function open(page: Page, path: string, mode: "view" | "edit") {
  await page.goto(mode === "edit" ? `${path}${path.includes("?") ? "&" : "?"}edit=1` : path);
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  if (mode === "edit") await expect(page.getByTestId(TEST_ID.editorBar)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function setTheme(page: Page, theme: string) {
  await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
  // Let the 220ms colour transition on <body> finish before contrast is measured
  await page.waitForTimeout(300);
}

/** Runs axe and fails with one readable line per violating node. */
async function expectNoAxeViolations(page: Page, context: string, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  const lines = violations.flatMap((v) =>
    v.nodes.map(
      (n) =>
        `[${v.impact}] ${v.id}: ${v.help}\n    at ${n.target.join(" ")}\n    ${(n.failureSummary ?? "").replace(/\s+/g, " ").slice(0, 240)}`
    )
  );
  expect(lines, `${context}\n${lines.join("\n")}`).toEqual([]);
}

test.describe("axe: WCAG 2.2 AA in every page, mode and theme", () => {
  for (const { path } of SITE_PAGES) {
    for (const mode of ["view", "edit"] as const) {
      test(`${path} (${mode})`, async ({ page }) => {
        await open(page, path, mode);
        for (const theme of THEMES) {
          await setTheme(page, theme);
          await expectNoAxeViolations(page, `${path} ${mode} ${theme}`);
        }
      });
    }
  }

  test("/admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByTestId(TEST_ID.adminLoaded)).toBeVisible({ timeout: 10000 });
    for (const theme of THEMES) {
      await setTheme(page, theme);
      await expectNoAxeViolations(page, `/admin ${theme}`);
    }
  });

  test("404 page", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-a11y");
    await expect(page.locator("h1")).toBeVisible();
    for (const theme of THEMES) {
      await setTheme(page, theme);
      await expectNoAxeViolations(page, `404 ${theme}`);
    }
  });
});

test.describe("axe: overlays open in edit mode", () => {
  test("block actions popover", async ({ page }) => {
    await open(page, "/", "edit");
    const unit = page.locator(`.layout-content-card ${testIdSelector(TEST_ID.blockEditUnit)}`).first();
    await unit.getByTestId(TEST_ID.blockControlsTrigger).hover();
    await expect(unit.getByTestId(TEST_ID.blockControlsMenu)).toBeVisible();
    await expectNoAxeViolations(page, "block popover open");
  });

  test("add-block dropdown, layout dropdown, block settings and empty-sections menu", async ({ page }) => {
    await open(page, "/about", "edit");

    await page.getByRole("button", { name: /Add block \(main\)/i }).click();
    await expect(page.getByRole("button", { name: "Paragraph" })).toBeVisible();
    await expectNoAxeViolations(page, "add-block dropdown open");
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Choose layout" }).click();
    await expect(page.getByTestId(TEST_ID.layoutDropdown)).toBeVisible();
    await expectNoAxeViolations(page, "layout dropdown open");
    await page.keyboard.press("Escape");

    const heading = page
      .locator(`.layout-content-card ${testIdSelector(TEST_ID.blockEditUnit)}`)
      .filter({ has: page.locator("h2") })
      .first();
    await heading.getByTestId(TEST_ID.blockControlsTrigger).hover();
    await heading.getByRole("button", { name: "Block settings" }).click();
    await expect(page.getByLabel(/Heading level/i)).toBeVisible();
    await expectNoAxeViolations(page, "block settings open");
    await page.keyboard.press("Escape");

    const sections = page.getByTestId(TEST_ID.emptySectionsMenu);
    if (await sections.count()) {
      await sections.getByRole("button").first().hover();
      await expectNoAxeViolations(page, "empty sections menu open");
    }
  });
});

test.describe("Keyboard", () => {
  test("first Tab reaches a visible skip link that moves focus to <main>", async ({ page }) => {
    await open(page, "/about", "view");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    const box = await skip.boundingBox();
    expect(box && box.y >= 0 && box.height > 0, "skip link is on screen when focused").toBe(true);
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();
  });

  for (const mode of ["view", "edit"] as const) {
    test(`every Tab stop shows a visible, unobscured focus indicator (${mode})`, async ({ page }) => {
      await open(page, "/about", mode);
      const seen = new Set<string>();
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          const cx = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
          const cy = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
          const top = document.elementFromPoint(cx, cy);
          return {
            key: `${el.tagName}:${el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 30)}`,
            ring:
              (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2) ||
              (cs.boxShadow !== "none" && cs.boxShadow !== ""),
            onScreen: r.bottom > 0 && r.top < innerHeight && r.width > 0 && r.height > 0,
            obscured: !!top && !el.contains(top) && !top.contains(el),
            by: top ? `${top.tagName}.${String(top.className).slice(0, 40)}` : "",
          };
        });
        if (!info) continue;
        if (seen.has(info.key)) break;
        seen.add(info.key);
        expect(info.ring, `${mode}: ${info.key} has no visible focus indicator`).toBe(true);
        expect(info.onScreen, `${mode}: ${info.key} is focused off screen`).toBe(true);
        expect(info.obscured, `${mode}: ${info.key} is covered by ${info.by}`).toBe(false);
      }
      expect(seen.size).toBeGreaterThan(5);
    });
  }

  test("Escape dismisses the block popover and returns focus to its chip (WCAG 1.4.13)", async ({ page }) => {
    await open(page, "/about", "edit");
    const unit = page.locator(`.layout-content-card ${testIdSelector(TEST_ID.blockEditUnit)}`).first();
    const chip = unit.getByTestId(TEST_ID.blockControlsTrigger);
    const menu = unit.getByTestId(TEST_ID.blockControlsMenu);

    await chip.focus();
    await expect(menu).toBeVisible();
    await expect(chip).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Tab");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(chip).toBeFocused();
    await expect(chip).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Enter");
    await expect(menu).toBeVisible();

    await chip.hover();
    await page.keyboard.press("Escape");
    await expect(menu, "hover popover is dismissible without moving the pointer").toBeHidden();
  });

  test("dropdowns move focus into the panel; Escape closes and restores focus", async ({ page }) => {
    await open(page, "/about", "edit");

    const add = page.getByRole("button", { name: /Add block \(main\)/i });
    await add.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Heading" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Heading" })).toHaveCount(0);
    await expect(add).toBeFocused();

    const layout = page.getByRole("button", { name: "Choose layout" });
    await layout.focus();
    await page.keyboard.press("Enter");
    await expect(layout).toHaveAttribute("aria-expanded", "true");
    const panel = page.getByTestId(TEST_ID.layoutDropdown);
    await expect(panel.locator(":focus")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(layout).toBeFocused();
  });
});

test.describe("Structure", () => {
  for (const { path, title } of SITE_PAGES) {
    for (const mode of ["view", "edit"] as const) {
      test(`${path} (${mode}): one h1, one of each landmark, lang, title, live region`, async ({ page }) => {
        await open(page, path, mode);
        const s = await page.evaluate(() => ({
          h1: [...document.querySelectorAll("h1")].map((h) => h.textContent?.trim()),
          main: document.querySelectorAll("main, [role=main]").length,
          banner: document.querySelectorAll("body > * header:not(main header):not(article header)").length,
          contentinfo: document.querySelectorAll("footer:not(main footer):not(article footer)").length,
          lang: document.documentElement.lang,
          docTitle: document.title,
          status: document.querySelectorAll("[role=status]").length,
        }));
        expect(s.h1, "exactly one h1: the page title").toEqual([title]);
        expect(s.main).toBe(1);
        expect(s.banner).toBe(1);
        expect(s.contentinfo).toBe(1);
        expect(s.lang).not.toBe("");
        expect(s.docTitle).not.toBe("");
        if (mode === "edit") expect(s.status, "save status live region is mounted").toBeGreaterThan(0);
      });
    }
  }
});

test.describe("Adaptable layout", () => {
  for (const mode of ["view", "edit"] as const) {
    test(`reflow at 320px: no horizontal scrolling (WCAG 1.4.10, ${mode})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      for (const { path } of SITE_PAGES) {
        await open(page, path, mode);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow, `${path} ${mode} scrolls horizontally by ${overflow}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("text spacing overrides do not cause overflow (WCAG 1.4.12)", async ({ page }) => {
    for (const { path } of SITE_PAGES) {
      await open(page, path, "view");
      await page.addStyleTag({
        content:
          "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${path} overflows by ${overflow}px with text spacing`).toBeLessThanOrEqual(0);
    }
  });

  test("prefers-reduced-motion disables transitions and animations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "/", "view");
    const durations = await page.evaluate(() =>
      [document.body, ...document.querySelectorAll(".edit-chip, .site-header, a, button")]
        .slice(0, 40)
        .map((el) => parseFloat(getComputedStyle(el).transitionDuration) * 1000)
    );
    for (const ms of durations) expect(ms).toBeLessThanOrEqual(1);
  });
});

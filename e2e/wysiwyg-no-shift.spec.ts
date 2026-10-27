import { test, expect, type Page } from "@playwright/test";
import { TEST_ID, testIdSelector } from "../src/lib/test-ids";

/**
 * WYSIWYG: toggling edit mode must not move content by even one pixel.
 * Edit chrome (block "⋯" chips, region "+", empty-section menu, editor bar) is absolutely / fixed
 * positioned overlay, so every content box keeps its exact view-mode geometry.
 */

const PAGES = [
  { path: "/", heading: "Welcome" },
  { path: "/about", heading: "About Us" },
  { path: "/contact", heading: "Contact" },
];

const THEMES = [
  "editorial",
  "pebble",
  "atelier",
  "harbor",
  "nord",
  "ink",
  "gallery",
];

const CHROME = ".edit-popover, .block-region-add, .editor-bar";

type Box = { key: string; x: number; y: number; w: number; h: number };

/** Document-relative boxes for the header, every layout region, block card and text element. */
async function measure(page: Page): Promise<Box[]> {
  const blockStackSel = testIdSelector(TEST_ID.blockStack);
  const contentBlockSel = testIdSelector(TEST_ID.contentBlock);
  return page.evaluate(
    ({ blockStackSel, contentBlockSel }) => {
      const selectors = [
        "[data-page-header]",
        "[data-page-renderer]",
        ".page-title",
        "[data-template-row]",
        "[data-module-position]",
        ".layout-content-card",
        "aside",
        blockStackSel,
        contentBlockSel,
        "[data-block-body]",
        "[data-block-body] :is(h1,h2,h3,p,li,span,th,td,img,table)",
        "[data-empty-blocks]",
        "[data-page-footer]",
      ];
      const out: { key: string; x: number; y: number; w: number; h: number }[] = [];
      // Sticky elements move with scroll by design; measure their in-flow box (static has the same flow)
      const sticky = [...document.querySelectorAll<HTMLElement>("body *")].filter(
        (el) => getComputedStyle(el).position === "sticky"
      );
      sticky.forEach((el) => (el.style.position = "static"));
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((el, i) => {
          const r = el.getBoundingClientRect();
          out.push({
            key: `${sel}#${i}`,
            x: r.left + window.scrollX,
            y: r.top + window.scrollY,
            w: r.width,
            h: r.height,
          });
        });
      }
      sticky.forEach((el) => (el.style.position = ""));
      return out;
    },
    { blockStackSel, contentBlockSel }
  );
}

function maxShift(view: Box[], edit: Box[]) {
  expect(edit.map((b) => b.key), "same set of content boxes in view and edit").toEqual(
    view.map((b) => b.key)
  );
  let worst = { key: "", delta: 0 };
  view.forEach((v, i) => {
    const e = edit[i];
    const delta = Math.max(
      Math.abs(v.x - e.x),
      Math.abs(v.y - e.y),
      Math.abs(v.w - e.w),
      Math.abs(v.h - e.h)
    );
    if (delta > worst.delta) worst = { key: v.key, delta };
  });
  return worst;
}

async function settle(page: Page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  );
}

async function enterEdit(page: Page) {
  const editPageButton = page.getByTestId(TEST_ID.editPageButton);
  await expect(editPageButton).toBeVisible();
  await editPageButton.click();
  const editorBar = page.getByTestId(TEST_ID.editorBar);
  await expect(editorBar).toBeVisible();
  await settle(page);
}

async function leaveEdit(page: Page) {
  const cancelButton = page.getByRole("button", { name: "Cancel editing" });
  await expect(cancelButton).toBeVisible();
  await cancelButton.click();
  const editorBar = page.getByTestId(TEST_ID.editorBar);
  await expect(editorBar).toHaveCount(0);
  await settle(page);
}

function welcomeHeading(page: Page) {
  return page.getByRole("heading", { name: "Welcome", level: 1 });
}

async function setTheme(page: Page, theme: string) {
  await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
  await settle(page);
}

test.describe("WYSIWYG: content does not move between view and edit", () => {
  for (const { path, heading } of PAGES) {
    test(`${path}: every content box is identical in view and edit (0px)`, async ({ page }) => {
      await page.goto(path);
      const pageHeading = page.getByRole("heading", { name: heading, level: 1 });
      await expect(pageHeading).toBeVisible();
      await settle(page);

      const view = await measure(page);
      expect(view.length).toBeGreaterThan(5);

      await enterEdit(page);
      const edit = await measure(page);
      const worst = maxShift(view, edit);
      expect(worst.delta, `largest shift at ${worst.key}`).toBe(0);

      await leaveEdit(page);
      const back = await measure(page);
      expect(maxShift(view, back).delta).toBe(0);
    });
  }

  test("home: identical in every theme", async ({ page }) => {
    await page.goto("/");
    const welcome = welcomeHeading(page);
    await expect(welcome).toBeVisible();
    for (const theme of THEMES) {
      await setTheme(page, theme);
      const view = await measure(page);
      await enterEdit(page);
      const worst = maxShift(view, await measure(page));
      expect(worst.delta, `${theme}: largest shift at ${worst.key}`).toBe(0);
      await leaveEdit(page);
    }
  });

  for (const viewport of [
    { name: "phone", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "wide desktop", width: 1440, height: 900 },
  ]) {
    test(`home on ${viewport.name} (${viewport.width}px): identical in view and edit`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");
      const welcome = welcomeHeading(page);
      await expect(welcome).toBeVisible();
      await settle(page);
      const view = await measure(page);
      await enterEdit(page);
      const worst = maxShift(view, await measure(page));
      expect(worst.delta, `largest shift at ${worst.key}`).toBe(0);
    });
  }

  test("home: <main> is pixel-identical once overlay chrome is hidden", async ({ page }, testInfo) => {
    await page.goto("/");
    const welcome = welcomeHeading(page);
    await expect(welcome).toBeVisible();
    await settle(page);
    const main = page.locator("[data-page-main]");
    // The sticky header overlays <main> while a tall element is captured; its geometry is covered above
    const hideHeader = await page.addStyleTag({
      content: `[data-page-header] { visibility: hidden !important; }`,
    });
    const viewShot = await main.screenshot({ animations: "disabled" });
    await hideHeader.evaluate((el) => el.remove());

    await enterEdit(page);
    const hide = await page.addStyleTag({
      content: `${CHROME}, [data-page-header] { visibility: hidden !important; }`,
    });
    const editShot = await main.screenshot({ animations: "disabled" });
    await hide.evaluate((el) => el.remove());

    await testInfo.attach("view-main.png", { body: viewShot, contentType: "image/png" });
    await testInfo.attach("edit-main-chrome-hidden.png", { body: editShot, contentType: "image/png" });
    await testInfo.attach("edit-main-with-chrome.png", {
      body: await main.screenshot(),
      contentType: "image/png",
    });

    expect(Buffer.compare(viewShot, editShot), "view and edit pixels differ").toBe(0);
  });
});

test.describe("Edit controls: small chip + hover popover", () => {
  test("view mode renders no edit chrome at all", async ({ page }) => {
    await page.goto("/");
    const welcome = welcomeHeading(page);
    await expect(welcome).toBeVisible();
    const editChrome = page.locator(CHROME);
    await expect(editChrome).toHaveCount(0);
    const blockControlsTrigger = page.getByTestId(TEST_ID.blockControlsTrigger);
    await expect(blockControlsTrigger).toHaveCount(0);
  });

  test("each block gets one small chip outside the card; menu hidden until hover", async ({
    page,
  }) => {
    await page.goto("/");
    await enterEdit(page);

    const units = page.getByTestId(TEST_ID.blockEditUnit);
    const count = await units.count();
    expect(count).toBeGreaterThan(3);

    for (let i = 0; i < count; i++) {
      const info = await units.nth(i).evaluate(
        (unit, sels) => {
          const chip = unit.querySelector(sels.trigger)!;
          const card = unit.querySelector(sels.content)!;
          const r = chip.getBoundingClientRect();
          const menu = unit.querySelector(sels.menu)!;
          return {
            insideCard: card.contains(chip),
            position: getComputedStyle(chip.closest(".edit-popover")!).position,
            size: Math.max(r.width, r.height),
            menuVisibility: getComputedStyle(menu).visibility,
          };
        },
        {
          trigger: testIdSelector(TEST_ID.blockControlsTrigger),
          content: testIdSelector(TEST_ID.contentBlock),
          menu: testIdSelector(TEST_ID.blockControlsMenu),
        }
      );
      expect(info.insideCard, `unit ${i}: chip inside content-block`).toBe(false);
      expect(info.position, `unit ${i}: chip must be out of flow`).toBe("absolute");
      expect(info.size, `unit ${i}: chip should be small`).toBeLessThanOrEqual(32);
      expect(info.menuVisibility, `unit ${i}: menu hidden before hover`).toBe("hidden");
    }
  });

  test("hovering the chip shows every control, and content still does not move", async ({
    page,
  }) => {
    await page.goto("/");
    const welcome = welcomeHeading(page);
    await expect(welcome).toBeVisible();
    await settle(page);
    const view = await measure(page);
    await enterEdit(page);

    const unit = page.locator(`[data-module-position] ${testIdSelector(TEST_ID.blockEditUnit)}`).first();
    const mainUnit = page
      .locator(`.layout-content-card ${testIdSelector(TEST_ID.blockEditUnit)}`)
      .nth(1);
    await mainUnit.scrollIntoViewIfNeeded();
    await mainUnit.getByTestId(TEST_ID.blockControlsTrigger).hover();

    const menu = mainUnit.getByTestId(TEST_ID.blockControlsMenu);
    await expect(menu).toBeVisible();
    const moveUpButton = menu.getByRole("button", { name: "Move up" });
    const moveDownButton = menu.getByRole("button", { name: "Move down" });
    const addAboveButton = menu.getByRole("button", { name: "Add block above" });
    const addBelowButton = menu.getByRole("button", { name: "Add block below" });
    const removeBlockButton = menu.getByRole("button", { name: "Remove block" });
    await expect(moveUpButton).toBeVisible();
    await expect(moveDownButton).toBeVisible();
    await expect(addAboveButton).toBeVisible();
    await expect(addBelowButton).toBeVisible();
    await expect(removeBlockButton).toBeVisible();

    const worst = maxShift(view, await measure(page));
    expect(worst.delta, `popover open: largest shift at ${worst.key}`).toBe(0);

    await page.mouse.move(0, 0);
    await expect(menu).toBeHidden();
    await expect(unit).toBeVisible();
  });

  test("popover stays open while choosing a block type, then adds the block", async ({ page }) => {
    await page.goto("/");
    await enterEdit(page);

    const stack = page.locator(`.layout-content-card ${testIdSelector(TEST_ID.blockStack)}`);
    const contentBlocks = stack.getByTestId(TEST_ID.contentBlock);
    const before = await contentBlocks.count();
    const first = stack.getByTestId(TEST_ID.blockEditUnit).first();
    const firstTrigger = first.getByTestId(TEST_ID.blockControlsTrigger);
    await expect(firstTrigger).toBeVisible();
    await firstTrigger.hover();
    const addBelowButton = first.getByRole("button", { name: "Add block below" });
    await expect(addBelowButton).toBeVisible();
    await addBelowButton.click();
    const paragraphButton = page.getByRole("button", { name: "Paragraph" });
    await expect(paragraphButton).toBeVisible();
    await paragraphButton.click();

    await expect(contentBlocks).toHaveCount(before + 1);
    const secondContentBlock = contentBlocks.nth(1);
    await expect(secondContentBlock).toContainText("New paragraph");
  });

  test("keyboard: focusing the chip opens the popover", async ({ page }) => {
    await page.goto("/");
    await enterEdit(page);
    const unit = page.locator(`.layout-content-card ${testIdSelector(TEST_ID.blockEditUnit)}`).first();
    const trigger = unit.getByTestId(TEST_ID.blockControlsTrigger);
    await expect(trigger).toBeVisible();
    await trigger.focus();
    const menu = unit.getByTestId(TEST_ID.blockControlsMenu);
    await expect(menu).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";
import {
  acceptNextDialog,
  dismissNextDialog,
  enterEdit,
  getRichField,
  gotoEdit,
} from "./helpers/editor";

const DISCARD_RE = /Discard unsaved changes\?/i;
const SWITCH_RE = /Switch page\? Unsaved changes will be lost\./i;

test.describe("Dirty confirm / cancel", () => {
  // Use /contact so parallel suites on /about|/blog do not race API restores
  test("clean Cancel exits edit without dialog", async ({ page }) => {
    await page.goto("/contact");
    await enterEdit(page);
    // No dialog handler — would fail the test if a dialog appeared
    page.once("dialog", () => {
      throw new Error("unexpected dialog on clean Cancel");
    });
    const cancelEditingButton = page.getByRole("button", { name: "Cancel editing" });
    await expect(cancelEditingButton).toBeVisible();
    await cancelEditingButton.click();
    const editPageButton = page.getByTestId(TEST_ID.editPageButton);
    await expect(editPageButton).toBeVisible();
    const editorBar = page.getByTestId(TEST_ID.editorBar);
    await expect(editorBar).toHaveCount(0);
  });

  test("dirty Cancel + accept reverts and exits", async ({ page }) => {
    await gotoEdit(page, "contact");
    const field = getRichField(page);
    await field.click();
    const before = await field.innerText();
    await field.press("End");
    await page.keyboard.type(" DIRTY_MARK");
    await expect(field).toContainText("DIRTY_MARK");

    acceptNextDialog(page, DISCARD_RE);
    const cancelEditingButton = page.getByRole("button", { name: "Cancel editing" });
    await expect(cancelEditingButton).toBeVisible();
    await cancelEditingButton.click();
    const editPageButton = page.getByTestId(TEST_ID.editPageButton);
    await expect(editPageButton).toBeVisible();
    const mainContent = page.locator("main");
    await expect(mainContent).not.toContainText("DIRTY_MARK");
    // View mode shows restored content
    await expect(mainContent).toContainText(before.slice(0, 12));
  });

  test("dirty Cancel + dismiss keeps editing", async ({ page }) => {
    await gotoEdit(page, "contact");
    const field = getRichField(page);
    await field.click();
    await field.press("End");
    await page.keyboard.type(" KEEP_DIRTY");
    dismissNextDialog(page, DISCARD_RE);
    const cancelEditingButton = page.getByRole("button", { name: "Cancel editing" });
    await expect(cancelEditingButton).toBeVisible();
    await cancelEditingButton.click();
    const editorBar = page.getByTestId(TEST_ID.editorBar);
    await expect(editorBar).toBeVisible();
    await expect(field).toContainText("KEEP_DIRTY");
  });

  test("frontend page picker dirty + dismiss stays", async ({ page }) => {
    await gotoEdit(page, "contact");
    const field = getRichField(page);
    await field.click();
    await field.press("End");
    await page.keyboard.type(" STAY");
    dismissNextDialog(page, SWITCH_RE);
    const pagePicker = page.getByLabel("Select page to edit");
    await expect(pagePicker).toBeVisible();
    await pagePicker.selectOption("home");
    await expect(page).toHaveURL(/\/contact/);
    await expect(field).toContainText("STAY");
  });

  test("frontend page picker dirty + accept navigates", async ({ page }) => {
    await gotoEdit(page, "contact");
    const field = getRichField(page);
    await field.click();
    await field.press("End");
    await page.keyboard.type(" LEAVE");
    acceptNextDialog(page, SWITCH_RE);
    const pagePicker = page.getByLabel("Select page to edit");
    await expect(pagePicker).toBeVisible();
    await pagePicker.selectOption("home");
    await expect(page).toHaveURL(/\/(\?edit=1|$)/);
    const editorBar = page.getByTestId(TEST_ID.editorBar);
    await expect(editorBar).toBeVisible();
    const mainContent = page.locator("main");
    await expect(mainContent).not.toContainText("LEAVE");
  });

  test("clean page switch has no confirm", async ({ page }) => {
    await gotoEdit(page, "contact");
    page.once("dialog", () => {
      throw new Error("unexpected dialog on clean page switch");
    });
    const pagePicker = page.getByLabel("Select page to edit");
    await expect(pagePicker).toBeVisible();
    await pagePicker.selectOption("about");
    await expect(page).toHaveURL(/\/about\?edit=1/);
  });

  test("admin page combobox dirty + dismiss / accept", async ({ page }) => {
    await page.goto("/admin?page=about");
    const loaded = page.getByTestId(TEST_ID.adminLoaded);
    try {
      await expect(loaded).toBeVisible();
    } catch {
      test.info().skip(true, "Admin UI not available (likely ADMIN_PASSWORD gate)");
      return;
    }
    const field = getRichField(page);
    await expect(field).toBeVisible();
    await field.click();
    await field.press("End");
    await page.keyboard.type(" ADMIN_DIRTY");

    dismissNextDialog(page, SWITCH_RE);
    const pagePicker = page.getByLabel("Select page to edit");
    await expect(pagePicker).toBeVisible();
    await pagePicker.selectOption("home");
    await expect(page).toHaveURL(/page=about/);
    await expect(field).toContainText("ADMIN_DIRTY");

    acceptNextDialog(page, SWITCH_RE);
    await pagePicker.selectOption("home");
    await expect(page).toHaveURL(/page=home/);
    const mainContent = page.locator("main");
    await expect(mainContent).not.toContainText("ADMIN_DIRTY");
  });
});

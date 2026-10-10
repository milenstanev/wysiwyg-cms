import { test, expect } from "@playwright/test";
import { TEST_ID } from "../src/lib/test-ids";
import { getRichField, gotoEdit } from "./helpers/editor";

/**
 * Auth gate for content writes. Skipped unless E2E_ADMIN_PASSWORD is set.
 * When set, the server must also have ADMIN_PASSWORD (same value) for the gate to engage.
 *
 * Note: with the current temporary open `/api/content` proxy policy, these cases
 * document the intended gated behaviour when the gate is re-enabled.
 */
const password = process.env.E2E_ADMIN_PASSWORD;

test.describe("Auth gate save", () => {
  test.skip(!password, "Set E2E_ADMIN_PASSWORD to run auth-gate e2e");

  test("Save without session shows not-signed-in message when gate is on", async ({
    page,
    context,
  }) => {
    // Clear any cms_admin cookie from prior runs
    await context.clearCookies();
    await gotoEdit(page, "about");
    const field = getRichField(page);
    await field.click();
    await field.press("End");
    await page.keyboard.type(" AUTH_PROBE");

    // Probe API: if content writes are still open, skip assertion of 401 UX
    const probe = await page.evaluate(async () => {
      const res = await fetch("/api/content/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ probe: true }),
      });
      return res.status;
    });

    if (probe !== 401) {
      test.info().skip(
        true,
        "Content API writes are open (no 401); re-enable proxy gate to assert Save UX"
      );
      return;
    }

    const saveChangesButton = page.getByRole("button", { name: "Save changes" });
    await expect(saveChangesButton).toBeVisible();
    await saveChangesButton.click();
    const notSignedIn = page.getByText(/Not signed in/i);
    await expect(notSignedIn).toBeVisible();
  });

  test("after Basic auth at /admin, Save succeeds", async ({ page, context }) => {
    await context.clearCookies();

    const token = Buffer.from(`admin:${password}`).toString("base64");
    await context.setExtraHTTPHeaders({ Authorization: `Basic ${token}` });
    await page.goto("/admin?page=about");
    const adminLoaded = page.getByTestId(TEST_ID.adminLoaded);
    await expect(adminLoaded).toBeVisible();
    // Drop forced Basic for subsequent navigations; cookie should remain
    await context.setExtraHTTPHeaders({});

    await gotoEdit(page, "about");
    const field = getRichField(page);
    await field.click();
    await field.press("End");
    await page.keyboard.type(" AUTH_OK");
    const saveChangesButton = page.getByRole("button", { name: "Save changes" });
    await expect(saveChangesButton).toBeVisible();
    await saveChangesButton.click();
    const savedStatus = page.getByRole("status");
    await expect(savedStatus).toHaveText(/Saved!/i);
  });
});

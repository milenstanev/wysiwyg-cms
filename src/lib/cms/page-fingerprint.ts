import type { Page } from "./types";

/** Compare editable page data (ignore server timestamp). */
export function pageEditFingerprint(p: Page): string {
  const { updatedAt: _updatedAt, ...rest } = p;
  return JSON.stringify(rest);
}

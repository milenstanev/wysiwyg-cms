import type { ContentBlock, Page } from "./types";
import { getLayoutTemplate } from "./layout-templates";
import { positionHasModules } from "./modules";

/**
 * Blocks stored for a layout position.
 * main / left / right use dedicated fields; all other ids use positionBlocks.
 */
export function getBlocksForPosition(
  page: Pick<Page, "blocks" | "leftBlocks" | "rightBlocks" | "positionBlocks">,
  positionId: string
): ContentBlock[] {
  if (positionId === "main") return page.blocks ?? [];
  if (positionId === "left") return page.leftBlocks ?? [];
  if (positionId === "right") return page.rightBlocks ?? [];
  return page.positionBlocks?.[positionId] ?? [];
}

/** True when the position has blocks or assigned modules. */
export function positionHasContent(
  page: Pick<Page, "blocks" | "leftBlocks" | "rightBlocks" | "positionBlocks" | "modules">,
  positionId: string
): boolean {
  if (getBlocksForPosition(page, positionId).length > 0) return true;
  return positionHasModules(page.modules, positionId);
}

/** Position ids declared by the given layout template (empty → single main). */
export function getTemplatePositionIds(layoutId: string): string[] {
  const template = getLayoutTemplate(layoutId) ?? getLayoutTemplate("single");
  if (!template) return ["main"];
  return template.rows.flatMap((row) => row.positions);
}

/** Whether the active layout includes this position. */
export function layoutHasPosition(layoutId: string, positionId: string): boolean {
  return getTemplatePositionIds(layoutId).includes(positionId);
}

/**
 * True when the page has at least one block or module in a position that exists
 * in its current layout. Content for positions not in the layout is ignored.
 */
export function pageHasBlocksForLayout(page: Page): boolean {
  const layout = page.layout ?? "single";
  for (const positionId of getTemplatePositionIds(layout)) {
    if (positionHasContent(page, positionId)) return true;
  }
  return false;
}

/**
 * Nav slugs that only appear when the page has blocks for its layout.
 * Example: Blog stays out of the header until it has content in a layout position.
 */
export const OPTIONAL_NAV_SLUGS = ["blog"] as const;

/** Whether a page should appear in site navigation (Home is always linked separately). */
export function shouldShowInNav(page: Page): boolean {
  if (page.slug === "home") return false;
  if ((OPTIONAL_NAV_SLUGS as readonly string[]).includes(page.slug)) {
    return pageHasBlocksForLayout(page);
  }
  return true;
}

import type { ContentBlock, Page, PageLayout } from "./types";
import { LAYOUT_OPTIONS, BLOCK_TYPES } from "./types";

const DEFAULT_LAYOUT: PageLayout = "single";

function ensureBlockArray(value: unknown): ContentBlock[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is ContentBlock =>
        item != null &&
        typeof item === "object" &&
        "id" in item &&
        "type" in item &&
        typeof (item as ContentBlock).id === "string" &&
        typeof (item as ContentBlock).type === "string" &&
        BLOCK_TYPES.includes((item as ContentBlock).type)
    );
  }
  return [];
}

function ensurePositionBlocks(value: unknown): Record<string, ContentBlock[]> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, ContentBlock[]> = {};
  for (const [key, arr] of Object.entries(value)) {
    if (typeof key === "string" && arr != null) out[key] = ensureBlockArray(arr);
  }
  return out;
}

function ensureLayout(layout: unknown): PageLayout {
  if (typeof layout === "string" && LAYOUT_OPTIONS.includes(layout as PageLayout))
    return layout as PageLayout;
  return DEFAULT_LAYOUT;
}

/**
 * Normalize page data so layout can safely handle missing columns or components.
 * Pattern from Joomla/Gantry/WordPress: ensure blocks arrays exist, valid layout,
 * and optional fields have safe defaults so the renderer never sees undefined or invalid data.
 */
export function normalizePage(
  page: Partial<Page> & { id: string; slug: string; title: string; updatedAt: string }
): Page {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title ?? "",
    layout: ensureLayout(page.layout),
    blocks: ensureBlockArray(page.blocks),
    leftBlocks: ensureBlockArray(page.leftBlocks),
    rightBlocks: ensureBlockArray(page.rightBlocks),
    positionBlocks: ensurePositionBlocks(page.positionBlocks),
    mainComponent: page.mainComponent ?? "content",
    leftComponent: page.leftComponent ?? "content",
    rightComponent: page.rightComponent ?? "content",
    updatedAt: page.updatedAt,
  };
}

/**
 * Safe parse of JSON string to ContentBlock[].
 * Returns [] on parse error or if result is not an array (e.g. legacy null).
 */
export function parseBlocksJson(json: string | null | undefined): ContentBlock[] {
  if (json == null || json === "") return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    return ensureBlockArray(parsed);
  } catch {
    return [];
  }
}

/**
 * Safe parse of JSON string to Record<string, ContentBlock[]>.
 */
export function parsePositionBlocksJson(
  json: string | null | undefined
): Record<string, ContentBlock[]> {
  if (json == null || json === "") return {};
  try {
    const parsed = JSON.parse(json) as unknown;
    return ensurePositionBlocks(parsed);
  } catch {
    return {};
  }
}

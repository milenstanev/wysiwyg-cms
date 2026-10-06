import type {
  ContentBlock,
  ComponentType,
  ModuleId,
  Page,
  PageLayout,
  PageModuleAssignment,
  PageSeo,
  PageStatus,
} from "./types";
import { LAYOUT_OPTIONS, BLOCK_TYPES, COMPONENT_TYPES, MODULE_IDS, PAGE_STATUSES } from "./types";

const DEFAULT_LAYOUT: PageLayout = "single";
const DEFAULT_COMPONENT: ComponentType = "content";
const DEFAULT_STATUS: PageStatus = "published";

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

function ensureComponent(value: unknown): ComponentType {
  if (typeof value === "string" && COMPONENT_TYPES.includes(value as ComponentType)) {
    return value as ComponentType;
  }
  return DEFAULT_COMPONENT;
}

function ensureStatus(value: unknown): PageStatus {
  if (typeof value === "string" && PAGE_STATUSES.includes(value as PageStatus)) {
    return value as PageStatus;
  }
  return DEFAULT_STATUS;
}

function ensureSeo(value: unknown): PageSeo | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  const seo: PageSeo = {};
  if (typeof raw.title === "string") seo.title = raw.title;
  if (typeof raw.description === "string") seo.description = raw.description;
  if (typeof raw.ogImage === "string") seo.ogImage = raw.ogImage;
  return Object.keys(seo).length > 0 ? seo : undefined;
}

function ensureModules(value: unknown): PageModuleAssignment[] {
  if (!Array.isArray(value)) return [];
  const out: PageModuleAssignment[] = [];
  for (const item of value) {
    if (item == null || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    if (typeof raw.positionId !== "string" || typeof raw.moduleId !== "string") continue;
    if (!MODULE_IDS.includes(raw.moduleId as ModuleId)) continue;
    const assignment: PageModuleAssignment = {
      positionId: raw.positionId,
      moduleId: raw.moduleId as ModuleId,
    };
    if (raw.params != null && typeof raw.params === "object" && !Array.isArray(raw.params)) {
      assignment.params = raw.params as Record<string, unknown>;
    }
    out.push(assignment);
  }
  return out;
}

/**
 * Normalize page data so layout can safely handle missing columns or components.
 * Pattern from Joomla/Gantry/WordPress: ensure blocks arrays exist, valid layout,
 * and optional fields have safe defaults so the renderer never sees undefined or invalid data.
 */
export function normalizePage(
  page: Partial<Page> & { id: string; slug: string; title: string; updatedAt: string }
): Page {
  const status = ensureStatus(page.status);
  return {
    id: page.id,
    slug: page.slug,
    title: page.title ?? "",
    layout: ensureLayout(page.layout),
    blocks: ensureBlockArray(page.blocks),
    leftBlocks: ensureBlockArray(page.leftBlocks),
    rightBlocks: ensureBlockArray(page.rightBlocks),
    positionBlocks: ensurePositionBlocks(page.positionBlocks),
    mainComponent: ensureComponent(page.mainComponent),
    leftComponent: ensureComponent(page.leftComponent),
    rightComponent: ensureComponent(page.rightComponent),
    modules: ensureModules(page.modules),
    status,
    publishedAt:
      typeof page.publishedAt === "string"
        ? page.publishedAt
        : status === "published"
          ? page.updatedAt
          : undefined,
    seo: ensureSeo(page.seo),
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

export function parseModulesJson(json: string | null | undefined): PageModuleAssignment[] {
  if (json == null || json === "") return [];
  try {
    return ensureModules(JSON.parse(json) as unknown);
  } catch {
    return [];
  }
}

export function parseSeoJson(json: string | null | undefined): PageSeo | undefined {
  if (json == null || json === "") return undefined;
  try {
    return ensureSeo(JSON.parse(json) as unknown);
  } catch {
    return undefined;
  }
}

import { prisma } from "@/lib/db";
import {
  normalizePage,
  parseBlocksJson,
  parseModulesJson,
  parsePositionBlocksJson,
  parseSeoJson,
} from "./normalize-page";
import { INITIAL_PAGES, type InitialPage } from "./initial-pages";
import type { Page, PageLayout, PageStatus } from "./types";
import { isValidSlug, RESERVED_SLUGS, slugify } from "./slug";
import { createBlock } from "./block-defaults";

type DbRow = {
  id: string;
  slug: string;
  title: string;
  layout: string | null;
  blocks: string;
  leftBlocks: string | null;
  rightBlocks: string | null;
  positionBlocks?: string | null;
  mainComponent?: string | null;
  leftComponent?: string | null;
  rightComponent?: string | null;
  modules?: string | null;
  status?: string | null;
  publishedAt?: Date | null;
  seo?: string | null;
  updatedAt: Date;
};

function dbToPage(row: DbRow): Page {
  const raw: Parameters<typeof normalizePage>[0] = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    layout: (row.layout as Page["layout"]) ?? undefined,
    blocks: parseBlocksJson(row.blocks),
    leftBlocks: parseBlocksJson(row.leftBlocks),
    rightBlocks: parseBlocksJson(row.rightBlocks),
    positionBlocks: parsePositionBlocksJson(row.positionBlocks),
    mainComponent: (row.mainComponent as Page["mainComponent"]) ?? undefined,
    leftComponent: (row.leftComponent as Page["leftComponent"]) ?? undefined,
    rightComponent: (row.rightComponent as Page["rightComponent"]) ?? undefined,
    modules: parseModulesJson(row.modules),
    status: (row.status as PageStatus) ?? undefined,
    publishedAt: row.publishedAt?.toISOString(),
    seo: parseSeoJson(row.seo),
    updatedAt: row.updatedAt.toISOString(),
  };
  return normalizePage(raw);
}

function pageToRow(input: Page | InitialPage) {
  const page = normalizePage({ updatedAt: new Date().toISOString(), ...input });
  return {
    slug: page.slug,
    title: page.title,
    layout: page.layout,
    blocks: JSON.stringify(page.blocks),
    leftBlocks: (page.leftBlocks ?? []).length > 0 ? JSON.stringify(page.leftBlocks) : null,
    rightBlocks: (page.rightBlocks ?? []).length > 0 ? JSON.stringify(page.rightBlocks) : null,
    positionBlocks:
      Object.keys(page.positionBlocks ?? {}).length > 0
        ? JSON.stringify(page.positionBlocks)
        : null,
    mainComponent: page.mainComponent ?? "content",
    leftComponent: page.leftComponent ?? "content",
    rightComponent: page.rightComponent ?? "content",
    modules: (page.modules ?? []).length > 0 ? JSON.stringify(page.modules) : null,
    status: page.status ?? "published",
    publishedAt:
      page.status === "published"
        ? page.publishedAt
          ? new Date(page.publishedAt)
          : new Date()
        : null,
    seo: page.seo && Object.keys(page.seo).length > 0 ? JSON.stringify(page.seo) : null,
  };
}

/** Insert initial pages that are not in the database yet. Existing (edited) pages are left alone. */
export async function insertMissingInitialPages(): Promise<number> {
  const result = await prisma.page.createMany({
    data: INITIAL_PAGES.map((p) => ({ id: p.id, ...pageToRow(p) })),
    skipDuplicates: true,
  });
  return result.count;
}

/** Overwrite every initial page with its default content (other pages are untouched). */
export async function resetToInitialPages(): Promise<void> {
  for (const p of INITIAL_PAGES) {
    const data = pageToRow(p);
    await prisma.page.upsert({ where: { id: p.id }, create: { id: p.id, ...data }, update: data });
  }
  initialized = Promise.resolve();
}

// Lazy init, like a useState initializer: runs once per server process, before the first read.
let initialized: Promise<void> | null = null;
function ensureInitialPages(): Promise<void> {
  initialized ??= insertMissingInitialPages().then(
    () => undefined,
    (err) => {
      initialized = null;
      throw err;
    }
  );
  return initialized;
}

export async function loadPages(): Promise<Page[]> {
  await ensureInitialPages();
  const rows = await prisma.page.findMany({ orderBy: { slug: "asc" } });
  return rows.map(dbToPage);
}

/** Published pages only (for public nav / list component). */
export async function loadPublishedPages(): Promise<Page[]> {
  const pages = await loadPages();
  return pages.filter((p) => (p.status ?? "published") === "published");
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  await ensureInitialPages();
  const row = await prisma.page.findUnique({ where: { slug } });
  return row ? dbToPage(row) : null;
}

/** Public read: published pages only. */
export async function getPublishedPageBySlug(slug: string): Promise<Page | null> {
  const page = await getPageBySlug(slug);
  if (!page) return null;
  if ((page.status ?? "published") !== "published") return null;
  return page;
}

export async function updatePage(updated: Page): Promise<Page> {
  const data = pageToRow(updated);
  const row = await prisma.page.upsert({
    where: { id: updated.id },
    create: { id: updated.id, ...data },
    update: data,
  });
  return dbToPage(row);
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  while (
    RESERVED_SLUGS.has(candidate) ||
    (await prisma.page.findUnique({ where: { slug: candidate } }))
  ) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

export async function createPage(input: {
  title: string;
  slug?: string;
  layout?: PageLayout;
  status?: PageStatus;
}): Promise<Page> {
  await ensureInitialPages();
  const title = input.title.trim() || "Untitled";
  const baseSlug = input.slug?.trim() ? input.slug.trim().toLowerCase() : slugify(title);
  if (!isValidSlug(baseSlug) || RESERVED_SLUGS.has(baseSlug)) {
    throw new Error("Invalid slug");
  }
  const slug = await uniqueSlug(baseSlug);
  const now = new Date().toISOString();
  const status = input.status ?? "draft";
  const page = normalizePage({
    id: `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    slug,
    title,
    layout: input.layout ?? "single",
    blocks: [createBlock("heading"), createBlock("text")],
    status,
    publishedAt: status === "published" ? now : undefined,
    updatedAt: now,
  });
  return updatePage(page);
}

export async function duplicatePage(slug: string): Promise<Page> {
  const source = await getPageBySlug(slug);
  if (!source) throw new Error("Not found");
  const now = new Date().toISOString();
  const newSlug = await uniqueSlug(`${source.slug}-copy`);
  const page = normalizePage({
    ...source,
    id: `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    slug: newSlug,
    title: `${source.title} (copy)`,
    status: "draft",
    publishedAt: undefined,
    updatedAt: now,
  });
  return updatePage(page);
}

export async function deletePage(slug: string): Promise<boolean> {
  await ensureInitialPages();
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (!existing) return false;
  await prisma.page.delete({ where: { slug } });
  return true;
}

/** Rename slug for an existing page (by current slug). */
export async function renamePageSlug(currentSlug: string, newSlug: string): Promise<Page> {
  const trimmed = newSlug.trim().toLowerCase();
  if (!isValidSlug(trimmed) || RESERVED_SLUGS.has(trimmed)) {
    throw new Error("Invalid slug");
  }
  const page = await getPageBySlug(currentSlug);
  if (!page) throw new Error("Not found");
  if (trimmed === currentSlug) return page;
  const clash = await prisma.page.findUnique({ where: { slug: trimmed } });
  if (clash) throw new Error("Slug already exists");
  return updatePage({ ...page, slug: trimmed });
}

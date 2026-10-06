import { prisma } from "@/lib/db";
import { normalizePage, parseBlocksJson, parsePositionBlocksJson } from "./normalize-page";
import { Page } from "./types";

function dbToPage(row: {
  id: string;
  slug: string;
  title: string;
  layout: string | null;
  blocks: string;
  leftBlocks: string | null;
  rightBlocks: string | null;
  positionBlocks?: string | null;
  updatedAt: Date;
}): Page {
  const raw: Parameters<typeof normalizePage>[0] = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    layout: (row.layout as Page["layout"]) ?? undefined,
    blocks: parseBlocksJson(row.blocks),
    leftBlocks: parseBlocksJson(row.leftBlocks),
    rightBlocks: parseBlocksJson(row.rightBlocks),
    positionBlocks: parsePositionBlocksJson(row.positionBlocks),
    updatedAt: row.updatedAt.toISOString(),
  };
  return normalizePage(raw);
}

export async function loadPages(): Promise<Page[]> {
  const rows = await prisma.page.findMany({ orderBy: { slug: "asc" } });
  return rows.map(dbToPage);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const row = await prisma.page.findUnique({ where: { slug } });
  return row ? dbToPage(row) : null;
}

export async function updatePage(updated: Page): Promise<Page> {
  const page = normalizePage(updated);
  const data = {
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
  };
  const row = await prisma.page.upsert({
    where: { id: page.id },
    create: { id: page.id, ...data },
    update: data,
  });
  return dbToPage(row);
}

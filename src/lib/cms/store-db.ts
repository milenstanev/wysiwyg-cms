import { prisma } from "@/lib/db";
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
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    layout: (row.layout as Page["layout"]) ?? "single",
    blocks: JSON.parse(row.blocks),
    leftBlocks: row.leftBlocks ? JSON.parse(row.leftBlocks) : undefined,
    rightBlocks: row.rightBlocks ? JSON.parse(row.rightBlocks) : undefined,
    positionBlocks: row.positionBlocks ? JSON.parse(row.positionBlocks) : undefined,
    updatedAt: row.updatedAt.toISOString(),
  };
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
  const data = {
    slug: updated.slug,
    title: updated.title,
    layout: updated.layout ?? "single",
    blocks: JSON.stringify(updated.blocks),
    leftBlocks: updated.leftBlocks ? JSON.stringify(updated.leftBlocks) : null,
    rightBlocks: updated.rightBlocks ? JSON.stringify(updated.rightBlocks) : null,
    positionBlocks: updated.positionBlocks && Object.keys(updated.positionBlocks).length > 0
      ? JSON.stringify(updated.positionBlocks) : null,
  };
  const row = await prisma.page.upsert({
    where: { id: updated.id },
    create: { id: updated.id, ...data },
    update: data,
  });
  return dbToPage(row);
}

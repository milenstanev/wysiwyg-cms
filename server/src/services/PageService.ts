import type { IPageRepository, PageDocument } from "../repositories/PageRepository.js";
import { sanitizeContentBlockFields, sanitizeRichHtml } from "../lib/sanitize-html.js";

function sanitizeBlocks(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (item == null || typeof item !== "object") return item;
    return sanitizeContentBlockFields(item as { content?: string; title?: string; items?: string[]; rows?: string[][] });
  });
}

function sanitizePositionBlocks(value: unknown): Record<string, unknown[]> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, unknown[]> = {};
  for (const [key, arr] of Object.entries(value as Record<string, unknown>)) {
    out[key] = sanitizeBlocks(arr);
  }
  return out;
}

export interface PageResponse {
  id: string;
  slug: string;
  title: string;
  layout?: string;
  blocks: unknown[];
  leftBlocks?: unknown[];
  rightBlocks?: unknown[];
  positionBlocks?: Record<string, unknown[]>;
  mainComponent?: string;
  leftComponent?: string;
  rightComponent?: string;
  modules?: unknown;
  status?: string;
  publishedAt?: string;
  seo?: unknown;
  columnWidths?: unknown;
  updatedAt: string;
}

export interface PageListResponse {
  id: string;
  slug: string;
  title: string;
  status?: string;
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "page"
  );
}

export class PageService {
  constructor(private readonly pageRepository: IPageRepository) {}

  async listPages(): Promise<PageListResponse[]> {
    const pages = await this.pageRepository.findAll();
    return pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      status: p.status ?? "published",
    }));
  }

  async getPageBySlug(slug: string): Promise<PageResponse | null> {
    const page = await this.pageRepository.findBySlug(slug);
    if (!page) return null;
    return this.toResponse(page);
  }

  async updatePage(data: Omit<PageDocument, "updatedAt">): Promise<PageResponse> {
    const sanitized: Omit<PageDocument, "updatedAt"> = {
      ...data,
      title: typeof data.title === "string" ? sanitizeRichHtml(data.title) : data.title,
      blocks: sanitizeBlocks(data.blocks),
      leftBlocks: sanitizeBlocks(data.leftBlocks),
      rightBlocks: sanitizeBlocks(data.rightBlocks),
      positionBlocks: sanitizePositionBlocks(data.positionBlocks),
    };
    const page = await this.pageRepository.upsert(sanitized);
    return this.toResponse(page);
  }

  async createPage(input: {
    title: string;
    slug?: string;
    layout?: string;
    status?: string;
  }): Promise<PageResponse> {
    const title = input.title.trim() || "Untitled";
    const base = (input.slug?.trim() || slugify(title)).toLowerCase();
    let slug = base;
    let n = 2;
    while (await this.pageRepository.findBySlug(slug)) {
      slug = `${base}-${n}`;
      n += 1;
    }
    const now = new Date();
    const status = input.status ?? "draft";
    return this.updatePage({
      id: `page-${Date.now().toString(36)}`,
      slug,
      title,
      layout: input.layout ?? "single",
      blocks: [
        { id: `h-${Date.now()}`, type: "heading", content: title },
        { id: `t-${Date.now()}`, type: "text", content: "Start writing…" },
      ],
      leftBlocks: [],
      rightBlocks: [],
      positionBlocks: {},
      mainComponent: "content",
      leftComponent: "content",
      rightComponent: "content",
      modules: [],
      status,
      publishedAt: status === "published" ? now : null,
      seo: {},
    });
  }

  async duplicatePage(slug: string): Promise<PageResponse> {
    const source = await this.pageRepository.findBySlug(slug);
    if (!source) throw new Error("Not found");
    let newSlug = `${source.slug}-copy`;
    let n = 2;
    while (await this.pageRepository.findBySlug(newSlug)) {
      newSlug = `${source.slug}-copy-${n}`;
      n += 1;
    }
    return this.updatePage({
      ...source,
      id: `page-${Date.now().toString(36)}`,
      slug: newSlug,
      title: `${source.title} (copy)`,
      status: "draft",
      publishedAt: null,
    });
  }

  async deletePage(slug: string): Promise<boolean> {
    return this.pageRepository.deleteBySlug(slug);
  }

  private toResponse(doc: PageDocument): PageResponse {
    return {
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      layout: doc.layout,
      blocks: doc.blocks,
      leftBlocks: doc.leftBlocks,
      rightBlocks: doc.rightBlocks,
      positionBlocks: doc.positionBlocks,
      mainComponent: doc.mainComponent,
      leftComponent: doc.leftComponent,
      rightComponent: doc.rightComponent,
      modules: doc.modules,
      status: doc.status ?? "published",
      publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : undefined,
      seo: doc.seo,
      columnWidths: doc.columnWidths,
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}

import type { IPageRepository, PageDocument } from "../repositories/PageRepository.js";

export interface PageResponse {
  id: string;
  slug: string;
  title: string;
  layout?: string;
  blocks: unknown[];
  leftBlocks?: unknown[];
  rightBlocks?: unknown[];
  mainComponent?: string;
  leftComponent?: string;
  rightComponent?: string;
  modules?: unknown;
  updatedAt: string;
}

export interface PageListResponse {
  id: string;
  slug: string;
  title: string;
}

export class PageService {
  constructor(private readonly pageRepository: IPageRepository) {}

  async listPages(): Promise<PageListResponse[]> {
    const pages = await this.pageRepository.findAll();
    return pages.map((p) => ({ id: p.id, slug: p.slug, title: p.title }));
  }

  async getPageBySlug(slug: string): Promise<PageResponse | null> {
    const page = await this.pageRepository.findBySlug(slug);
    if (!page) return null;
    return this.toResponse(page);
  }

  async updatePage(data: Omit<PageDocument, "updatedAt">): Promise<PageResponse> {
    const page = await this.pageRepository.upsert(data);
    return this.toResponse(page);
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
      mainComponent: doc.mainComponent,
      leftComponent: doc.leftComponent,
      rightComponent: doc.rightComponent,
      modules: doc.modules,
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}

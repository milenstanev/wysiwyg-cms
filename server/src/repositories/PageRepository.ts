import { PageModel, type IPage } from "../models/Page.js";

export interface PageDocument {
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
  publishedAt?: Date | null;
  seo?: unknown;
  updatedAt: Date;
}

export interface IPageRepository {
  findAll(): Promise<PageDocument[]>;
  findBySlug(slug: string): Promise<PageDocument | null>;
  upsert(page: Omit<PageDocument, "updatedAt">): Promise<PageDocument>;
  deleteBySlug(slug: string): Promise<boolean>;
}

export class PageRepository implements IPageRepository {
  async findAll(): Promise<PageDocument[]> {
    const pages = await PageModel.find().sort({ slug: 1 }).lean();
    return pages as PageDocument[];
  }

  async findBySlug(slug: string): Promise<PageDocument | null> {
    const page = await PageModel.findOne({ slug }).lean();
    return page as PageDocument | null;
  }

  async upsert(page: Omit<PageDocument, "updatedAt">): Promise<PageDocument> {
    const updated = await PageModel.findOneAndUpdate(
      { id: page.id },
      {
        $set: {
          slug: page.slug,
          title: page.title,
          layout: page.layout ?? "single",
          blocks: page.blocks,
          leftBlocks: page.leftBlocks ?? [],
          rightBlocks: page.rightBlocks ?? [],
          positionBlocks: page.positionBlocks ?? {},
          mainComponent: page.mainComponent,
          leftComponent: page.leftComponent,
          rightComponent: page.rightComponent,
          modules: page.modules,
          status: page.status ?? "published",
          publishedAt: page.publishedAt ?? null,
          seo: page.seo,
        },
      },
      { upsert: true, new: true }
    ).lean();

    return updated as PageDocument;
  }

  async deleteBySlug(slug: string): Promise<boolean> {
    const result = await PageModel.deleteOne({ slug });
    return result.deletedCount > 0;
  }
}

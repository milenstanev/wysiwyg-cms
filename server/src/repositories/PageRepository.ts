import { PageModel, type IPage } from "../models/Page.js";

export interface PageDocument {
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
  updatedAt: Date;
}

export interface IPageRepository {
  findAll(): Promise<PageDocument[]>;
  findBySlug(slug: string): Promise<PageDocument | null>;
  upsert(page: Omit<PageDocument, "updatedAt">): Promise<PageDocument>;
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
          mainComponent: page.mainComponent,
          leftComponent: page.leftComponent,
          rightComponent: page.rightComponent,
          modules: page.modules,
        },
      },
      { upsert: true, new: true }
    ).lean();

    return updated as PageDocument;
  }
}

import type { Request, Response } from "express";
import type { PageService } from "../services/PageService.js";

export class PageController {
  constructor(private readonly pageService: PageService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const pages = await this.pageService.listPages();
      res.json(pages);
    } catch (err) {
      res.status(500).json({ error: "Failed to list pages" });
    }
  };

  getBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    try {
      const page = await this.pageService.getPageBySlug(slug);
      if (!page) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(page);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch page" });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const body = req.body;

    if (body.slug !== slug) {
      res.status(400).json({ error: "Slug mismatch" });
      return;
    }

    try {
      const updated = await this.pageService.updatePage({
        id: body.id,
        slug: body.slug,
        title: body.title,
        layout: body.layout,
        blocks: body.blocks ?? [],
        leftBlocks: body.leftBlocks,
        rightBlocks: body.rightBlocks,
        mainComponent: body.mainComponent,
        leftComponent: body.leftComponent,
        rightComponent: body.rightComponent,
        modules: body.modules,
      });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update page" });
    }
  };
}

import type { Request, Response } from "express";
import type { PageService } from "../services/PageService.js";

export class PageController {
  constructor(private readonly pageService: PageService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const pages = await this.pageService.listPages();
      res.json(pages);
    } catch {
      res.status(500).json({ error: "Failed to list pages" });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as { title?: string; slug?: string; layout?: string; status?: string };
    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      res.status(400).json({ error: "Title is required" });
      return;
    }
    try {
      const page = await this.pageService.createPage({
        title: body.title,
        slug: body.slug,
        layout: body.layout,
        status: body.status,
      });
      res.status(201).json(page);
    } catch {
      res.status(500).json({ error: "Failed to create page" });
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
    } catch {
      res.status(500).json({ error: "Failed to fetch page" });
    }
  };

  duplicate = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    try {
      const page = await this.pageService.duplicatePage(slug);
      res.status(201).json(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to duplicate";
      res.status(message === "Not found" ? 404 : 500).json({ error: message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const body = req.body;

    if (body.slug !== slug && body.id) {
      // allow rename when id provided — handled by upsert on id
    } else if (body.slug !== slug) {
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
        positionBlocks: body.positionBlocks,
        mainComponent: body.mainComponent,
        leftComponent: body.leftComponent,
        rightComponent: body.rightComponent,
        modules: body.modules,
        status: body.status,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        seo: body.seo,
        columnWidths: body.columnWidths,
      });
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update page" });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    try {
      const deleted = await this.pageService.deletePage(slug);
      if (!deleted) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "Failed to delete page" });
    }
  };
}

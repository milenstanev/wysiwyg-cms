import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getPageBySlug, loadPages, updatePage } from "./store-db";
import type { Page } from "./types";

describe("store-db", () => {
  describe("getPageBySlug", () => {
    it("returns page for known slug", async () => {
      const page = await getPageBySlug("home");
      expect(page).not.toBeNull();
      expect(page?.slug).toBe("home");
      expect(page?.title).toBe("Welcome");
      expect(page?.blocks.length).toBeGreaterThan(0);
    });

    it("returns null for unknown slug", async () => {
      const page = await getPageBySlug("nonexistent-slug-xyz");
      expect(page).toBeNull();
    });
  });

  describe("loadPages", () => {
    it("returns all pages ordered by slug", async () => {
      const pages = await loadPages();
      expect(Array.isArray(pages)).toBe(true);
      expect(pages.length).toBeGreaterThanOrEqual(1);
      for (let i = 1; i < pages.length; i++) {
        expect(pages[i].slug >= pages[i - 1].slug).toBe(true);
      }
    });

    it("each page has id, slug, title, blocks, updatedAt", async () => {
      const pages = await loadPages();
      for (const p of pages) {
        expect(p).toHaveProperty("id");
        expect(p).toHaveProperty("slug");
        expect(p).toHaveProperty("title");
        expect(p).toHaveProperty("blocks");
        expect(Array.isArray(p.blocks)).toBe(true);
        expect(p).toHaveProperty("updatedAt");
      }
    });
  });

  describe("updatePage", () => {
    // Own throwaway page: test files run in parallel, so never mutate real content pages
    const tempId = `store-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const temp: Page = {
      id: tempId,
      slug: tempId,
      title: "Store Test",
      layout: "single",
      blocks: [{ id: "t1", type: "text", content: "Original" }],
      updatedAt: new Date().toISOString(),
    };

    beforeAll(async () => {
      await updatePage(temp);
    });

    afterAll(async () => {
      const { prisma } = await import("@/lib/db");
      await prisma.page.deleteMany({ where: { id: tempId } });
    });

    it("updates existing page and returns it", async () => {
      const existing = await getPageBySlug(tempId);
      expect(existing).not.toBeNull();
      const updated: Page = {
        ...existing!,
        title: "Store Test (Updated)",
        blocks: [...existing!.blocks, { id: "new-1", type: "text", content: "New block" }],
      };
      const result = await updatePage(updated);
      expect(result.title).toBe("Store Test (Updated)");
      expect(result.blocks.length).toBe(existing!.blocks.length + 1);

      const refetched = await getPageBySlug(tempId);
      expect(refetched?.title).toBe("Store Test (Updated)");
    });

    it("creates new page when id does not exist", async () => {
      const newPage: Page = {
        id: "test-page-unique-" + Date.now(),
        slug: "test-page-unique-" + Date.now(),
        title: "Test Page",
        layout: "single",
        blocks: [{ id: "1", type: "heading", content: "Test" }],
        updatedAt: new Date().toISOString(),
      };
      const result = await updatePage(newPage);
      expect(result.id).toBe(newPage.id);
      expect(result.slug).toBe(newPage.slug);
      expect(result.title).toBe("Test Page");

      const fetched = await getPageBySlug(newPage.slug);
      expect(fetched?.title).toBe("Test Page");

      const { prisma } = await import("@/lib/db");
      await prisma.page.delete({ where: { id: newPage.id } });
    });
  });
});

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Page,
  ContentBlock,
  BlockType,
  PageLayout,
  PositionId,
  ComponentType,
  PageStatus,
  PageModuleAssignment,
  PageSeo,
  COMPONENT_TYPES,
} from "@/lib/cms/types";
import { createBlock } from "@/lib/cms/block-defaults";
import { PageRenderer } from "@/components/PageRenderer";
import { Footer } from "@/components/layout/Footer";
import { CONTAINER_CLASS } from "@/lib/layout/constants";
import Link from "next/link";
import { LayoutDropdown } from "@/components/layout/LayoutDropdown";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ModulesPanel } from "@/components/ModulesPanel";
import { slugify } from "@/lib/cms/slug";
import { TEST_ID } from "@/lib/test-ids";

function getBlocksForPosition(p: Page, positionId: PositionId): ContentBlock[] {
  if (positionId === "main") return p.blocks;
  if (positionId === "left") return p.leftBlocks ?? [];
  if (positionId === "right") return p.rightBlocks ?? [];
  return p.positionBlocks?.[positionId] ?? [];
}

function setBlocksForPosition(p: Page, positionId: PositionId, blocks: ContentBlock[]): Page {
  if (positionId === "main") return { ...p, blocks };
  if (positionId === "left") return { ...p, leftBlocks: blocks };
  if (positionId === "right") return { ...p, rightBlocks: blocks };
  return { ...p, positionBlocks: { ...(p.positionBlocks ?? {}), [positionId]: blocks } };
}

type PageListItem = { id: string; slug: string; title: string; status?: string };

export default function AdminPage() {
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [slugDraft, setSlugDraft] = useState("");

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = (await res.json()) as PageListItem[];
        setPages(data);
      }
    } catch {
      setPages([]);
    }
  }, []);

  const fetchPageRequestRef = useRef(0);

  const fetchPage = useCallback(async (slug: string) => {
    const requestId = ++fetchPageRequestRef.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/content/${slug}`);
      if (requestId !== fetchPageRequestRef.current) return;
      if (res.ok) {
        const data = (await res.json()) as Page;
        setPage(data);
        setSlugDraft(data.slug);
      } else {
        setPage(null);
      }
    } catch {
      if (requestId !== fetchPageRequestRef.current) return;
      setPage(null);
    } finally {
      if (requestId === fetchPageRequestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchPages();
      const slug =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("page") || "home"
          : "home";
      await fetchPage(slug);
    };
    load();
  }, [fetchPages, fetchPage]);

  const handlePageChange = (slug: string) => {
    window.history.replaceState(null, "", `/admin?page=${slug}`);
    setTimeout(() => fetchPage(slug), 0);
  };

  const handleBlockEdit = useCallback(
    (blockId: string, content: string) => {
      if (!page) return;
      const map = (arr: ContentBlock[]) =>
        arr.map((b) => (b.id === blockId ? { ...b, content } : b));
      const next: Page = {
        ...page,
        blocks: map(page.blocks),
        leftBlocks: map(page.leftBlocks ?? []),
        rightBlocks: map(page.rightBlocks ?? []),
      };
      if (page.positionBlocks) {
        next.positionBlocks = {};
        for (const [pos, blocks] of Object.entries(page.positionBlocks))
          next.positionBlocks![pos] = map(blocks);
      }
      setPage(next);
    },
    [page]
  );

  const handleTitleEdit = useCallback(
    (title: string) => {
      if (!page) return;
      setPage({ ...page, title });
    },
    [page]
  );

  const handleBlockUpdate = useCallback(
    (blockId: string, updates: Partial<ContentBlock>) => {
      if (!page) return;
      const updateIn = (arr: ContentBlock[]) =>
        arr.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
      const next: Page = {
        ...page,
        blocks: updateIn(page.blocks),
        leftBlocks: updateIn(page.leftBlocks ?? []),
        rightBlocks: updateIn(page.rightBlocks ?? []),
      };
      if (page.positionBlocks) {
        next.positionBlocks = {};
        for (const [pos, blocks] of Object.entries(page.positionBlocks))
          next.positionBlocks![pos] = updateIn(blocks);
      }
      setPage(next);
    },
    [page]
  );

  const handleAddBlock = useCallback(
    (afterBlockId: string | null, type: BlockType, positionId: PositionId) => {
      if (!page) return;
      const newBlock = createBlock(type);
      const arr = getBlocksForPosition(page, positionId);
      const blocks = [...arr];
      if (afterBlockId === null) {
        blocks.unshift(newBlock);
      } else {
        const idx = blocks.findIndex((b) => b.id === afterBlockId);
        if (idx >= 0) blocks.splice(idx + 1, 0, newBlock);
        else blocks.push(newBlock);
      }
      setPage(setBlocksForPosition(page, positionId, blocks));
    },
    [page]
  );

  const handleRemoveBlock = useCallback(
    (blockId: string) => {
      if (!page) return;
      const remove = (arr: ContentBlock[]) => arr.filter((b) => b.id !== blockId);
      if (page.blocks.some((b) => b.id === blockId))
        setPage({ ...page, blocks: remove(page.blocks) });
      else if ((page.leftBlocks ?? []).some((b) => b.id === blockId))
        setPage({ ...page, leftBlocks: remove(page.leftBlocks ?? []) });
      else if ((page.rightBlocks ?? []).some((b) => b.id === blockId))
        setPage({ ...page, rightBlocks: remove(page.rightBlocks ?? []) });
      else if (page.positionBlocks) {
        for (const [pos, blocks] of Object.entries(page.positionBlocks)) {
          if (blocks.some((b) => b.id === blockId)) {
            setPage({ ...page, positionBlocks: { ...page.positionBlocks, [pos]: remove(blocks) } });
            return;
          }
        }
      }
    },
    [page]
  );

  const handleMoveBlock = useCallback(
    (blockId: string, direction: "up" | "down", positionId: PositionId) => {
      if (!page) return;
      const arr = getBlocksForPosition(page, positionId);
      const idx = arr.findIndex((b) => b.id === blockId);
      if (idx < 0) return;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= arr.length) return;
      const a = arr[idx];
      const b = arr[newIdx];
      const blocks = [...arr];
      blocks[idx] = { ...b, gridItem: a.gridItem ?? b.gridItem };
      blocks[newIdx] = { ...a, gridItem: b.gridItem ?? a.gridItem };
      setPage(setBlocksForPosition(page, positionId, blocks));
    },
    [page]
  );

  const handleLayoutChange = useCallback(
    (layout: PageLayout) => {
      if (!page) return;
      setPage({ ...page, layout });
    },
    [page]
  );

  const handleModulesChange = useCallback(
    (modules: PageModuleAssignment[]) => {
      if (!page) return;
      setPage({ ...page, modules });
    },
    [page]
  );

  const handleComponentChange = (region: "main" | "left" | "right", component: ComponentType) => {
    if (!page) return;
    if (region === "main") setPage({ ...page, mainComponent: component });
    else if (region === "left") setPage({ ...page, leftComponent: component });
    else setPage({ ...page, rightComponent: component });
  };

  const handleStatusChange = (status: PageStatus) => {
    if (!page) return;
    setPage({
      ...page,
      status,
      publishedAt: status === "published" ? new Date().toISOString() : page.publishedAt,
    });
  };

  const handleSeoChange = (patch: Partial<PageSeo>) => {
    if (!page) return;
    setPage({ ...page, seo: { ...(page.seo ?? {}), ...patch } });
  };

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    setMessage(null);
    const nextSlug = slugDraft.trim().toLowerCase() || page.slug;
    const payload: Page = { ...page, slug: nextSlug };
    try {
      const res = await fetch(`/api/content/${page.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = (await res.json()) as Page;
        setPage(saved);
        setSlugDraft(saved.slug);
        await fetchPages();
        if (saved.slug !== page.slug) {
          window.history.replaceState(null, "", `/admin?page=${saved.slug}`);
        }
        setMessage("Saved!");
        setTimeout(() => setMessage(null), 2000);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage(data.error ?? "Failed to save");
      }
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    const title = window.prompt("New page title", "New page");
    if (!title) return;
    setMessage(null);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug: slugify(title), status: "draft" }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage(data.error ?? "Failed to create");
        return;
      }
      const created = (await res.json()) as Page;
      await fetchPages();
      handlePageChange(created.slug);
      setMessage("Created as draft");
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage("Failed to create");
    }
  };

  const handleDuplicate = async () => {
    if (!page) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/content/${page.slug}/duplicate`, { method: "POST" });
      if (!res.ok) {
        setMessage("Failed to duplicate");
        return;
      }
      const created = (await res.json()) as Page;
      await fetchPages();
      handlePageChange(created.slug);
      setMessage("Duplicated");
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage("Failed to duplicate");
    }
  };

  const handleDelete = async () => {
    if (!page) return;
    if (page.slug === "home") {
      setMessage("Cannot delete home");
      return;
    }
    if (!window.confirm(`Delete “${page.title}”? This cannot be undone.`)) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/content/${page.slug}`, { method: "DELETE" });
      if (!res.ok) {
        setMessage("Failed to delete");
        return;
      }
      await fetchPages();
      handlePageChange("home");
      setMessage("Deleted");
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage("Failed to delete");
    }
  };

  if (loading && !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted)]">Page not found.</p>
        <button
          type="button"
          onClick={handleCreate}
          className="ml-[var(--space-3)] text-sm text-[var(--accent)]"
        >
          Create a page
        </button>
      </div>
    );
  }

  const currentSlug =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("page") || "home"
      : page.slug;
  const selectValue =
    page.slug && pages.some((p) => p.slug === currentSlug) ? currentSlug : page.slug;

  const allPagesForRenderer = pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
  }));

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header
        data-testid={TEST_ID.adminLoaded}
        className="bg-[var(--surface)] border-b border-[var(--border)] px-[var(--space-4)] sm:px-[var(--space-5)] py-[var(--space-3)] flex flex-wrap items-center justify-between gap-[var(--space-3)] sticky top-0 z-10"
        aria-label="Admin toolbar"
      >
        <div className="flex items-center gap-[var(--space-4)] flex-wrap">
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="View site"
          >
            ← View site
          </Link>
          <span className="text-[var(--muted)]" aria-hidden>
            |
          </span>
          <select
            value={selectValue}
            onChange={(e) => handlePageChange(e.target.value)}
            className="text-sm font-medium text-[var(--foreground)] border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--surface)]"
            aria-label="Select page to edit"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.title}
                {(p.status ?? "published") === "draft" ? " (draft)" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCreate}
            className="text-xs px-[var(--space-2)] py-[var(--space-1)] border border-[var(--border)] rounded"
            aria-label="Create page"
          >
            New
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            className="text-xs px-[var(--space-2)] py-[var(--space-1)] border border-[var(--border)] rounded"
            aria-label="Duplicate page"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs px-[var(--space-2)] py-[var(--space-1)] border border-[var(--border)] rounded text-[color-mix(in_srgb,#dc2626_70%,var(--foreground))]"
            aria-label="Delete page"
            disabled={page.slug === "home"}
          >
            Delete
          </button>
          <LayoutDropdown value={page.layout ?? "single"} onChange={handleLayoutChange} />
          <ThemeSwitcher />
        </div>
        <div className="flex items-center gap-[var(--space-3)]">
          <span role="status" className="text-sm font-medium text-[var(--foreground)]">
            {message &&
              `${message === "Saved!" || message === "Created as draft" || message === "Duplicated" || message === "Deleted" ? "✓" : "⚠"} ${message}`}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-[var(--space-4)] py-[var(--space-2)] bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50"
            aria-label={saving ? "Saving..." : "Save changes"}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      <section
        aria-label="Page settings"
        className={`${CONTAINER_CLASS} w-full py-[var(--space-4)] space-y-[var(--space-4)]`}
      >
        <div className="grid gap-[var(--space-3)] md:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs space-y-[var(--space-1)]">
            <span className="text-[var(--muted)]">Slug</span>
            <input
              type="text"
              value={slugDraft}
              onChange={(e) => setSlugDraft(e.target.value)}
              className="block w-full text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--surface)]"
              aria-label="Page slug"
            />
          </label>
          <label className="text-xs space-y-[var(--space-1)]">
            <span className="text-[var(--muted)]">Status</span>
            <select
              value={page.status ?? "published"}
              onChange={(e) => handleStatusChange(e.target.value as PageStatus)}
              className="block w-full text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--surface)]"
              aria-label="Publish status"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="text-xs space-y-[var(--space-1)]">
            <span className="text-[var(--muted)]">Main component</span>
            <select
              value={page.mainComponent ?? "content"}
              onChange={(e) => handleComponentChange("main", e.target.value as ComponentType)}
              className="block w-full text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--surface)]"
              aria-label="Main component"
            >
              {COMPONENT_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          {(page.layout === "two-col" || page.layout === "three-col" || page.layout === "rockettheme") && (
            <label className="text-xs space-y-[var(--space-1)]">
              <span className="text-[var(--muted)]">Left component</span>
              <select
                value={page.leftComponent ?? "content"}
                onChange={(e) => handleComponentChange("left", e.target.value as ComponentType)}
                className="block w-full text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--surface)]"
                aria-label="Left component"
              >
                {COMPONENT_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}
          {(page.layout === "three-col" || page.layout === "rockettheme") && (
            <label className="text-xs space-y-[var(--space-1)]">
              <span className="text-[var(--muted)]">Right component</span>
              <select
                value={page.rightComponent ?? "content"}
                onChange={(e) => handleComponentChange("right", e.target.value as ComponentType)}
                className="block w-full text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--surface)]"
                aria-label="Right component"
              >
                {COMPONENT_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="grid gap-[var(--space-3)] md:grid-cols-3 border border-[var(--border)] rounded-lg p-[var(--space-3)] bg-[var(--surface)]">
          <h2 className="md:col-span-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            SEO
          </h2>
          <label className="text-xs space-y-[var(--space-1)]">
            <span className="text-[var(--muted)]">Meta title</span>
            <input
              type="text"
              value={page.seo?.title ?? ""}
              onChange={(e) => handleSeoChange({ title: e.target.value })}
              placeholder={page.title}
              className="block w-full text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--background)]"
              aria-label="SEO title"
            />
          </label>
          <label className="text-xs space-y-[var(--space-1)]">
            <span className="text-[var(--muted)]">Meta description</span>
            <input
              type="text"
              value={page.seo?.description ?? ""}
              onChange={(e) => handleSeoChange({ description: e.target.value })}
              className="block w-full text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--background)]"
              aria-label="SEO description"
            />
          </label>
          <label className="text-xs space-y-[var(--space-1)]">
            <span className="text-[var(--muted)]">OG image URL</span>
            <input
              type="url"
              value={page.seo?.ogImage ?? ""}
              onChange={(e) => handleSeoChange({ ogImage: e.target.value })}
              className="block w-full text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--background)]"
              aria-label="OG image URL"
            />
          </label>
        </div>

        <ModulesPanel
          layout={page.layout ?? "single"}
          modules={page.modules ?? []}
          onChange={handleModulesChange}
        />
      </section>

      <main id="main-content" tabIndex={-1} className={`flex-1 py-[var(--space-6)] sm:py-[var(--space-7)] ${CONTAINER_CLASS} w-full`}>
        <PageRenderer
          page={page}
          editable
          allPages={allPagesForRenderer}
          currentSlug={page.slug}
          onBlockEdit={handleBlockEdit}
          onBlockUpdate={handleBlockUpdate}
          onTitleEdit={handleTitleEdit}
          onLayoutChange={handleLayoutChange}
          onAddBlock={handleAddBlock}
          onRemoveBlock={handleRemoveBlock}
          onMoveBlock={handleMoveBlock}
          onModulesChange={handleModulesChange}
        />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

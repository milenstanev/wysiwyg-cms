"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Page, ContentBlock, BlockType, PageLayout, PositionId } from "@/lib/cms/types";
import { createBlock } from "@/lib/cms/block-defaults";
import { PageRenderer } from "@/components/PageRenderer";
import { Footer } from "@/components/layout/Footer";
import { CONTAINER_CLASS } from "@/lib/layout/constants";
import Link from "next/link";
import { LayoutDropdown } from "@/components/layout/LayoutDropdown";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

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

export default function AdminPage() {
  const [pages, setPages] = useState<{ id: string; slug: string; title: string }[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
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
        const data = await res.json();
        setPage(data);
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
    // Defer fetch to next tick so native select can finish its change event
    // and close gracefully before we trigger re-renders
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

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/content/${page.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      if (res.ok) {
        setMessage("Saved!");
        setTimeout(() => setMessage(null), 2000);
      } else {
        setMessage("Failed to save");
      }
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
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
      </div>
    );
  }

  const currentSlug =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("page") || "home"
      : page.slug;
  const selectValue =
    page.slug && pages.some((p) => p.slug === currentSlug) ? currentSlug : page.slug;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header
        data-testid="admin-loaded"
        className="bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10"
        aria-label="Admin toolbar"
      >
        <div className="flex items-center gap-4 flex-wrap">
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
            className="text-sm font-medium text-[var(--foreground)] border border-[var(--border)] rounded px-2 py-1.5 bg-[var(--surface)]"
            aria-label="Select page to edit"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
          <span className="text-xs text-[var(--muted)]" aria-live="polite">
            Editing: {page.title}
          </span>
          <LayoutDropdown value={page.layout ?? "single"} onChange={handleLayoutChange} />
          <ThemeSwitcher />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium opacity-90 hover:opacity-100 disabled:opacity-50"
          aria-label={saving ? "Saving..." : "Save changes"}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {message && (
          <span
            role="status"
            aria-live="polite"
            className={`text-sm ${message === "Saved!" ? "text-green-600" : "text-red-600"}`}
          >
            {message}
          </span>
        )}
      </header>
      <main className={`flex-1 py-8 sm:py-12 ${CONTAINER_CLASS} w-full`}>
        <PageRenderer
          page={page}
          editable
          onBlockEdit={handleBlockEdit}
          onBlockUpdate={handleBlockUpdate}
          onTitleEdit={handleTitleEdit}
          onLayoutChange={handleLayoutChange}
          onAddBlock={handleAddBlock}
          onRemoveBlock={handleRemoveBlock}
          onMoveBlock={handleMoveBlock}
        />
      </main>
      <Footer />
    </div>
  );
}

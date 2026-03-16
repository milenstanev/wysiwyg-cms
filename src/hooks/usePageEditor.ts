"use client";

import { useState, useCallback, useEffect } from "react";
import type { Page, ContentBlock, BlockType, PageLayout } from "@/lib/cms/types";
import type { PositionId } from "@/lib/cms/types";
import type { PageRendererCallbacks } from "@/lib/cms/page-editor.types";
import { createBlock } from "@/lib/cms/block-defaults";

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
  const next = { ...(p.positionBlocks ?? {}), [positionId]: blocks };
  return { ...p, positionBlocks: next };
}

export interface UsePageEditorOptions {
  /** Persist page to API. Called after successful save. */
  onSaved?: () => void;
}

export interface UsePageEditorResult {
  page: Page;
  isEditing: boolean;
  setEditing: (value: boolean) => void;
  saving: boolean;
  message: string | null;
  callbacks: PageRendererCallbacks;
  /** For toolbar: save, cancel, page picker, etc. */
  actions: {
    save: () => Promise<void>;
    cancel: () => void;
    setMessage: (msg: string | null) => void;
  };
}

export function usePageEditor(
  initialPage: Page,
  options: UsePageEditorOptions = {}
): UsePageEditorResult {
  const [page, setPage] = useState<Page>(initialPage);
  const [isEditing, setEditing] = useState<boolean>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "1"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage.id]);

  const onBlockEdit = useCallback((blockId: string, content: string) => {
    setPage((p) => {
      const map = (arr: ContentBlock[]) => arr.map((b) => (b.id === blockId ? { ...b, content } : b));
      const next = { ...p, blocks: map(p.blocks), leftBlocks: map(p.leftBlocks ?? []), rightBlocks: map(p.rightBlocks ?? []) };
      if (p.positionBlocks) {
        next.positionBlocks = {};
        for (const [pos, blocks] of Object.entries(p.positionBlocks))
          next.positionBlocks![pos] = map(blocks);
      }
      return next;
    });
  }, []);

  const onTitleEdit = useCallback((title: string) => {
    setPage((p) => ({ ...p, title }));
  }, []);

  const onBlockUpdate = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    setPage((p) => {
      const map = (arr: ContentBlock[]) => arr.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
      const next = { ...p, blocks: map(p.blocks), leftBlocks: map(p.leftBlocks ?? []), rightBlocks: map(p.rightBlocks ?? []) };
      if (p.positionBlocks) {
        next.positionBlocks = {};
        for (const [pos, blocks] of Object.entries(p.positionBlocks))
          next.positionBlocks![pos] = map(blocks);
      }
      return next;
    });
  }, []);

  const onAddBlock = useCallback((afterBlockId: string | null, type: BlockType, positionId: PositionId) => {
    const newBlock = createBlock(type);
    setPage((p) => {
      const arr = getBlocksForPosition(p, positionId);
      const blocks = [...arr];
      if (afterBlockId === null) blocks.unshift(newBlock);
      else {
        const idx = blocks.findIndex((b) => b.id === afterBlockId);
        blocks.splice(idx + 1, 0, newBlock);
      }
      return setBlocksForPosition(p, positionId, blocks);
    });
  }, []);

  const onRemoveBlock = useCallback((blockId: string) => {
    setPage((p) => {
      const remove = (arr: ContentBlock[]) => arr.filter((b) => b.id !== blockId);
      if (p.blocks.some((b) => b.id === blockId)) return { ...p, blocks: remove(p.blocks) };
      if ((p.leftBlocks ?? []).some((b) => b.id === blockId))
        return { ...p, leftBlocks: remove(p.leftBlocks ?? []) };
      if ((p.rightBlocks ?? []).some((b) => b.id === blockId))
        return { ...p, rightBlocks: remove(p.rightBlocks ?? []) };
      if (p.positionBlocks) {
        for (const [pos, blocks] of Object.entries(p.positionBlocks)) {
          if (blocks.some((b) => b.id === blockId)) {
            const next = { ...p.positionBlocks, [pos]: remove(blocks) };
            return { ...p, positionBlocks: next };
          }
        }
      }
      return p;
    });
  }, []);

  const onMoveBlock = useCallback((blockId: string, direction: "up" | "down", positionId: PositionId) => {
    setPage((p) => {
      const arr = getBlocksForPosition(p, positionId);
      const idx = arr.findIndex((b) => b.id === blockId);
      if (idx < 0) return p;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= arr.length) return p;
      const blocks = [...arr];
      [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
      return setBlocksForPosition(p, positionId, blocks);
    });
  }, []);

  const onLayoutChange = useCallback((layout: PageLayout) => {
    setPage((p) => ({ ...p, layout }));
  }, []);

  const save = useCallback(async () => {
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
        setEditing(false);
        options.onSaved?.();
        setTimeout(() => setMessage(null), 1500);
      } else {
        setMessage("Failed to save");
      }
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [page, options]);

  const cancel = useCallback(() => {
    setEditing(false);
    setMessage(null);
  }, []);

  const callbacks: PageRendererCallbacks = isEditing
    ? {
        onBlockEdit,
        onTitleEdit,
        onBlockUpdate,
        onAddBlock,
        onRemoveBlock,
        onMoveBlock,
        onLayoutChange,
      }
    : {};

  return {
    page,
    isEditing,
    setEditing,
    saving,
    message,
    callbacks,
    actions: { save, cancel, setMessage },
  };
}

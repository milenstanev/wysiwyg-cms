"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type {
  Page,
  ContentBlock,
  BlockType,
  PageLayout,
  PageModuleAssignment,
  ColumnWidths,
} from "@/lib/cms/types";
import type { PositionId } from "@/lib/cms/types";
import type { PageRendererCallbacks } from "@/lib/cms/page-editor.types";
import { createBlock } from "@/lib/cms/block-defaults";
import { defaultColumnWidths, layoutSupportsColumnWidths } from "@/lib/cms/column-widths";
import { pageEditFingerprint } from "@/lib/cms/page-fingerprint";

export { pageEditFingerprint } from "@/lib/cms/page-fingerprint";

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

function clonePage(p: Page): Page {
  return structuredClone(p);
}

export interface UsePageEditorOptions {
  /** Persist page to API. Called after successful save. */
  onSaved?: () => void;
}

export interface UsePageEditorResult {
  page: Page;
  isEditing: boolean;
  isDirty: boolean;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState<Page | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const startedFromQuery = useRef(false);

  const isDirty = useMemo(() => {
    if (!isEditing || !editSnapshot) return false;
    return pageEditFingerprint(page) !== pageEditFingerprint(editSnapshot);
  }, [isEditing, editSnapshot, page]);

  const beginEditing = useCallback((base: Page) => {
    setEditSnapshot(clonePage(base));
    setIsEditing(true);
  }, []);

  // Read ?edit=1 after mount: the server render has no URL, so reading it in initial state breaks hydration
  useEffect(() => {
    if (startedFromQuery.current) return;
    if (new URLSearchParams(window.location.search).get("edit") === "1") {
      startedFromQuery.current = true;
      beginEditing(page);
    }
  }, [beginEditing, page]);

  useEffect(() => {
    setPage(initialPage);
    setEditSnapshot((snap) => (snap ? clonePage(initialPage) : null));
  }, [initialPage.id, initialPage.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps -- sync on server identity only

  useEffect(() => {
    if (!isEditing || !isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isEditing, isDirty]);

  const setEditing = useCallback(
    (value: boolean) => {
      if (value) {
        beginEditing(page);
        return;
      }
      // Exiting via setEditing(false) uses the same discard path as Cancel
      if (
        editSnapshot &&
        pageEditFingerprint(page) !== pageEditFingerprint(editSnapshot) &&
        !window.confirm("Discard unsaved changes?")
      ) {
        return;
      }
      if (editSnapshot) setPage(clonePage(editSnapshot));
      setEditSnapshot(null);
      setIsEditing(false);
      setMessage(null);
    },
    [beginEditing, page, editSnapshot]
  );

  const onBlockEdit = useCallback((blockId: string, content: string) => {
    setPage((p) => {
      const map = (arr: ContentBlock[]) =>
        arr.map((b) => (b.id === blockId ? { ...b, content } : b));
      const next = {
        ...p,
        blocks: map(p.blocks),
        leftBlocks: map(p.leftBlocks ?? []),
        rightBlocks: map(p.rightBlocks ?? []),
      };
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
      const map = (arr: ContentBlock[]) =>
        arr.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
      const next = {
        ...p,
        blocks: map(p.blocks),
        leftBlocks: map(p.leftBlocks ?? []),
        rightBlocks: map(p.rightBlocks ?? []),
      };
      if (p.positionBlocks) {
        next.positionBlocks = {};
        for (const [pos, blocks] of Object.entries(p.positionBlocks))
          next.positionBlocks![pos] = map(blocks);
      }
      return next;
    });
  }, []);

  const onAddBlock = useCallback(
    (afterBlockId: string | null, type: BlockType, positionId: PositionId) => {
      const newBlock = createBlock(type);
      setPage((p) => {
        const arr = getBlocksForPosition(p, positionId);
        const blocks = [...arr];
        if (afterBlockId === null) {
          blocks.unshift(newBlock);
        } else {
          const idx = blocks.findIndex((b) => b.id === afterBlockId);
          if (idx >= 0) blocks.splice(idx + 1, 0, newBlock);
          else blocks.push(newBlock);
        }
        return setBlocksForPosition(p, positionId, blocks);
      });
    },
    []
  );

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

  const onMoveBlock = useCallback(
    (blockId: string, direction: "up" | "down", positionId: PositionId) => {
      setPage((p) => {
        const arr = getBlocksForPosition(p, positionId);
        const idx = arr.findIndex((b) => b.id === blockId);
        if (idx < 0) return p;
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= arr.length) return p;
        const blocks = arr.map((b) => ({ ...b }));
        const a = blocks[idx];
        const b = blocks[newIdx];
        // Swap blocks and their gridItems so visual order matches array order
        blocks[idx] = { ...b, gridItem: a.gridItem ?? b.gridItem };
        blocks[newIdx] = { ...a, gridItem: b.gridItem ?? a.gridItem };
        return setBlocksForPosition(p, positionId, blocks);
      });
    },
    []
  );

  const onLayoutChange = useCallback((layout: PageLayout) => {
    setPage((p) => ({
      ...p,
      layout,
      // Keep widths when switching between two-col / three-col; clear otherwise.
      columnWidths: layoutSupportsColumnWidths(layout)
        ? p.columnWidths ?? defaultColumnWidths(layout)
        : undefined,
    }));
  }, []);

  const onModulesChange = useCallback((modules: PageModuleAssignment[]) => {
    setPage((p) => ({ ...p, modules }));
  }, []);

  const onColumnWidthsChange = useCallback((columnWidths: ColumnWidths) => {
    setPage((p) => ({ ...p, columnWidths }));
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
        setEditSnapshot(clonePage(page));
        setIsEditing(false);
        setEditSnapshot(null);
        try {
          options.onSaved?.();
        } catch {
          // ignore so we still show Saved! and clear editing
        }
        setTimeout(() => setMessage(null), 1500);
      } else if (res.status === 401) {
        setMessage("Not signed in — open /admin first");
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
    if (
      editSnapshot &&
      pageEditFingerprint(page) !== pageEditFingerprint(editSnapshot) &&
      !window.confirm("Discard unsaved changes?")
    ) {
      return;
    }
    if (editSnapshot) setPage(clonePage(editSnapshot));
    setEditSnapshot(null);
    setIsEditing(false);
    setMessage(null);
  }, [page, editSnapshot]);

  const callbacks: PageRendererCallbacks = isEditing
    ? {
        onBlockEdit,
        onTitleEdit,
        onBlockUpdate,
        onAddBlock,
        onRemoveBlock,
        onMoveBlock,
        onLayoutChange,
        onModulesChange,
        onColumnWidthsChange,
      }
    : {};

  return {
    page,
    isEditing,
    isDirty,
    setEditing,
    saving,
    message,
    callbacks,
    actions: { save, cancel, setMessage },
  };
}

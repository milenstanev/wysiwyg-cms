"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { WidthProvider, ReactGridLayout } from "react-grid-layout/legacy";
import type { ContentBlock } from "@/lib/cms/types";
import { ContentBlock as ContentBlockComponent } from "./ContentBlock";
import { AddBlockButton } from "./AddBlockButton";
import { BlockSettingsPanel } from "./BlockSettingsPanel";
import { BLOCK_SETTINGS } from "@/lib/cms/block-settings";
import { usePortalPosition } from "@/hooks/usePortalPosition";
import type { PositionId } from "@/lib/cms/types";

/** Fine grid: ~1px per unit so resize is pixel-level. 1200 cols × 1px rows. */
const COLS = 1200;
const ROW_HEIGHT = 1;
const MARGIN: [number, number] = [4, 4];

const GridWithWidth = WidthProvider(ReactGridLayout);

type BlockType = "heading" | "text" | "image" | "banner" | "list" | "table" | "showcase";

/**
 * Block types that are resizable only by height (width locked to full column).
 * Image and showcase can be resized in both dimensions.
 */
const RESIZE_HEIGHT_ONLY_TYPES: BlockType[] = ["heading", "text", "banner", "list", "table"];

/** In dev: scarcer default heights so content and behavior are easier to see. */
const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
const DEFAULT_BLOCK_HEIGHT = isDev ? 48 : 80;
const LEGACY_ROW_HEIGHT_PX = isDev ? 28 : 40;

interface BlockGridLayoutProps {
  blocks: ContentBlock[];
  positionId: PositionId;
  editable?: boolean;
  onBlockEdit?: (blockId: string, content: string) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<ContentBlock>) => void;
  onAddBlock?: (afterBlockId: string | null, type: BlockType, positionId: PositionId) => void;
  onRemoveBlock?: (blockId: string) => void;
  onMoveBlock?: (blockId: string, direction: "up" | "down", positionId: PositionId) => void;
  addBlockLabel?: string;
}

/** Scale from legacy 12/24-col layout to fine grid (1200). */
function scaleToFineGrid(n: number, fromCols: number): number {
  if (!Number.isFinite(n) || !Number.isFinite(fromCols) || fromCols <= 0) return 0;
  return fromCols < COLS ? Math.round((n * COLS) / fromCols) : n;
}

function safeNum(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function blockToLayoutItem(
  block: ContentBlock,
  index: number
): {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
} {
  const g = block.gridItem;
  const gw = g ? safeNum(g.w, COLS) : COLS;
  const legacyCols = g && gw <= 24 ? (gw <= 12 ? 12 : 24) : null;
  const isLegacy = legacyCols != null;
  const w = g ? (isLegacy ? scaleToFineGrid(gw, legacyCols) : safeNum(g.w, COLS)) : COLS;
  const heightOnly = RESIZE_HEIGHT_ONLY_TYPES.includes(block.type as BlockType);
  const x = g ? (isLegacy ? scaleToFineGrid(safeNum(g.x, 0), legacyCols) : safeNum(g.x, 0)) : 0;
  const y = g
    ? isLegacy
      ? safeNum(g.y, 0) * LEGACY_ROW_HEIGHT_PX
      : safeNum(g.y, index * LEGACY_ROW_HEIGHT_PX)
    : index * LEGACY_ROW_HEIGHT_PX;
  const h = g
    ? isLegacy
      ? Math.max(1, safeNum(g.h, DEFAULT_BLOCK_HEIGHT) * LEGACY_ROW_HEIGHT_PX)
      : Math.max(1, safeNum(g.h, DEFAULT_BLOCK_HEIGHT))
    : DEFAULT_BLOCK_HEIGHT;
  const maxH = g?.maxH != null && Number.isFinite(g.maxH) ? g.maxH : undefined;
  return {
    i: block.id,
    x,
    y,
    w,
    h,
    minW: heightOnly ? w : 1,
    minH: 1,
    maxW: heightOnly ? w : COLS,
    maxH,
  };
}

export function BlockGridLayout({
  blocks,
  positionId,
  editable = false,
  onBlockEdit,
  onBlockUpdate,
  onAddBlock,
  onRemoveBlock,
  onMoveBlock,
  addBlockLabel,
}: BlockGridLayoutProps) {
  const layout = useMemo(() => blocks.map((b, i) => blockToLayoutItem(b, i)), [blocks]);

  const blockIds = useMemo(() => new Set(blocks.map((b) => b.id)), [blocks]);

  const handleLayoutChange = useCallback(
    (newLayout: ReadonlyArray<{ i: string; x: number; y: number; w: number; h: number }>) => {
      if (!onBlockUpdate) return;
      newLayout.forEach((item) => {
        if (!blockIds.has(item.i)) return;
        const block = blocks.find((b) => b.id === item.i);
        const heightOnly = block && RESIZE_HEIGHT_ONLY_TYPES.includes(block.type as BlockType);
        const prev = layout.find((l) => l.i === item.i);
        const w = heightOnly && prev ? prev.w : item.w;
        onBlockUpdate(item.i, { gridItem: { x: item.x, y: item.y, w, h: item.h } });
      });
    },
    [onBlockUpdate, blocks, layout, blockIds]
  );

  const label = addBlockLabel ?? positionId;
  const hasBlocks = blocks.length > 0;
  const [gridReady, setGridReady] = useState(false);
  const [settingsBlockId, setSettingsBlockId] = useState<string | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const portalPosition = usePortalPosition(settingsButtonRef, !!settingsBlockId, {
    alignRight: true,
    width: 240,
    gap: 4,
    anchorKey: settingsBlockId ?? undefined,
  });

  useEffect(() => {
    if (!settingsBlockId) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        settingsPanelRef.current &&
        !settingsPanelRef.current.contains(e.target as Node) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(e.target as Node)
      ) {
        setSettingsBlockId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsBlockId]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setGridReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const addBlockTopInFlow = editable && onAddBlock && !hasBlocks;
  const addBlockTopFloating = editable && onAddBlock && hasBlocks;
  const addBlockBottomFloating = editable && onAddBlock && hasBlocks;

  return (
    <div className={`w-full ${editable && hasBlocks ? "group/column relative" : ""}`}>
      {/* Add block (top): in flow only when empty; when has blocks, absolute so layout never moves */}
      {addBlockTopInFlow && (
        <div className="py-3">
          <AddBlockButton
            onSelect={(type) => onAddBlock!(null, type, positionId)}
            label={`Add block (${label})`}
          />
        </div>
      )}
      {addBlockTopFloating && (
        <div className="absolute left-0 right-0 top-0 z-10 py-3 opacity-0 transition-opacity group-hover/column:opacity-100 pointer-events-none group-hover/column:pointer-events-auto">
          <AddBlockButton
            onSelect={(type) => onAddBlock!(null, type, positionId)}
            label={`Add block (${label})`}
          />
        </div>
      )}

      {!hasBlocks && !editable && (
        <div className="py-8 text-center text-sm text-zinc-400" data-empty-blocks>
          No content in this area.
        </div>
      )}

      {hasBlocks && (
        <GridWithWidth
          measureBeforeMount
          className={`block-grid-layout ${isDev ? "min-h-[80px]" : "min-h-[120px]"}${gridReady ? " block-grid-ready" : ""}`}
          layout={layout}
          onLayoutChange={handleLayoutChange}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          margin={MARGIN}
          containerPadding={MARGIN}
          isDraggable={editable}
          isResizable={editable}
          draggableCancel=".block-toolbar"
          compactType="vertical"
          preventCollision={false}
          useCSSTransforms
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              className="group/block relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-[border-color,box-shadow] hover:border-[var(--accent)] hover:shadow-md"
              data-grid={blockToLayoutItem(block, blocks.indexOf(block))}
              data-testid="content-block"
              data-block-type={block.type}
            >
              {/* Block toolbar: visible on hover or when any toolbar button has focus (keyboard accessible). z-20 so it stays above grid and is clickable. */}
              {editable &&
                (onRemoveBlock ||
                  onMoveBlock ||
                  (onBlockUpdate && (BLOCK_SETTINGS[block.type]?.length ?? 0) > 0)) && (
                  <div className="block-toolbar absolute right-1 top-1 z-20 flex items-center gap-0.5 rounded bg-white shadow-sm ring-1 ring-zinc-200 transition-opacity group-hover/block:opacity-100 group-hover/block:pointer-events-auto group-focus-within/block:opacity-100 group-focus-within/block:pointer-events-auto pointer-events-none">
                    {onBlockUpdate && (BLOCK_SETTINGS[block.type]?.length ?? 0) > 0 && (
                      <>
                        <button
                          ref={settingsBlockId === block.id ? settingsButtonRef : undefined}
                          type="button"
                          onClick={() =>
                            setSettingsBlockId((id) => (id === block.id ? null : block.id))
                          }
                          className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                          title="Block settings"
                          aria-label="Block settings"
                          aria-expanded={settingsBlockId === block.id}
                          data-testid="block-settings"
                        >
                          ⚙
                        </button>
                        {settingsBlockId === block.id &&
                          portalPosition &&
                          (() => {
                            const settingsBlock = blocks.find((b) => b.id === settingsBlockId);
                            if (!settingsBlock) return null;
                            return createPortal(
                              <div
                                ref={settingsPanelRef}
                                className="fixed z-[9999] min-w-[200px] rounded-lg border border-zinc-200 bg-white shadow-lg"
                                style={{ top: portalPosition.top, left: portalPosition.left }}
                              >
                                <BlockSettingsPanel
                                  block={settingsBlock}
                                  onSettingsChange={(settings) =>
                                    settingsBlockId && onBlockUpdate(settingsBlockId, { settings })
                                  }
                                  onClose={() => setSettingsBlockId(null)}
                                />
                              </div>,
                              document.body
                            );
                          })()}
                      </>
                    )}
                    {onMoveBlock && (
                      <>
                        {blocks.indexOf(block) > 0 && (
                          <button
                            type="button"
                            onClick={() => onMoveBlock(block.id, "up", positionId)}
                            className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                            title="Move up"
                            aria-label="Move up"
                            data-testid="move-block-up"
                          >
                            ↑
                          </button>
                        )}
                        {blocks.indexOf(block) < blocks.length - 1 && (
                          <button
                            type="button"
                            onClick={() => onMoveBlock(block.id, "down", positionId)}
                            className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                            title="Move down"
                            aria-label="Move down"
                            data-testid="move-block-down"
                          >
                            ↓
                          </button>
                        )}
                      </>
                    )}
                    {onRemoveBlock && (
                      <button
                        type="button"
                        onClick={() => onRemoveBlock(block.id)}
                        className="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                        title="Remove block"
                        aria-label="Remove block"
                        data-testid="remove-block"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              <div className="p-3">
                <ContentBlockComponent
                  block={block}
                  editable={editable}
                  onEdit={onBlockEdit}
                  onBlockUpdate={onBlockUpdate}
                />
              </div>
            </div>
          ))}
        </GridWithWidth>
      )}

      {/* Add block (bottom): absolute so it never shifts layout */}
      {addBlockBottomFloating && (
        <div className="absolute left-0 right-0 bottom-0 z-10 flex items-center gap-2 py-2 opacity-0 transition-opacity group-hover/column:opacity-100 pointer-events-none group-hover/column:pointer-events-auto">
          <div className="flex-1 border-t border-dashed border-zinc-200" />
          <AddBlockButton
            onSelect={(type) => onAddBlock!(blocks[blocks.length - 1].id, type, positionId)}
            label="Add block"
            variant="compact"
          />
          <div className="flex-1 border-t border-dashed border-zinc-200" />
        </div>
      )}
    </div>
  );
}

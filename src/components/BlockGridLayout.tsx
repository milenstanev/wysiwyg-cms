"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { portalRoot } from "@/lib/portal-root";
import type { ContentBlock } from "@/lib/cms/types";
import { ContentBlock as ContentBlockComponent } from "./ContentBlock";
import { AddBlockButton } from "./AddBlockButton";
import { BlockSettingsPanel } from "./BlockSettingsPanel";
import { getListItems } from "./blocks/ListBlock";
import { getTableRows, withEmptyRow } from "./blocks/TableBlock";
import { BLOCK_SETTINGS, getBlockSettingOrDefault } from "@/lib/cms/block-settings";
import { usePortalPosition, type PortalPosition } from "@/hooks/usePortalPosition";
import { useEditPopover } from "@/hooks/useEditPopover";
import { useDropdownA11y } from "@/hooks/useDropdownA11y";
import type { PositionId } from "@/lib/cms/types";
import { MediaPicker } from "./MediaPicker";
import { TEST_ID } from "@/lib/test-ids";

type BlockType = "heading" | "text" | "image" | "banner" | "list" | "table" | "showcase";

/** 16px gutters — must match --space-4. Kept for any future grid math / tests. */
const GUTTER = 16;
const ROW_HEIGHT = 1;
const MIN_HEIGHT_UNITS = 3;

/** Convert a target pixel height to grid units (exported for tests / legacy helpers). */
export function pxToGridUnits(px: number): number {
  return Math.max(MIN_HEIGHT_UNITS, Math.round((px + GUTTER) / (ROW_HEIGHT + GUTTER)));
}

/** Proximity: a heading sits closer to the block it introduces than to the block before it. */
function blockUnitClassName(blocks: ContentBlock[], index: number): string {
  if (index === 0) return "block-unit";
  if (blocks[index - 1].type === "heading") return "block-unit block-unit-after-heading";
  if (blocks[index].type === "heading") return "block-unit block-unit-heading";
  return "block-unit";
}

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

/**
 * Small "⋯" button that reveals every block control in a hover / focus popover.
 * Absolutely positioned outside `.content-block`, so edit mode never changes block layout.
 */
function BlockControls({
  block,
  blocks,
  positionId,
  onBlockUpdate,
  onAddBlock,
  onRemoveBlock,
  onMoveBlock,
  settingsBlockId,
  setSettingsBlockId,
  settingsButtonRef,
  settingsPanelRef,
  portalPosition,
}: {
  block: ContentBlock;
  blocks: ContentBlock[];
  positionId: PositionId;
  onBlockUpdate?: (blockId: string, updates: Partial<ContentBlock>) => void;
  onAddBlock?: (afterBlockId: string | null, type: BlockType, positionId: PositionId) => void;
  onRemoveBlock?: (blockId: string) => void;
  onMoveBlock?: (blockId: string, direction: "up" | "down", positionId: PositionId) => void;
  settingsBlockId: string | null;
  setSettingsBlockId: React.Dispatch<React.SetStateAction<string | null>>;
  settingsButtonRef: React.RefObject<HTMLButtonElement | null>;
  settingsPanelRef: React.RefObject<HTMLDivElement | null>;
  portalPosition: PortalPosition | null;
}) {
  const [addOpen, setAddOpen] = useState<"above" | "below" | null>(null);
  const hasSettings = onBlockUpdate && (BLOCK_SETTINGS[block.type]?.length ?? 0) > 0;
  const settingsOpen = settingsBlockId === block.id;
  const index = blocks.indexOf(block);
  const previousId = index > 0 ? blocks[index - 1].id : null;
  const pinned = settingsOpen || addOpen !== null;
  useDropdownA11y({
    open: settingsOpen,
    setOpen: (open) => {
      if (!open) setSettingsBlockId(null);
    },
    triggerRef: settingsButtonRef,
    panelRef: settingsPanelRef,
  });
  const { rootProps, triggerProps } = useEditPopover({
    pinned,
    onDismiss: () => {
      if (settingsOpen) setSettingsBlockId(null);
      setAddOpen(null);
    },
  });

  return (
    <div
      className="edit-popover block-controls"
      data-testid={TEST_ID.blockToolbar}
      data-open={pinned ? "true" : undefined}
      {...rootProps}
    >
      <button
        type="button"
        className="edit-chip"
        aria-label="Block actions"
        title="Block actions"
        data-testid={TEST_ID.blockControlsTrigger}
        {...triggerProps}
      >
        <span aria-hidden>⋯</span>
      </button>
      <div
        className="edit-popover-menu"
        role="toolbar"
        aria-label="Block controls"
        aria-orientation="vertical"
        data-testid={TEST_ID.blockControlsMenu}
      >
        {hasSettings && (
          <button
            ref={settingsOpen ? settingsButtonRef : undefined}
            type="button"
            onClick={() => setSettingsBlockId((id) => (id === block.id ? null : block.id))}
            className="edit-menu-item"
            aria-label="Block settings"
            aria-expanded={settingsOpen}
            data-testid={TEST_ID.blockSettings}
          >
            <span aria-hidden className="edit-menu-icon">
              ⚙
            </span>
            Settings
          </button>
        )}
        {block.type === "image" && onBlockUpdate && (
          <MediaPicker
            value={block.content ?? ""}
            onChange={(url) => onBlockUpdate(block.id, { content: url })}
            alt={String(getBlockSettingOrDefault(block, "alt", ""))}
            onAltChange={(alt) =>
              onBlockUpdate(block.id, {
                settings: { ...(block.settings ?? {}), alt },
              })
            }
          />
        )}
        {block.type === "list" && onBlockUpdate && (
          <button
            type="button"
            className="edit-menu-item"
            onClick={() => {
              const items = [...getListItems(block.items, block.content), "New item"];
              onBlockUpdate(block.id, { items, content: items.join("\n") });
            }}
          >
            <span aria-hidden className="edit-menu-icon">
              +
            </span>
            Add item
          </button>
        )}
        {block.type === "table" && onBlockUpdate && (
          <button
            type="button"
            className="edit-menu-item"
            onClick={() =>
              onBlockUpdate(block.id, { rows: withEmptyRow(getTableRows(block.rows, block.content)) })
            }
          >
            <span aria-hidden className="edit-menu-icon">
              +
            </span>
            Add row
          </button>
        )}
        {onMoveBlock && index > 0 && (
          <button
            type="button"
            onClick={() => onMoveBlock(block.id, "up", positionId)}
            className="edit-menu-item"
            aria-label="Move up"
            data-testid={TEST_ID.moveBlockUp}
          >
            <span aria-hidden className="edit-menu-icon">
              ↑
            </span>
            Move up
          </button>
        )}
        {onMoveBlock && index < blocks.length - 1 && (
          <button
            type="button"
            onClick={() => onMoveBlock(block.id, "down", positionId)}
            className="edit-menu-item"
            aria-label="Move down"
            data-testid={TEST_ID.moveBlockDown}
          >
            <span aria-hidden className="edit-menu-icon">
              ↓
            </span>
            Move down
          </button>
        )}
        {onAddBlock && (
          <>
            <AddBlockButton
              variant="menu"
              label="Add block above"
              onSelect={(type) => onAddBlock(previousId, type, positionId)}
              onOpenChange={(open) => setAddOpen((s) => (open ? "above" : s === "above" ? null : s))}
            />
            <AddBlockButton
              variant="menu"
              label="Add block below"
              onSelect={(type) => onAddBlock(block.id, type, positionId)}
              onOpenChange={(open) => setAddOpen((s) => (open ? "below" : s === "below" ? null : s))}
            />
          </>
        )}
        {onRemoveBlock && (
          <button
            type="button"
            onClick={() => onRemoveBlock(block.id)}
            className="edit-menu-item edit-menu-danger"
            aria-label="Remove block"
            data-testid={TEST_ID.removeBlock}
          >
            <span aria-hidden className="edit-menu-icon">
              ✕
            </span>
            Remove
          </button>
        )}
      </div>
      {settingsOpen &&
        portalPosition &&
        onBlockUpdate &&
        createPortal(
          <div
            ref={settingsPanelRef}
            role="group"
            aria-label="Block settings"
            className="fixed z-[9999] min-w-[200px] rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg"
            style={portalPosition}
          >
            <BlockSettingsPanel
              block={block}
              onSettingsChange={(settings) => onBlockUpdate(block.id, { settings })}
              onClose={() => setSettingsBlockId(null)}
            />
          </div>,
          portalRoot()
        )}
    </div>
  );
}

/**
 * Renders blocks in a content-sized vertical stack.
 * View and edit share the exact same box tree; edit chrome is absolutely positioned
 * (zero layout footprint) so content never moves when toggling edit mode.
 */
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
  const label = addBlockLabel ?? positionId;
  const hasBlocks = blocks.length > 0;
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

  return (
    <div className="block-column" data-testid={editable ? TEST_ID.blockEditColumn : undefined}>
      {editable && onAddBlock && (
        <div className="block-region-add" data-testid={TEST_ID.blockAddSlot}>
          <AddBlockButton
            variant="compact"
            onSelect={(type) => onAddBlock(null, type, positionId)}
            label={`Add block (${label})`}
          />
        </div>
      )}

      {!hasBlocks && (
        <div className="py-[var(--space-6)] text-center text-sm text-[var(--muted)]" data-empty-blocks>
          No content in this area.
        </div>
      )}

      {hasBlocks && (
        <div className="block-grid-layout block-stack" data-testid={TEST_ID.blockStack}>
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={blockUnitClassName(blocks, index)}
              data-testid={editable ? TEST_ID.blockEditUnit : undefined}
            >
              {editable && (
                <BlockControls
                  block={block}
                  blocks={blocks}
                  positionId={positionId}
                  onBlockUpdate={onBlockUpdate}
                  onAddBlock={onAddBlock}
                  onRemoveBlock={onRemoveBlock}
                  onMoveBlock={onMoveBlock}
                  settingsBlockId={settingsBlockId}
                  setSettingsBlockId={setSettingsBlockId}
                  settingsButtonRef={settingsButtonRef}
                  settingsPanelRef={settingsPanelRef}
                  portalPosition={portalPosition}
                />
              )}
              <div
                className="content-block"
                data-testid={TEST_ID.contentBlock}
                data-block-type={block.type}
              >
                <div className="block-body" data-block-body={block.id}>
                  <ContentBlockComponent
                    block={block}
                    editable={editable}
                    onEdit={editable ? onBlockEdit : undefined}
                    onBlockUpdate={editable ? onBlockUpdate : undefined}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

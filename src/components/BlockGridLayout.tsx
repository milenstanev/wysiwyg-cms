"use client";

import { useState, useRef } from "react";
import type { ContentBlock } from "@/lib/cms/types";
import { ContentBlock as ContentBlockComponent } from "./ContentBlock";
import { AddBlockButton } from "./AddBlockButton";
import { BlockSettingsPanel } from "./BlockSettingsPanel";
import { getListItems } from "./blocks/ListBlock";
import { getTableRows, withEmptyRow } from "./blocks/TableBlock";
import { BLOCK_SETTINGS, getBlockSettingOrDefault } from "@/lib/cms/block-settings";
import { useDropdownA11y } from "@/hooks/useDropdownA11y";
import type { PositionId } from "@/lib/cms/types";
import { MediaPicker } from "./MediaPicker";
import { TEST_ID } from "@/lib/test-ids";
import {
  EditMenuItem,
  EditPopover,
  EditPortalPanel,
  EDIT_PORTAL_GAP,
} from "@/components/edit-chrome";

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

  return (
    <EditPopover
      className="block-controls"
      pinned={pinned}
      rootTestId={TEST_ID.blockToolbar}
      onDismiss={() => {
        if (settingsOpen) setSettingsBlockId(null);
        setAddOpen(null);
      }}
      trigger={{
        label: "Block actions",
        testId: TEST_ID.blockControlsTrigger,
        children: <span aria-hidden>⋯</span>,
      }}
      menu={{
        role: "toolbar",
        "aria-label": "Block controls",
        "aria-orientation": "vertical",
        testId: TEST_ID.blockControlsMenu,
        children: (
          <>
            {hasSettings && (
              <EditMenuItem
                ref={settingsOpen ? settingsButtonRef : undefined}
                onClick={() => setSettingsBlockId((id) => (id === block.id ? null : block.id))}
                aria-label="Block settings"
                aria-expanded={settingsOpen}
                data-testid={TEST_ID.blockSettings}
                icon="⚙"
              >
                Settings
              </EditMenuItem>
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
              <EditMenuItem
                icon="+"
                onClick={() => {
                  const items = [...getListItems(block.items, block.content), "New item"];
                  onBlockUpdate(block.id, { items, content: items.join("\n") });
                }}
              >
                Add item
              </EditMenuItem>
            )}
            {block.type === "table" && onBlockUpdate && (
              <EditMenuItem
                icon="+"
                onClick={() =>
                  onBlockUpdate(block.id, {
                    rows: withEmptyRow(getTableRows(block.rows, block.content)),
                  })
                }
              >
                Add row
              </EditMenuItem>
            )}
            {onMoveBlock && index > 0 && (
              <EditMenuItem
                icon="↑"
                onClick={() => onMoveBlock(block.id, "up", positionId)}
                aria-label="Move up"
                data-testid={TEST_ID.moveBlockUp}
              >
                Move up
              </EditMenuItem>
            )}
            {onMoveBlock && index < blocks.length - 1 && (
              <EditMenuItem
                icon="↓"
                onClick={() => onMoveBlock(block.id, "down", positionId)}
                aria-label="Move down"
                data-testid={TEST_ID.moveBlockDown}
              >
                Move down
              </EditMenuItem>
            )}
            {onAddBlock && (
              <>
                <AddBlockButton
                  variant="menu"
                  label="Add block above"
                  onSelect={(type) => onAddBlock(previousId, type, positionId)}
                  onOpenChange={(open) =>
                    setAddOpen((s) => (open ? "above" : s === "above" ? null : s))
                  }
                />
                <AddBlockButton
                  variant="menu"
                  label="Add block below"
                  onSelect={(type) => onAddBlock(block.id, type, positionId)}
                  onOpenChange={(open) =>
                    setAddOpen((s) => (open ? "below" : s === "below" ? null : s))
                  }
                />
              </>
            )}
            {onRemoveBlock && (
              <EditMenuItem
                danger
                icon="✕"
                onClick={() => onRemoveBlock(block.id)}
                aria-label="Remove block"
                data-testid={TEST_ID.removeBlock}
              >
                Remove
              </EditMenuItem>
            )}
          </>
        ),
      }}
    >
      {onBlockUpdate && (
        <EditPortalPanel
          open={settingsOpen}
          anchorRef={settingsButtonRef}
          panelRef={settingsPanelRef}
          alignRight
          width={240}
          gap={EDIT_PORTAL_GAP}
          anchorKey={block.id}
          aria-label="Block settings"
          className="min-w-[200px]"
        >
          <BlockSettingsPanel
            block={block}
            onSettingsChange={(settings) => onBlockUpdate(block.id, { settings })}
            onClose={() => setSettingsBlockId(null)}
          />
        </EditPortalPanel>
      )}
    </EditPopover>
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
        <div
          className="py-[var(--space-6)] text-center text-sm text-[var(--muted)]"
          data-empty-blocks
        >
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

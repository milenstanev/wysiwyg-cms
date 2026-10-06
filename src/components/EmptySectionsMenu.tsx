"use client";

import { useState } from "react";
import { AddBlockButton } from "./AddBlockButton";
import { useEditPopover } from "@/hooks/useEditPopover";
import type { BlockType, ModuleId, PositionId } from "@/lib/cms/types";
import { MODULE_IDS } from "@/lib/cms/types";
import { MODULE_REGISTRY } from "@/lib/cms/modules";
import { TEST_ID } from "@/lib/test-ids";

interface EmptySectionsMenuProps {
  sections: { positionId: string; label: string }[];
  onAddBlock: (afterBlockId: string | null, type: BlockType, positionId: PositionId) => void;
  onAddModule?: (positionId: string, moduleId: ModuleId) => void;
}

/**
 * Empty layout sections are hidden in edit mode exactly like in view mode.
 * This overlay popover is the entry point for adding the first block or module to one of them.
 */
export function EmptySectionsMenu({ sections, onAddBlock, onAddModule }: EmptySectionsMenuProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { rootProps, triggerProps } = useEditPopover({ pinned: openId !== null });

  return (
    <div
      className="edit-popover empty-sections-menu"
      data-testid={TEST_ID.emptySectionsMenu}
      data-open={openId ? "true" : undefined}
      {...rootProps}
    >
      <button
        type="button"
        className="edit-chip edit-chip-wide"
        aria-label={`Add to empty section (${sections.length})`}
        title="Add to an empty section"
        {...triggerProps}
      >
        <span aria-hidden>+</span> Section
      </button>
      <div className="edit-popover-menu" role="group" aria-label="Empty sections">
        <p className="edit-menu-heading">Empty sections</p>
        {sections.map(({ positionId, label }) => (
          <div key={positionId} className="space-y-[var(--space-1)]">
            <AddBlockButton
              variant="menu"
              label={`Add block (${label})`}
              onSelect={(type) => onAddBlock(null, type, positionId as PositionId)}
              onOpenChange={(open) =>
                setOpenId((id) => (open ? positionId : id === positionId ? null : id))
              }
            />
            {onAddModule &&
              MODULE_IDS.map((moduleId) => (
                <button
                  key={`${positionId}-${moduleId}`}
                  type="button"
                  className="edit-menu-item"
                  onClick={() => onAddModule(positionId, moduleId)}
                >
                  + {MODULE_REGISTRY[moduleId].label} ({label})
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

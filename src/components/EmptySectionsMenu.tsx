"use client";

import { useState } from "react";
import { AddBlockButton } from "./AddBlockButton";
import { EditMenuItem, EditPopover } from "@/components/edit-chrome";
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

  return (
    <EditPopover
      className="empty-sections-menu"
      pinned={openId !== null}
      rootTestId={TEST_ID.emptySectionsMenu}
      trigger={{
        label: `Add to empty section (${sections.length})`,
        title: "Add to an empty section",
        className: "edit-chip edit-chip-wide",
        children: (
          <>
            <span aria-hidden>+</span> Section
          </>
        ),
      }}
      menu={{
        role: "group",
        "aria-label": "Empty sections",
        children: (
          <>
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
                    <EditMenuItem
                      key={`${positionId}-${moduleId}`}
                      onClick={() => onAddModule(positionId, moduleId)}
                    >
                      + {MODULE_REGISTRY[moduleId].label} ({label})
                    </EditMenuItem>
                  ))}
              </div>
            ))}
          </>
        ),
      }}
    />
  );
}

import { ContentBlock } from "@/lib/cms/types";
import type { PositionId } from "@/lib/cms/types";
import { BlockGridLayout } from "./BlockGridLayout";

type BlockType = "heading" | "text" | "image" | "banner" | "list" | "table" | "showcase";

interface BlocksColumnProps {
  blocks: ContentBlock[];
  /** Position id (main, left, right, or e.g. utility-a, showcase-b) for add/move callbacks and label. */
  region: PositionId;
  editable?: boolean;
  onBlockEdit?: (blockId: string, content: string) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<ContentBlock>) => void;
  onAddBlock?: (afterBlockId: string | null, type: BlockType, positionId: PositionId) => void;
  onRemoveBlock?: (blockId: string) => void;
  onMoveBlock?: (blockId: string, direction: "up" | "down", positionId: PositionId) => void;
  /** Optional label for "Add block (…)" e.g. "Utility A" instead of "utility-a". */
  addBlockLabel?: string;
}

/**
 * Renders blocks in a React Grid Layout: each block is draggable and resizable in edit mode.
 * Size and position are stored on each block as gridItem and persist with the page.
 */
export function BlocksColumn({
  blocks,
  region,
  editable = false,
  onBlockEdit,
  onBlockUpdate,
  onAddBlock,
  onRemoveBlock,
  onMoveBlock,
  addBlockLabel,
}: BlocksColumnProps) {
  return (
    <BlockGridLayout
      blocks={blocks}
      positionId={region}
      editable={editable}
      onBlockEdit={onBlockEdit}
      onBlockUpdate={onBlockUpdate}
      onAddBlock={onAddBlock}
      onRemoveBlock={onRemoveBlock}
      onMoveBlock={onMoveBlock}
      addBlockLabel={addBlockLabel}
    />
  );
}

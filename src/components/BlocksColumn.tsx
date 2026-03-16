import { ContentBlock } from "@/lib/cms/types";
import type { PositionId } from "@/lib/cms/types";
import { ContentBlock as ContentBlockComponent } from "./ContentBlock";
import { AddBlockButton } from "./AddBlockButton";

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
  const label = addBlockLabel ?? region;
  const wrappedOnAddBlock = onAddBlock
    ? (afterId: string | null, type: "heading" | "text" | "image" | "banner" | "list" | "table" | "showcase") =>
        onAddBlock(afterId, type, region)
    : undefined;
  const wrappedOnMoveBlock = onMoveBlock
    ? (blockId: string, dir: "up" | "down") => onMoveBlock(blockId, dir, region)
    : undefined;

  return (
    <div className="space-y-6">
      {editable && onAddBlock && (
        <div className="py-3">
          <AddBlockButton
            onSelect={(type) => onAddBlock(null, type, region)}
            label={`Add block (${label})`}
          />
        </div>
      )}
      {blocks.map((block, index) => (
        <div key={block.id} className="group/block">
          {editable && onAddBlock && (
            <div className="flex items-center gap-2 py-1 -mt-1 mb-1 opacity-0 group-hover/block:opacity-100 hover:opacity-100 transition-opacity">
              <div className="flex-1 h-px bg-zinc-200" />
              <AddBlockButton
                onSelect={(type) =>
                  onAddBlock(index === 0 ? null : blocks[index - 1].id, type, region)
                }
                variant="compact"
              />
              <div className="flex-1 h-px bg-zinc-200" />
            </div>
          )}
          <div
            className={`relative ${
              editable
                ? `outline outline-2 outline-dashed outline-zinc-300 outline-offset-2 rounded ${
                    (onRemoveBlock && blocks.length > 1) || onMoveBlock ? "pl-12" : ""
                  }`
                : ""
            }`}
          >
            {editable && (
              <div className="absolute left-2 top-2 flex flex-col gap-0.5">
                {onMoveBlock && (
                  <>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => onMoveBlock(block.id, "up", region as PositionId)}
                        className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded"
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    {index < blocks.length - 1 && (
                      <button
                        type="button"
                        onClick={() => onMoveBlock(block.id, "down", region as PositionId)}
                        className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded"
                        title="Move down"
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
                    className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Remove block"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
            <ContentBlockComponent block={block} editable={editable} onEdit={onBlockEdit} onBlockUpdate={onBlockUpdate} />
          </div>
        </div>
      ))}
      {editable && onAddBlock && blocks.length > 0 && (
        <div className="flex items-center gap-2 pt-4">
          <div className="flex-1 h-px bg-zinc-200" />
          <AddBlockButton
            onSelect={(type) => onAddBlock(blocks[blocks.length - 1].id, type, region)}
            label="Add block"
            variant="compact"
          />
          <div className="flex-1 h-px bg-zinc-200" />
        </div>
      )}
    </div>
  );
}

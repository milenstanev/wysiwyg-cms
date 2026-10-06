"use client";

import type { ContentBlock, BlockType, PositionId } from "@/lib/cms/types";
import { BlocksColumn } from "@/components/BlocksColumn";

export interface ArticleComponentProps {
  blocks: ContentBlock[];
  region: PositionId;
  editable?: boolean;
  publishedAt?: string;
  description?: string;
  onBlockEdit?: (blockId: string, content: string) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<ContentBlock>) => void;
  onAddBlock?: (afterBlockId: string | null, type: BlockType, positionId: PositionId) => void;
  onRemoveBlock?: (blockId: string) => void;
  onMoveBlock?: (blockId: string, direction: "up" | "down", positionId: PositionId) => void;
}

/** Long-form article: optional meta + content blocks. */
export function ArticleComponent({
  blocks,
  region,
  editable,
  publishedAt,
  description,
  onBlockEdit,
  onBlockUpdate,
  onAddBlock,
  onRemoveBlock,
  onMoveBlock,
}: ArticleComponentProps) {
  return (
    <div data-component="article" className="space-y-[var(--space-4)]">
      {(description || publishedAt) && (
        <header className="space-y-[var(--space-1)] border-b border-[var(--border)] pb-[var(--space-3)]">
          {description && <p className="text-[var(--muted)] text-sm">{description}</p>}
          {publishedAt && (
            <time dateTime={publishedAt} className="text-xs text-[var(--muted)]">
              {new Date(publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
        </header>
      )}
      <BlocksColumn
        blocks={blocks}
        region={region}
        editable={editable}
        onBlockEdit={onBlockEdit}
        onBlockUpdate={onBlockUpdate}
        onAddBlock={onAddBlock}
        onRemoveBlock={onRemoveBlock}
        onMoveBlock={onMoveBlock}
      />
    </div>
  );
}

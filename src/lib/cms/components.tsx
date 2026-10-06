"use client";

import type { ComponentType, Region, PositionId, Page } from "./types";
import type { ContentBlock } from "./types";
import { BlocksColumn } from "@/components/BlocksColumn";
import type { BlockType } from "./types";
import { ArticleComponent } from "@/components/components/ArticleComponent";
import { ListComponent } from "@/components/components/ListComponent";
import { ContactComponent } from "@/components/components/ContactComponent";

const DEFAULT_COMPONENT: ComponentType = "content";

export function getComponentForRegion(
  page: {
    mainComponent?: ComponentType;
    leftComponent?: ComponentType;
    rightComponent?: ComponentType;
  },
  region: Region
): ComponentType {
  switch (region) {
    case "main":
      return page.mainComponent ?? DEFAULT_COMPONENT;
    case "left":
      return page.leftComponent ?? DEFAULT_COMPONENT;
    case "right":
      return page.rightComponent ?? DEFAULT_COMPONENT;
  }
}

export interface ComponentSlotPages {
  id: string;
  slug: string;
  title: string;
}

export interface ComponentSlotProps {
  component: ComponentType;
  region: Region;
  blocks: ContentBlock[];
  page?: Pick<Page, "publishedAt" | "seo">;
  pages?: ComponentSlotPages[];
  editable?: boolean;
  onBlockEdit?: (blockId: string, content: string) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<ContentBlock>) => void;
  onAddBlock?: (afterBlockId: string | null, type: BlockType, positionId: PositionId) => void;
  onRemoveBlock?: (blockId: string) => void;
  onMoveBlock?: (blockId: string, direction: "up" | "down", positionId: PositionId) => void;
}

/**
 * Renders the appropriate component for a layout region.
 * Joomla-style: each region (main, left, right) hosts one component.
 */
export function ComponentSlot({
  component,
  region,
  blocks,
  page,
  pages,
  editable,
  onBlockEdit,
  onBlockUpdate,
  onAddBlock,
  onRemoveBlock,
  onMoveBlock,
}: ComponentSlotProps) {
  const blockProps = {
    editable,
    onBlockEdit,
    onBlockUpdate,
    onAddBlock,
    onRemoveBlock,
    onMoveBlock,
  };

  switch (component) {
    case "article":
      return (
        <ArticleComponent
          blocks={blocks}
          region={region}
          publishedAt={page?.publishedAt}
          description={page?.seo?.description}
          {...blockProps}
        />
      );
    case "list":
      return <ListComponent pages={pages} editable={editable} />;
    case "contact":
      return <ContactComponent editable={editable} />;
    case "content":
    default:
      return (
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
      );
  }
}

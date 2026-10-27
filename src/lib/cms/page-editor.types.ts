import type {
  ContentBlock,
  Page,
  PageLayout,
  PageModuleAssignment,
  ComponentType,
  ColumnWidths,
} from "./types";
import type { BlockType, PositionId } from "./types";

/** Callbacks passed to PageRenderer when in edit mode. All optional so the renderer can be used read-only. */
export interface PageRendererCallbacks {
  onBlockEdit?: (blockId: string, content: string) => void;
  onTitleEdit?: (title: string) => void;
  onLayoutChange?: (layout: PageLayout) => void;
  onAddBlock?: (afterBlockId: string | null, type: BlockType, positionId: PositionId) => void;
  onRemoveBlock?: (blockId: string) => void;
  onMoveBlock?: (blockId: string, direction: "up" | "down", positionId: PositionId) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<ContentBlock>) => void;
  onModulesChange?: (modules: PageModuleAssignment[]) => void;
  onComponentChange?: (region: "main" | "left" | "right", component: ComponentType) => void;
  onColumnWidthsChange?: (widths: ColumnWidths) => void;
}

/** Optional layout overrides for designers / HTML devs */
export interface PageRendererLayoutOptions {
  twoColGridClassName?: string;
  threeColGridClassName?: string;
  unstyledCards?: boolean;
}

export interface PageRendererNavPage {
  id: string;
  slug: string;
  title: string;
}

export interface PageRendererProps {
  page: Page;
  editable?: boolean;
  /** Published pages for Menu / Search / List components */
  allPages?: PageRendererNavPage[];
  currentSlug?: string;
  onBlockEdit?: (blockId: string, content: string) => void;
  onTitleEdit?: (title: string) => void;
  onLayoutChange?: (layout: PageLayout) => void;
  onAddBlock?: (afterBlockId: string | null, type: BlockType, positionId: PositionId) => void;
  onRemoveBlock?: (blockId: string) => void;
  onMoveBlock?: (blockId: string, direction: "up" | "down", positionId: PositionId) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<ContentBlock>) => void;
  onModulesChange?: (modules: PageModuleAssignment[]) => void;
  onColumnWidthsChange?: (widths: ColumnWidths) => void;
  /** Extra class on the article wrapper */
  contentClassName?: string;
  /** Custom grid classes or unstyled cards */
  layoutOptions?: PageRendererLayoutOptions;
}

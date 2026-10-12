export type BlockType = "heading" | "text" | "image" | "banner" | "list" | "table" | "showcase";

export type PageLayout = "single" | "two-col" | "three-col" | "rockettheme";

/** Joomla-style component: what renders in each layout region (main, left, right) */
export type ComponentType = "content" | "article" | "list" | "contact";

export const COMPONENT_TYPES: ComponentType[] = ["content", "article", "list", "contact"];

export type PageStatus = "draft" | "published";

export const PAGE_STATUSES: PageStatus[] = ["draft", "published"];

/** Built-in module ids that can be assigned to layout positions. */
export type ModuleId = "menu" | "search" | "html";

export const MODULE_IDS: ModuleId[] = ["menu", "search", "html"];

/** Region in the layout template (main/left/right). Other positions use position id string. */
export type Region = "main" | "left" | "right";

/** Any position id (main, left, right, or template position e.g. utility-a, showcase-b). */
export type PositionId = Region | string;

/** Module position name (template cell id). */
export type ModulePosition = string;

export const BLOCK_TYPES: BlockType[] = [
  "heading",
  "text",
  "image",
  "banner",
  "list",
  "table",
  "showcase",
];
export const LAYOUT_OPTIONS: PageLayout[] = ["single", "two-col", "three-col", "rockettheme"];

/** Grid position/size for React Grid Layout (draggable/resizable block wrapper). */
export interface BlockGridItem {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  title?: string;
  items?: string[];
  rows?: string[][];
  /** Optional: position/size in grid layout (edit mode: drag/resize). */
  gridItem?: BlockGridItem;
  /** Type-specific options (e.g. table: headerRow, striped; heading: level). */
  settings?: Record<string, unknown>;
}

/** Assignment of a registered module to a layout position. */
export interface PageModuleAssignment {
  positionId: string;
  moduleId: ModuleId;
  params?: Record<string, unknown>;
}

/** Per-page SEO overrides. */
export interface PageSeo {
  title?: string;
  description?: string;
  ogImage?: string;
}

/**
 * Relative column weights (CSS `fr`) for two-col / three-col layouts.
 * Each value is clamped to 1–4 when resolved for rendering.
 */
export interface ColumnWidths {
  left?: number;
  main?: number;
  right?: number;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  layout?: PageLayout;
  blocks: ContentBlock[];
  /** Optional; only rendered when the active layout includes `left`. */
  leftBlocks?: ContentBlock[];
  /** Optional; only rendered when the active layout includes `right`. */
  rightBlocks?: ContentBlock[];
  /** Optional module-row blocks (e.g. rockettheme utility/showcase/footer). Only rendered when that position exists on the layout. */
  positionBlocks?: Record<string, ContentBlock[]>;
  /** Component to render in each region (default: "content") */
  mainComponent?: ComponentType;
  leftComponent?: ComponentType;
  rightComponent?: ComponentType;
  /** Modules assigned to layout positions */
  modules?: PageModuleAssignment[];
  /** Publishing status (default: published) */
  status?: PageStatus;
  /** When the page was last published */
  publishedAt?: string;
  /** Optional SEO overrides */
  seo?: PageSeo;
  /** Optional column fr weights for two-col / three-col (ignored on other layouts). */
  columnWidths?: ColumnWidths;
  updatedAt: string;
}

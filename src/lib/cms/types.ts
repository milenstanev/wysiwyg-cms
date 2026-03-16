export type BlockType = "heading" | "text" | "image" | "banner" | "list" | "table" | "showcase";

export type PageLayout = "single" | "two-col" | "three-col" | "rockettheme";

/** Joomla-style component: what renders in each layout region (main, left, right) */
export type ComponentType = "content";
// Future: "article" | "list" | "contact" | ...

export const COMPONENT_TYPES: ComponentType[] = ["content"];

/** Region in the layout template (main/left/right). Other positions use position id string. */
export type Region = "main" | "left" | "right";

/** Any position id (main, left, right, or template position e.g. utility-a, showcase-b). */
export type PositionId = Region | string;

/** Reserved for future: module positions (e.g. header, footer, sidebar-top) */
export type ModulePosition = string;
// Future: { position: ModulePosition; moduleId: string; params?: Record<string, unknown> }[]

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

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  title?: string;
  items?: string[];
  rows?: string[][];
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  layout?: PageLayout;
  blocks: ContentBlock[];
  leftBlocks?: ContentBlock[];
  rightBlocks?: ContentBlock[];
  /** Blocks in other template positions (e.g. rockettheme: utility-a, header, showcase-a, footer-a). */
  positionBlocks?: Record<string, ContentBlock[]>;
  /** Component to render in each region (default: "content") */
  mainComponent?: ComponentType;
  leftComponent?: ComponentType;
  rightComponent?: ComponentType;
  /** Reserved for future: modules assigned to positions */
  modules?: unknown;
  updatedAt: string;
}

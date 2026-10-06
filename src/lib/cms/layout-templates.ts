/**
 * Joomla-style flexible layout templates (inspired by RocketTheme / Gantry).
 * A template is a list of rows; each row has a grid and ordered position names.
 * Positions "main", "left", "right" get page content; all others are module positions (placeholders).
 * @see https://rockettheme.com (RocketTheme Joomla templates, 2008–2010s)
 */

export interface LayoutRow {
  /** Grid class for this row (e.g. "grid grid-cols-1 md:grid-cols-3 gap-4") */
  gridClassName: string;
  /** Position names in order — one per grid cell. Use "main" | "left" | "right" for page content. */
  positions: string[];
  /** Optional order classes per position (responsive). Same length as positions. */
  orderClassNames?: string[];
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description?: string;
  rows: LayoutRow[];
}

/** Which position IDs receive page content (blocks). */
export const CONTENT_POSITIONS = ["main", "left", "right"] as const;
export type ContentPosition = (typeof CONTENT_POSITIONS)[number];

export function isContentPosition(id: string): id is ContentPosition {
  return CONTENT_POSITIONS.includes(id as ContentPosition);
}

const TEMPLATES: LayoutTemplate[] = [
  {
    id: "single",
    name: "Single column",
    description: "One content area, full width.",
    rows: [{ gridClassName: "grid grid-cols-1", positions: ["main"] }],
  },
  {
    id: "two-col",
    name: "Two columns",
    description: "Left sidebar + main.",
    rows: [
      {
        gridClassName:
          "grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 sm:gap-6 md:gap-8 lg:gap-10",
        positions: ["left", "main"],
        orderClassNames: ["order-2 md:order-1", "order-1 md:order-2"],
      },
    ],
  },
  {
    id: "three-col",
    name: "Three columns",
    description: "Left + main + right.",
    rows: [
      {
        gridClassName:
          "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] gap-4 sm:gap-6 md:gap-8 lg:gap-10",
        positions: ["left", "main", "right"],
        orderClassNames: ["order-2 lg:order-1", "order-1 lg:order-2", "order-3"],
      },
    ],
  },
  {
    id: "rockettheme",
    name: "RocketTheme-style (complex)",
    description:
      "Gantry-style: utility bar, header, navigation, showcase row, mainbody + sidebars, bottom band, footer columns.",
    rows: [
      /* Utility bar — top strip (search, login, etc.) */
      {
        gridClassName:
          "rockettheme-row rockettheme-utility grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4",
        positions: ["utility-a", "utility-b", "utility-c"],
      },
      /* Header — logo / site title area */
      {
        gridClassName: "rockettheme-row rockettheme-header grid grid-cols-1",
        positions: ["header"],
      },
      /* Navigation — menu bar */
      {
        gridClassName: "rockettheme-row rockettheme-nav grid grid-cols-1",
        positions: ["navigation"],
      },
      /* Showcase / feature — 4 highlight boxes */
      {
        gridClassName:
          "rockettheme-row rockettheme-showcase grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",
        positions: ["showcase-a", "showcase-b", "showcase-c", "showcase-d"],
      },
      /* Mainbody — content + sidebars */
      {
        gridClassName:
          "rockettheme-row rockettheme-mainbody grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] gap-4 sm:gap-6 lg:gap-8",
        positions: ["left", "main", "right"],
        orderClassNames: ["order-2 lg:order-1", "order-1 lg:order-2", "order-3"],
      },
      /* Bottom — pre-footer band */
      {
        gridClassName:
          "rockettheme-row rockettheme-bottom grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4",
        positions: ["bottom-a", "bottom-b"],
      },
      /* Footer — 4-column footer */
      {
        gridClassName:
          "rockettheme-row rockettheme-footer grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
        positions: ["footer-a", "footer-b", "footer-c", "footer-d"],
      },
    ],
  },
];

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getLayoutTemplate(id: string): LayoutTemplate | undefined {
  return BY_ID.get(id);
}

export function getAllLayoutTemplates(): LayoutTemplate[] {
  return [...TEMPLATES];
}

export function getTemplateIds(): string[] {
  return TEMPLATES.map((t) => t.id);
}

/** Matches responsive grid-cols (e.g. sm:grid-cols-3, md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]). */
const RESPONSIVE_GRID_COLS = /\s*(sm:|md:|lg:)grid-cols-(?:\d+|\[[^\]]+\])/g;

/**
 * Grid class for a row when only `visibleCount` positions are shown (empty module positions collapsed).
 * Keeps gap/breakpoints from the row and adjusts column count.
 */
export function getRowGridClassName(row: LayoutRow, visibleCount: number): string {
  if (visibleCount === row.positions.length) return row.gridClassName;
  if (visibleCount <= 1) {
    return row.gridClassName.replace(RESPONSIVE_GRID_COLS, "").trim().replace(/\s+/g, " ");
  }
  return row.gridClassName.replace(
    /(sm:|md:|lg:)grid-cols-(?:\d+|\[[^\]]+\])/g,
    (_: string, prefix: string) => `${prefix}grid-cols-${visibleCount}`
  );
}

/** Human-readable label for a module position (e.g. "utility-a" → "Utility A"). */
export function getPositionPlaceholderLabel(positionId: string): string {
  if (positionId === "header") return "Header";
  if (positionId === "navigation") return "Navigation";
  const parts = positionId.split("-");
  if (parts.length >= 2) {
    const name = parts[0];
    const letter = parts[1].toUpperCase();
    return `${name.charAt(0).toUpperCase() + name.slice(1)} ${letter}`;
  }
  return positionId.charAt(0).toUpperCase() + positionId.slice(1);
}

/**
 * Single source of truth for content width and layout.
 * Use these classes so header, main, and footer stay aligned.
 */
export const CONTENT_WIDTH_CLASS =
  "w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl";

export const CONTENT_PADDING_CLASS =
  "px-[var(--space-4)] sm:px-[var(--space-5)] lg:px-[var(--space-6)]";

/** Combined container: centered + width + horizontal padding */
export const CONTAINER_CLASS = `${CONTENT_WIDTH_CLASS} mx-auto ${CONTENT_PADDING_CLASS}`;

/** Grid layouts for multi-column page content. Gaps follow the 8pt spacing scale. */
export const LAYOUT_GRID = {
  twoCol:
    "grid grid-cols-1 gap-[var(--layout-gap-md)] md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-[var(--layout-gap-lg)]",
  threeCol:
    "grid grid-cols-1 gap-[var(--layout-gap-md)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:gap-[var(--layout-gap-lg)]",
} as const;

/** Order classes so main content appears first on small screens, sidebars below. */
export const LAYOUT_ORDER = {
  main: "order-1 md:order-2 lg:order-2",
  left: "order-2 md:order-1 lg:order-1",
  right: "order-3",
} as const;

/**
 * Single source of truth for content width and layout.
 * Use these classes so header, main, and footer stay aligned.
 */
export const CONTENT_WIDTH_CLASS =
  "w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl";

export const CONTENT_PADDING_CLASS = "px-4 sm:px-6 lg:px-8";

/** Combined container: centered + width + horizontal padding */
export const CONTAINER_CLASS = `${CONTENT_WIDTH_CLASS} mx-auto ${CONTENT_PADDING_CLASS}`;

/** Grid layouts for multi-column page content. Breakpoints: md 768px, lg 1024px. */
export const LAYOUT_GRID = {
  twoCol:
    "grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-8 lg:gap-10 xl:gap-12 2xl:gap-14",
  threeCol:
    "grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:gap-10 xl:gap-12 2xl:gap-14",
} as const;

/** Order classes so main content appears first on small screens, sidebars below. */
export const LAYOUT_ORDER = {
  main: "order-1 md:order-2 lg:order-2",
  left: "order-2 md:order-1 lg:order-1",
  right: "order-3",
} as const;

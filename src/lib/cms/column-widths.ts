import type { ColumnWidths, PageLayout } from "./types";

/** Allowed fr weights for sidebar/main columns (keeps layouts coherent). */
export const COLUMN_FR_MIN = 1;
export const COLUMN_FR_MAX = 4;
/** Snap step when a drag ends (live drag stays continuous). */
export const COLUMN_FR_STEP = 0.5;

export const DEFAULT_TWO_COL: Required<Pick<ColumnWidths, "left" | "main">> = {
  left: 1,
  main: 2,
};

export const DEFAULT_THREE_COL: Required<ColumnWidths> = {
  left: 1,
  main: 2,
  right: 1,
};

/** Keep in 1–4; hundredths so live drag can move every pixel. */
export function clampColumnFr(value: number): number {
  if (!Number.isFinite(value)) return COLUMN_FR_MIN;
  const clamped = Math.min(COLUMN_FR_MAX, Math.max(COLUMN_FR_MIN, value));
  return Math.round(clamped * 100) / 100;
}

/** Snap to half-fr for saved / released widths. */
export function snapColumnFr(value: number, step = COLUMN_FR_STEP): number {
  if (!Number.isFinite(value)) return COLUMN_FR_MIN;
  const snapped = Math.round(value / step) * step;
  return Math.min(COLUMN_FR_MAX, Math.max(COLUMN_FR_MIN, snapped));
}

/** Layouts that support editable column weights. */
export function layoutSupportsColumnWidths(layout: PageLayout | undefined): boolean {
  return layout === "two-col" || layout === "three-col";
}

export function defaultColumnWidths(layout: PageLayout | undefined): ColumnWidths {
  if (layout === "three-col") return { ...DEFAULT_THREE_COL };
  if (layout === "two-col") return { ...DEFAULT_TWO_COL };
  return {};
}

/** Merge stored widths with layout defaults; clamp to 1–4 fr. */
export function resolveColumnWidths(
  layout: PageLayout | undefined,
  stored?: ColumnWidths | null
): ColumnWidths {
  if (!layoutSupportsColumnWidths(layout)) return {};
  const base = defaultColumnWidths(layout);
  return {
    left: clampColumnFr(stored?.left ?? base.left ?? 1),
    main: clampColumnFr(stored?.main ?? base.main ?? 2),
    ...(layout === "three-col"
      ? { right: clampColumnFr(stored?.right ?? base.right ?? 1) }
      : {}),
  };
}

/**
 * CSS grid track list for visible content positions in template order
 * (left → main → right). Uses minmax(0, Nfr) so columns can shrink.
 */
export function columnTrackList(
  layout: PageLayout | undefined,
  widths: ColumnWidths,
  visiblePositions: string[]
): string | undefined {
  if (!layoutSupportsColumnWidths(layout) || visiblePositions.length < 2) return undefined;
  const resolved = resolveColumnWidths(layout, widths);
  const tracks = visiblePositions.map((id) => {
    const fr =
      id === "left"
        ? resolved.left ?? 1
        : id === "right"
          ? resolved.right ?? 1
          : resolved.main ?? 2;
    return `minmax(0, ${fr}fr)`;
  });
  return tracks.join(" ");
}

/**
 * Adjust the boundary between two adjacent columns by `deltaFr` (positive =
 * give more to the left column of the pair). Keeps each side in 1–4 and
 * conserves the pair’s total fr when possible.
 */
export function nudgeColumnPair(
  widths: ColumnWidths,
  leftKey: keyof ColumnWidths,
  rightKey: keyof ColumnWidths,
  deltaFr: number,
  layout: PageLayout,
  options?: { snap?: boolean }
): ColumnWidths {
  const current = resolveColumnWidths(layout, widths);
  const a0 = current[leftKey] ?? 1;
  const b0 = current[rightKey] ?? 1;
  const pair = a0 + b0;
  let a = a0 + deltaFr;
  a = Math.min(COLUMN_FR_MAX, Math.max(COLUMN_FR_MIN, a));
  // Keep pair sum stable; clamp the other side into range and rebalance if needed.
  let b = pair - a;
  if (b < COLUMN_FR_MIN) {
    b = COLUMN_FR_MIN;
    a = Math.min(COLUMN_FR_MAX, Math.max(COLUMN_FR_MIN, pair - b));
  } else if (b > COLUMN_FR_MAX) {
    b = COLUMN_FR_MAX;
    a = Math.min(COLUMN_FR_MAX, Math.max(COLUMN_FR_MIN, pair - b));
  }
  const finish = options?.snap ? snapColumnFr : clampColumnFr;
  return {
    ...current,
    [leftKey]: finish(a),
    [rightKey]: finish(b),
  };
}

export function ensureColumnWidths(value: unknown): ColumnWidths | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  const out: ColumnWidths = {};
  for (const key of ["left", "main", "right"] as const) {
    const n = raw[key];
    if (typeof n === "number" && Number.isFinite(n)) out[key] = clampColumnFr(n);
    else if (typeof n === "string" && n.trim() !== "" && Number.isFinite(Number(n)))
      out[key] = clampColumnFr(Number(n));
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ColumnWidths, PageLayout } from "@/lib/cms/types";
import {
  COLUMN_FR_MAX,
  COLUMN_FR_MIN,
  nudgeColumnPair,
  resolveColumnWidths,
} from "@/lib/cms/column-widths";
import { TEST_ID } from "@/lib/test-ids";

type Boundary = {
  leftKey: keyof ColumnWidths;
  rightKey: keyof ColumnWidths;
  /** Index of the column to the left of this handle (among visible content cols). */
  afterIndex: number;
};

function boundariesFor(visible: string[]): Boundary[] {
  const out: Boundary[] = [];
  for (let i = 0; i < visible.length - 1; i++) {
    const a = visible[i];
    const b = visible[i + 1];
    if (
      (a === "left" || a === "main" || a === "right") &&
      (b === "left" || b === "main" || b === "right")
    ) {
      out.push({
        leftKey: a as keyof ColumnWidths,
        rightKey: b as keyof ColumnWidths,
        afterIndex: i,
      });
    }
  }
  return out;
}

function contentColumnEls(row: HTMLElement): HTMLElement[] {
  return Array.from(row.children).filter(
    (el) => el instanceof HTMLElement && !el.hasAttribute("data-column-resize-layer")
  ) as HTMLElement[];
}

interface ColumnResizeHandlesProps {
  layout: PageLayout;
  widths: ColumnWidths;
  visiblePositions: string[];
  /** Row element that owns the grid columns (direct children are column wrappers). */
  rowRef: React.RefObject<HTMLElement | null>;
  onChange: (widths: ColumnWidths) => void;
}

/**
 * Overlay drag handles between two-col / three-col content columns.
 * Absolutely positioned so they do not affect document flow (WYSIWYG zero-shift).
 */
export function ColumnResizeHandles({
  layout,
  widths,
  visiblePositions,
  rowRef,
  onChange,
}: ColumnResizeHandlesProps) {
  const [offsets, setOffsets] = useState<number[]>([]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const widthsRef = useRef(widths);
  widthsRef.current = widths;

  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const rowBox = row.getBoundingClientRect();
    const kids = contentColumnEls(row);
    if (kids.length < 2) {
      setOffsets([]);
      return;
    }
    const next: number[] = [];
    for (let i = 0; i < kids.length - 1; i++) {
      const leftBox = kids[i].getBoundingClientRect();
      const rightBox = kids[i + 1].getBoundingClientRect();
      const mid = (leftBox.right + rightBox.left) / 2 - rowBox.left;
      next.push(mid);
    }
    setOffsets(next);
  }, [rowRef]);

  useEffect(() => {
    measure();
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(row);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, rowRef, visiblePositions, widths]);

  const bounds = boundariesFor(visiblePositions);
  if (bounds.length === 0 || offsets.length === 0) return null;

  const resolved = resolveColumnWidths(layout, widths);

  return (
    <div className="column-resize-layer" data-column-resize-layer>
      {bounds.map((boundary, i) => {
        const left = offsets[boundary.afterIndex];
        if (left == null) return null;
        const leftFr = resolved[boundary.leftKey] ?? COLUMN_FR_MIN;
        const rightFr = resolved[boundary.rightKey] ?? COLUMN_FR_MIN;
        const label = `Resize columns (${boundary.leftKey} ${leftFr}fr / ${boundary.rightKey} ${rightFr}fr). Drag horizontally. Range ${COLUMN_FR_MIN}–${COLUMN_FR_MAX}.`;
        return (
          <button
            key={`${boundary.leftKey}-${boundary.rightKey}-${i}`}
            type="button"
            className="column-resize-handle"
            style={{ left: `${left}px` }}
            data-testid={TEST_ID.columnResizeHandle}
            aria-label={label}
            title={label}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              e.stopPropagation();
              const row = rowRef.current;
              if (!row) return;
              const kids = contentColumnEls(row);
              const leftEl = kids[boundary.afterIndex];
              const rightEl = kids[boundary.afterIndex + 1];
              if (!leftEl || !rightEl) return;

              const leftBox = leftEl.getBoundingClientRect();
              const rightBox = rightEl.getBoundingClientRect();
              const pairWidth = rightBox.right - leftBox.left;
              if (pairWidth <= 0) return;

              const startResolved = resolveColumnWidths(layoutRef.current, widthsRef.current);
              const a0 = startResolved[boundary.leftKey] ?? COLUMN_FR_MIN;
              const b0 = startResolved[boundary.rightKey] ?? COLUMN_FR_MIN;
              const pairFr = a0 + b0;
              const startX = e.clientX;
              const startWidths = { ...startResolved };
              const target = e.currentTarget;

              try {
                target.setPointerCapture(e.pointerId);
              } catch {
                // ignore — some browsers reject capture mid-gesture
              }
              document.body.classList.add("is-column-resizing");

              const applyDelta = (clientX: number, snap: boolean) => {
                const deltaFr = ((clientX - startX) / pairWidth) * pairFr;
                onChangeRef.current(
                  nudgeColumnPair(
                    startWidths,
                    boundary.leftKey,
                    boundary.rightKey,
                    deltaFr,
                    layoutRef.current,
                    { snap }
                  )
                );
              };

              const onMove = (ev: PointerEvent) => {
                applyDelta(ev.clientX, false);
              };
              const onUp = (ev: PointerEvent) => {
                applyDelta(ev.clientX, true);
                document.body.classList.remove("is-column-resizing");
                try {
                  if (target.hasPointerCapture(ev.pointerId)) {
                    target.releasePointerCapture(ev.pointerId);
                  }
                } catch {
                  // ignore
                }
                target.removeEventListener("pointermove", onMove);
                target.removeEventListener("pointerup", onUp);
                target.removeEventListener("pointercancel", onUp);
              };

              target.addEventListener("pointermove", onMove);
              target.addEventListener("pointerup", onUp);
              target.addEventListener("pointercancel", onUp);
            }}
          />
        );
      })}
    </div>
  );
}

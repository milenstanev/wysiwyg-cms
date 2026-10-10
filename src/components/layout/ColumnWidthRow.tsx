"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import type { ColumnWidths, PageLayout } from "@/lib/cms/types";
import {
  columnTrackList,
  layoutSupportsColumnWidths,
  resolveColumnWidths,
} from "@/lib/cms/column-widths";
import { ColumnResizeHandles } from "./ColumnResizeHandles";

interface ColumnWidthRowProps {
  layout: PageLayout;
  gridClassName: string;
  rowIndex: number;
  visiblePositions: string[];
  visibleCount: number;
  columnWidths?: ColumnWidths;
  editable?: boolean;
  onColumnWidthsChange?: (widths: ColumnWidths) => void;
  children: ReactNode;
}

/**
 * Template row wrapper that applies saved column fr weights (two-col / three-col)
 * and optional edit-only resize handles.
 */
export function ColumnWidthRow({
  layout,
  gridClassName,
  rowIndex,
  visiblePositions,
  visibleCount,
  columnWidths,
  editable = false,
  onColumnWidthsChange,
  children,
}: ColumnWidthRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const supports = layoutSupportsColumnWidths(layout);
  const tracks =
    supports && visibleCount >= 2
      ? columnTrackList(layout, resolveColumnWidths(layout, columnWidths), visiblePositions)
      : undefined;

  const style = tracks
    ? ({ ["--layout-cols" as string]: tracks } as CSSProperties)
    : undefined;

  const showHandles =
    editable && supports && !!onColumnWidthsChange && visibleCount >= 2 && !!tracks;

  return (
    <div
      ref={rowRef}
      className={`${gridClassName}${tracks ? " layout-column-row" : ""}${showHandles ? " layout-column-row-editing" : ""}`}
      data-template-row={rowIndex}
      data-visible-count={visibleCount}
      data-cols-custom={tracks ? "true" : undefined}
      style={style}
    >
      {children}
      {showHandles && (
        <ColumnResizeHandles
          layout={layout}
          widths={resolveColumnWidths(layout, columnWidths)}
          visiblePositions={visiblePositions}
          rowRef={rowRef}
          onChange={onColumnWidthsChange}
        />
      )}
    </div>
  );
}

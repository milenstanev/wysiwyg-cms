"use client";

import { getBlockSettingOrDefault } from "@/lib/cms/block-settings";
import type { ContentBlock } from "@/lib/cms/types";

interface TableBlockProps {
  rows?: string[][];
  content?: string;
  settings?: Record<string, unknown>;
  editable?: boolean;
  onEdit?: (rows: string[][]) => void;
}

function useTableSettings(settings?: Record<string, unknown>) {
  const block = { settings } as ContentBlock;
  return {
    headerRow: getBlockSettingOrDefault(block, "headerRow", true),
    striped: getBlockSettingOrDefault(block, "striped", false),
    bordered: getBlockSettingOrDefault(block, "bordered", true),
    caption: getBlockSettingOrDefault(block, "caption", "") as string,
  };
}

function parseTableContent(content: string): string[][] {
  if (!content.trim()) return [];
  return content
    .split("\n")
    .map((row) => row.split("\t").map((cell) => cell.trim()))
    .filter((row) => row.some((c) => c));
}

export function getTableRows(rows: string[][] = [], content?: string): string[][] {
  return rows.length > 0 ? rows : parseTableContent(content || "");
}

/** Rows with one empty row appended (column count follows the first row). */
export function withEmptyRow(data: string[][]): string[][] {
  const cols = Math.max(1, data[0]?.length ?? 1);
  return [...data, Array.from({ length: cols }, () => "")];
}

/** Same markup in view and edit; cells become contentEditable in edit. */
export function TableBlock({ rows = [], content, settings, editable, onEdit }: TableBlockProps) {
  const { headerRow, striped, bordered, caption } = useTableSettings(settings);
  const data = getTableRows(rows, content);
  const tableHeader = headerRow ? (data[0] ?? []) : [];
  const tableBody = headerRow ? data.slice(1) : data;
  const bodyOffset = headerRow ? 1 : 0;

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const next = data.map((r) => [...r]);
    while (next[rowIdx].length <= colIdx) next[rowIdx].push("");
    next[rowIdx][colIdx] = value;
    onEdit?.(next);
  };

  const editProps = (rowIdx: number, colIdx: number) =>
    editable
      ? {
          contentEditable: true,
          suppressContentEditableWarning: true,
          onInput: (e: React.FormEvent<HTMLElement>) =>
            handleCellChange(rowIdx, colIdx, (e.currentTarget as HTMLElement).textContent || ""),
        }
      : {};

  const wrapperClass = `overflow-x-auto rounded-lg ${bordered ? "border border-[var(--border)]" : ""}`;
  const cellBorder = bordered ? "border border-[var(--border)]" : "";
  const rowStriped = striped ? "even:bg-[color-mix(in_srgb,var(--muted)_8%,transparent)]" : "";

  if (data.length === 0) return null;

  return (
    <div className={wrapperClass}>
      <table className="w-full text-sm">
        {caption && (
          <caption className="text-left text-sm text-[var(--muted)] px-[var(--space-2)] py-[var(--space-1)]">{caption}</caption>
        )}
        {tableHeader.length > 0 && (
          <thead>
            <tr className="bg-[color-mix(in_srgb,var(--muted)_12%,var(--surface))]">
              {tableHeader.map((cell, i) => (
                <th
                  key={i}
                  {...editProps(0, i)}
                  className={`px-[var(--space-4)] py-[var(--space-3)] text-left font-medium text-[var(--foreground)] outline-none ${bordered ? "border-b border-r border-[var(--border)] last:border-r-0" : "border-b border-[var(--border)]"}`}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {tableBody.map((row, ri) => (
            <tr
              key={ri}
              className={`${rowStriped} ${bordered ? "border-b border-[var(--border)] last:border-0" : ""}`}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  {...editProps(ri + bodyOffset, ci)}
                  className={`px-[var(--space-4)] py-[var(--space-3)] text-[var(--muted)] outline-none ${cellBorder}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

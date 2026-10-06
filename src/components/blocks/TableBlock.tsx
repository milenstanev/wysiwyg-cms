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

export function TableBlock({ rows = [], content, settings, editable, onEdit }: TableBlockProps) {
  const { headerRow, striped, bordered, caption } = useTableSettings(settings);
  const data = rows.length > 0 ? rows : parseTableContent(content || "");
  const header = data[0] ?? [];
  const bodyRows = headerRow ? data.slice(1) : data;
  const tableHeader = headerRow ? header : [];
  const tableBody = headerRow ? bodyRows : data;

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const next = data.map((r) => [...r]);
    while (next[rowIdx].length <= colIdx) next[rowIdx].push("");
    next[rowIdx][colIdx] = value;
    onEdit?.(next);
  };

  const wrapperClass = `overflow-x-auto rounded-lg ${bordered ? "border border-[var(--border)]" : ""}`;
  const cellBorder = bordered ? "border border-[var(--border)]" : "";
  const rowStriped = striped ? "even:bg-[color-mix(in_srgb,var(--muted)_8%,transparent)]" : "";
  const colCount = header.length || 1;

  if (editable) {
    return (
      <div className={wrapperClass}>
        <table className="w-full text-sm">
          {caption && (
            <caption className="text-left text-sm text-[var(--muted)] px-2 py-1">{caption}</caption>
          )}
          {headerRow && (
            <thead>
              <tr className="bg-[color-mix(in_srgb,var(--muted)_12%,var(--surface))]">
                {header.map((cell, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-left font-medium text-[var(--foreground)] ${bordered ? "border-b border-r border-[var(--border)] last:border-r-0" : "border-b border-[var(--border)]"}`}
                  >
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) =>
                        handleCellChange(0, i, (e.currentTarget as HTMLElement).textContent || "")
                      }
                      className="outline-none empty:before:content-['Header'] empty:before:opacity-50"
                    >
                      {cell}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {bodyRows.map((row, ri) => (
              <tr
                key={ri}
                className={`${rowStriped} ${bordered ? "border-b border-[var(--border)] last:border-0" : ""}`}
              >
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-4 py-3 text-[var(--muted)] ${cellBorder}`}>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) =>
                        handleCellChange(
                          ri + (headerRow ? 1 : 0),
                          ci,
                          (e.currentTarget as HTMLElement).textContent || ""
                        )
                      }
                      className="outline-none empty:before:content-['Cell'] empty:before:opacity-50"
                    >
                      {cell}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td colSpan={colCount} className="px-4 py-2">
                <button
                  type="button"
                  onClick={() =>
                    onEdit?.([
                      ...data,
                      header.length ? header.map(() => "") : (data[0] ?? []).map(() => ""),
                    ])
                  }
                  className="text-sm text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  + Add row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) return null;

  return (
    <div className={wrapperClass}>
      <table className="w-full text-sm">
        {caption && (
          <caption className="text-left text-sm text-[var(--muted)] px-2 py-1">{caption}</caption>
        )}
        {headerRow && tableHeader.length > 0 && (
          <thead>
            <tr className="bg-[color-mix(in_srgb,var(--muted)_12%,var(--surface))]">
              {tableHeader.map((cell, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left font-medium text-[var(--foreground)] ${bordered ? "border-b border-r border-[var(--border)] last:border-r-0" : "border-b border-[var(--border)]"}`}
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
                <td key={ci} className={`px-4 py-3 text-[var(--muted)] ${cellBorder}`}>
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

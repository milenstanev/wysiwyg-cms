"use client";

interface TableBlockProps {
  rows?: string[][];
  content?: string;
  editable?: boolean;
  onEdit?: (rows: string[][]) => void;
}

function parseTableContent(content: string): string[][] {
  if (!content.trim()) return [];
  return content
    .split("\n")
    .map((row) => row.split("\t").map((cell) => cell.trim()))
    .filter((row) => row.some((c) => c));
}

export function TableBlock({ rows = [], content, editable, onEdit }: TableBlockProps) {
  const data = rows.length > 0 ? rows : parseTableContent(content || "");
  const header = data[0] ?? [];
  const bodyRows = data.slice(1);

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const next = data.map((r) => [...r]);
    while (next[rowIdx].length <= colIdx) next[rowIdx].push("");
    next[rowIdx][colIdx] = value;
    onEdit?.(next);
  };

  if (editable) {
    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-100">
              {header.map((cell, i) => (
                <th key={i} className="px-4 py-3 text-left font-medium text-zinc-700 border-b border-zinc-200">
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
          <tbody>
            {bodyRows.map((row, ri) => (
              <tr key={ri} className="border-b border-zinc-100 last:border-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-3 text-zinc-600">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) =>
                        handleCellChange(ri + 1, ci, (e.currentTarget as HTMLElement).textContent || "")
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
              <td colSpan={header.length || 1} className="px-4 py-2">
                <button
                  type="button"
                  onClick={() =>
                    onEdit?.([...data, header.map(() => "")])
                  }
                  className="text-sm text-zinc-400 hover:text-zinc-600"
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
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-100">
            {header.map((cell, i) => (
              <th key={i} className="px-4 py-3 text-left font-medium text-zinc-700 border-b border-zinc-200">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri} className="border-b border-zinc-100 last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-zinc-600">
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

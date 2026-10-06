"use client";

import { getBlockSettingOrDefault } from "@/lib/cms/block-settings";
import type { ContentBlock } from "@/lib/cms/types";

interface ListBlockProps {
  items?: string[];
  content?: string;
  settings?: Record<string, unknown>;
  editable?: boolean;
  onEdit?: (items: string[]) => void;
}

export function ListBlock({ items = [], content, settings, editable, onEdit }: ListBlockProps) {
  const listItems = items.length > 0 ? items : content ? content.split("\n").filter(Boolean) : [];
  const listStyle = getBlockSettingOrDefault(
    { settings } as ContentBlock,
    "listStyle",
    "bullet"
  ) as string;
  const ordered = listStyle === "numbered";
  const ListTag = ordered ? "ol" : "ul";

  const handleItemChange = (index: number, value: string) => {
    const next = [...listItems];
    next[index] = value;
    onEdit?.(next);
  };

  const handleAddItem = () => {
    onEdit?.([...listItems, "New item"]);
  };

  const handleRemoveItem = (index: number) => {
    onEdit?.(listItems.filter((_, i) => i !== index));
  };

  if (editable) {
    return (
      <ListTag className={`space-y-2 ${ordered ? "list-decimal list-inside" : ""}`}>
        {listItems.map((item, i) => (
          <li key={i} className="flex items-center gap-2 group">
            {!ordered && <span className="text-[var(--accent)] mt-0.5">•</span>}
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) =>
                handleItemChange(i, (e.currentTarget as HTMLElement).textContent || "")
              }
              className="flex-1 text-[var(--foreground)] outline-none empty:before:content-['List item'] empty:before:opacity-50"
            >
              {item}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveItem(i)}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 text-sm"
            >
              ✕
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-sm text-[var(--muted)] hover:text-[var(--accent)] flex items-center gap-2"
          >
            + Add item
          </button>
        </li>
      </ListTag>
    );
  }

  return (
    <ListTag className={`space-y-2 ${ordered ? "list-decimal list-inside" : ""}`}>
      {listItems.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          {!ordered && <span className="text-[var(--accent)] mt-1">•</span>}
          <span className="text-[var(--foreground)]">{item}</span>
        </li>
      ))}
    </ListTag>
  );
}

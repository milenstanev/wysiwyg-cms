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

export function getListItems(items: string[] = [], content?: string): string[] {
  return items.length > 0 ? items : content ? content.split("\n").filter(Boolean) : [];
}

/** Same markup in view and edit; edit-only controls are absolutely positioned (no layout shift). */
export function ListBlock({ items = [], content, settings, editable, onEdit }: ListBlockProps) {
  const listItems = getListItems(items, content);
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

  const handleRemoveItem = (index: number) => {
    onEdit?.(listItems.filter((_, i) => i !== index));
  };

  return (
    <ListTag className={`space-y-[var(--space-2)] ${ordered ? "list-decimal list-inside" : ""}`}>
      {listItems.map((item, i) => (
        <li key={i} className="group relative flex items-start gap-[var(--space-2)]">
          {!ordered && (
            <span aria-hidden className="text-[var(--accent)] mt-[var(--space-1)]">
              •
            </span>
          )}
          <span
            contentEditable={editable}
            suppressContentEditableWarning
            onInput={
              editable
                ? (e) => handleItemChange(i, (e.currentTarget as HTMLElement).textContent || "")
                : undefined
            }
            className="text-[var(--foreground)] outline-none"
          >
            {item}
          </span>
          {editable && (
            <button
              type="button"
              onClick={() => handleRemoveItem(i)}
              className="edit-chip edit-inline-remove"
              aria-label={`Remove item ${i + 1}`}
              title="Remove item"
            >
              ✕
            </button>
          )}
        </li>
      ))}
    </ListTag>
  );
}

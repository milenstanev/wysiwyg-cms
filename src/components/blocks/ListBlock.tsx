"use client";

interface ListBlockProps {
  items?: string[];
  content?: string;
  editable?: boolean;
  onEdit?: (items: string[]) => void;
}

export function ListBlock({
  items = [],
  content,
  editable,
  onEdit,
}: ListBlockProps) {
  const listItems = items.length > 0 ? items : (content ? content.split("\n").filter(Boolean) : []);

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
      <ul className="space-y-2">
        {listItems.map((item, i) => (
          <li key={i} className="flex items-center gap-2 group">
            <span className="text-amber-500 mt-0.5">•</span>
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) =>
                handleItemChange(i, (e.currentTarget as HTMLElement).textContent || "")
              }
              className="flex-1 text-zinc-700 outline-none empty:before:content-['List item'] empty:before:opacity-50"
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
            className="text-sm text-zinc-400 hover:text-zinc-600 flex items-center gap-2"
          >
            + Add item
          </button>
        </li>
      </ul>
    );
  }

  return (
    <ul className="space-y-2">
      {listItems.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-amber-500 mt-1">•</span>
          <span className="text-zinc-700">{item}</span>
        </li>
      ))}
    </ul>
  );
}

"use client";

interface ShowcaseBlockProps {
  title?: string;
  content: string;
  editable?: boolean;
  onEdit?: (field: "title" | "content", value: string) => void;
}

export function ShowcaseBlock({ title = "", content, editable, onEdit }: ShowcaseBlockProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      {editable ? (
        <>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onEdit?.("title", (e.currentTarget as HTMLElement).textContent || "")}
            className="text-xl font-semibold text-zinc-900 mb-3 outline-none empty:before:content-['Title'] empty:before:opacity-50"
          >
            {title}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onEdit?.("content", (e.currentTarget as HTMLElement).textContent || "")}
            className="text-zinc-600 leading-relaxed outline-none empty:before:content-['Content...'] empty:before:opacity-50"
          >
            {content}
          </div>
        </>
      ) : (
        <>
          {title && <h3 className="text-xl font-semibold text-zinc-900 mb-3">{title}</h3>}
          {content && <p className="text-zinc-600 leading-relaxed">{content}</p>}
        </>
      )}
    </div>
  );
}

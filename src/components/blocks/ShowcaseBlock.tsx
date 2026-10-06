"use client";

interface ShowcaseBlockProps {
  title?: string;
  content: string;
  editable?: boolean;
  onEdit?: (field: "title" | "content", value: string) => void;
}

export function ShowcaseBlock({ title = "", content, editable, onEdit }: ShowcaseBlockProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm hover:shadow-md transition-shadow">
      {editable ? (
        <>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onEdit?.("title", (e.currentTarget as HTMLElement).textContent || "")}
            className="text-xl font-semibold text-[var(--foreground)] mb-3 outline-none empty:before:content-['Title'] empty:before:opacity-50"
          >
            {title}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onEdit?.("content", (e.currentTarget as HTMLElement).textContent || "")}
            className="text-[var(--muted)] leading-relaxed outline-none empty:before:content-['Content...'] empty:before:opacity-50"
          >
            {content}
          </div>
        </>
      ) : (
        <>
          {title && (
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">{title}</h3>
          )}
          {content && <p className="text-[var(--muted)] leading-relaxed">{content}</p>}
        </>
      )}
    </div>
  );
}

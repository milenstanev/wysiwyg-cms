"use client";

interface ShowcaseBlockProps {
  title?: string;
  content: string;
  editable?: boolean;
  onEdit?: (field: "title" | "content", value: string) => void;
}

/** Same tags in view and edit (h3 + p) so fonts and spacing match pixel for pixel. */
export function ShowcaseBlock({ title = "", content, editable, onEdit }: ShowcaseBlockProps) {
  const field = (name: "title" | "content") =>
    editable
      ? {
          contentEditable: true,
          suppressContentEditableWarning: true,
          onInput: (e: React.FormEvent<HTMLElement>) =>
            onEdit?.(name, (e.currentTarget as HTMLElement).textContent || ""),
        }
      : {};

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-[var(--space-5)] shadow-sm hover:shadow-md transition-shadow">
      {(title || editable) && (
        <h3
          {...field("title")}
          className="text-xl font-semibold text-[var(--foreground)] mb-[var(--space-3)] outline-none empty:before:content-['Title'] empty:before:opacity-50"
        >
          {title}
        </h3>
      )}
      {(content || editable) && (
        <p
          {...field("content")}
          className="text-[var(--muted)] leading-relaxed outline-none empty:before:content-['Content…'] empty:before:opacity-50"
        >
          {content}
        </p>
      )}
    </div>
  );
}

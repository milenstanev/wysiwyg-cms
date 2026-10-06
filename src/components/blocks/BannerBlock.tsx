"use client";

interface BannerBlockProps {
  title?: string;
  content: string;
  editable?: boolean;
  onEdit?: (field: "title" | "content", value: string) => void;
}

/** Same tags in view and edit (h2 + p) so fonts and spacing match pixel for pixel. */
export function BannerBlock({ title = "", content, editable, onEdit }: BannerBlockProps) {
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
    <div className="rounded-xl overflow-hidden bg-[linear-gradient(135deg,var(--foreground),color-mix(in_srgb,var(--foreground)_72%,var(--accent)))] text-[var(--surface)] p-[var(--space-6)] sm:p-[var(--space-7)] text-center">
      {(title || editable) && (
        <h2
          {...field("title")}
          className="text-2xl sm:text-3xl font-bold outline-none empty:before:content-['Banner_title'] empty:before:opacity-60"
        >
          {title}
        </h2>
      )}
      {(content || editable) && (
        <p
          {...field("content")}
          className="mx-auto mt-[var(--space-2)] opacity-75 text-lg outline-none empty:before:content-['Banner_subtitle'] empty:before:opacity-60"
        >
          {content}
        </p>
      )}
    </div>
  );
}

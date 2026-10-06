"use client";

interface BannerBlockProps {
  title?: string;
  content: string;
  editable?: boolean;
  onEdit?: (field: "title" | "content", value: string) => void;
}

export function BannerBlock({ title = "", content, editable, onEdit }: BannerBlockProps) {
  return (
    <div className="rounded-xl overflow-hidden bg-[linear-gradient(135deg,var(--foreground),color-mix(in_srgb,var(--foreground)_72%,var(--accent)))] text-[var(--surface)] p-8 sm:p-10 text-center">
      {editable ? (
        <>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onEdit?.("title", (e.currentTarget as HTMLElement).textContent || "")}
            className="text-2xl sm:text-3xl font-bold outline-none empty:before:content-['Banner title'] empty:before:opacity-60"
          >
            {title}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onEdit?.("content", (e.currentTarget as HTMLElement).textContent || "")}
            className="mt-2 opacity-75 text-lg outline-none empty:before:content-['Banner subtitle or description'] empty:before:opacity-60"
          >
            {content}
          </div>
        </>
      ) : (
        <>
          {title && <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>}
          {content && <p className="mt-2 opacity-75 text-lg">{content}</p>}
        </>
      )}
    </div>
  );
}

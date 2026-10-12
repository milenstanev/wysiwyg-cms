"use client";

import { RichEditable } from "@/components/editor/RichEditable";

interface ShowcaseBlockProps {
  title?: string;
  content: string;
  editable?: boolean;
  onEdit?: (field: "title" | "content", value: string) => void;
}

/** Same tags in view and edit (h3 + p) so fonts and spacing match pixel for pixel. */
export function ShowcaseBlock({ title = "", content, editable, onEdit }: ShowcaseBlockProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-[var(--space-5)] shadow-sm hover:shadow-md transition-shadow">
      {(title || editable) && (
        <RichEditable
          as="h3"
          html={title}
          editable={editable}
          onHtmlChange={(html) => onEdit?.("title", html)}
          className="text-xl font-semibold text-[var(--foreground)] mb-[var(--space-3)] outline-none empty:before:content-['Title'] empty:before:opacity-50"
        />
      )}
      {(content || editable) && (
        <RichEditable
          as="p"
          html={content}
          editable={editable}
          onHtmlChange={(html) => onEdit?.("content", html)}
          className="text-[var(--muted)] leading-relaxed outline-none empty:before:content-['Content…'] empty:before:opacity-50"
        />
      )}
    </div>
  );
}

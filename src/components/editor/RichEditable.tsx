"use client";

import { useLayoutEffect, useRef, type ElementType, type HTMLAttributes } from "react";
import { sanitizeRichHtml } from "@/lib/cms/sanitize-html";

type RichEditableProps = {
  as?: ElementType;
  html: string;
  editable?: boolean;
  onHtmlChange?: (html: string) => void;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "onChange" | "contentEditable" | "dangerouslySetInnerHTML">;

/**
 * Limited rich HTML field (bold/italic/underline/links).
 * View: sanitized HTML. Edit: contentEditable synced via innerHTML when not focused.
 */
export function RichEditable({
  as: Tag = "p",
  html,
  editable = false,
  onHtmlChange,
  className,
  ...rest
}: RichEditableProps) {
  const ref = useRef<HTMLElement | null>(null);
  const safe = sanitizeRichHtml(html);

  useLayoutEffect(() => {
    if (!editable) return;
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== safe) el.innerHTML = safe;
  }, [editable, safe]);

  if (!editable) {
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: safe }} {...rest} />;
  }

  return (
    <Tag
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      data-rich-edit="true"
      onInput={() => {
        const el = ref.current;
        if (!el) return;
        onHtmlChange?.(sanitizeRichHtml(el.innerHTML));
      }}
      {...rest}
    />
  );
}

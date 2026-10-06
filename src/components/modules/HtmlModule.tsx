"use client";

export interface HtmlModuleProps {
  params?: Record<string, unknown>;
  editable?: boolean;
  onParamsChange?: (params: Record<string, unknown>) => void;
}

export function HtmlModule({ params, editable, onParamsChange }: HtmlModuleProps) {
  const html = typeof params?.html === "string" ? params.html : "";

  if (editable && onParamsChange) {
    return (
      <div className="space-y-[var(--space-2)]" data-module="html">
        <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Custom HTML</p>
        <textarea
          value={html}
          onChange={(e) => onParamsChange({ ...params, html: e.target.value })}
          rows={4}
          className="w-full text-sm font-mono border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--surface)]"
          aria-label="Module HTML"
        />
      </div>
    );
  }

  return (
    <div
      data-module="html"
      className="module-html prose prose-sm max-w-none text-[var(--foreground)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

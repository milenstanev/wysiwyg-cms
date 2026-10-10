import type { PageLayout } from "@/lib/cms/types";
import { LAYOUT_OPTIONS } from "@/lib/cms/types";
import { getLayoutTemplate } from "@/lib/cms/layout-templates";

function getLayoutLabel(id: PageLayout): string {
  return getLayoutTemplate(id)?.name ?? id;
}

interface LayoutSelectorProps {
  value: PageLayout;
  onChange: (layout: PageLayout) => void;
  /** When true, no bottom padding/border (for floating portal dropdown) */
  variant?: "inline" | "dropdown";
}

export function LayoutSelector({ value, onChange, variant = "inline" }: LayoutSelectorProps) {
  const isDropdown = variant === "dropdown";
  return (
    <div
      className={`flex flex-wrap items-center gap-[var(--space-2)] ${isDropdown ? "" : "pb-[var(--space-4)] border-b border-[var(--border)]"}`}
    >
      <span className="text-sm text-[var(--muted)]">Layout:</span>
      {LAYOUT_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-[var(--space-3)] py-[var(--space-2)] rounded-lg text-sm font-medium transition-colors ${
            value === opt
              ? "bg-[var(--accent)] text-[var(--on-accent)]"
              : "bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] border border-[var(--border)]"
          }`}
        >
          {getLayoutLabel(opt)}
        </button>
      ))}
    </div>
  );
}

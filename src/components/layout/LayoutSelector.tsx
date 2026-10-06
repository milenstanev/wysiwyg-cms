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
      className={`flex flex-wrap items-center gap-2 ${isDropdown ? "" : "pb-4 border-b border-zinc-200"}`}
    >
      <span className="text-sm text-zinc-500">Layout:</span>
      {LAYOUT_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === opt ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {getLayoutLabel(opt)}
        </button>
      ))}
    </div>
  );
}

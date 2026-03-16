"use client";

import { useState, useRef, useEffect } from "react";

const BLOCK_OPTIONS = [
  { type: "heading" as const, label: "Heading", icon: "H" },
  { type: "text" as const, label: "Paragraph", icon: "¶" },
  { type: "image" as const, label: "Image", icon: "🖼" },
  { type: "banner" as const, label: "Banner", icon: "▬" },
  { type: "showcase" as const, label: "Showcase", icon: "◆" },
  { type: "list" as const, label: "List", icon: "•" },
  { type: "table" as const, label: "Table", icon: "⊞" },
] as const;

interface AddBlockButtonProps {
  onSelect: (type: "heading" | "text" | "image" | "banner" | "list" | "table" | "showcase") => void;
  label?: string;
  variant?: "inline" | "compact";
}

export function AddBlockButton({ onSelect, label = "Add block", variant = "inline" }: AddBlockButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (type: (typeof BLOCK_OPTIONS)[number]["type"]) => {
    onSelect(type);
    setOpen(false);
  };

  if (variant === "compact") {
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-center w-8 h-8 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          title={label}
          aria-label={label}
        >
          <span className="text-lg leading-none">+</span>
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1 z-20 py-1 bg-white rounded-lg shadow-lg border border-zinc-200 min-w-[140px]">
            {BLOCK_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleSelect(opt.type)}
                className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
              >
                <span className="w-5 h-5 flex items-center justify-center rounded bg-zinc-100 text-xs font-medium text-zinc-600">
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors text-sm"
      >
        <span className="text-zinc-400">+</span>
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 py-1 bg-white rounded-lg shadow-lg border border-zinc-200 min-w-[160px]">
          {BLOCK_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => handleSelect(opt.type)}
              className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-3"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-100 text-zinc-600 font-medium">
                {opt.icon}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

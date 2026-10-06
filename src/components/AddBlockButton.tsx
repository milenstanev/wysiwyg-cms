"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePortalPosition } from "@/hooks/usePortalPosition";

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

export function AddBlockButton({
  onSelect,
  label = "Add block",
  variant = "inline",
}: AddBlockButtonProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalPosition = usePortalPosition(anchorRef, open, {
    width: variant === "compact" ? 140 : 200,
    gap: 4,
  });

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (type: (typeof BLOCK_OPTIONS)[number]["type"]) => {
    onSelect(type);
    setOpen(false);
  };

  const dropdownContent = open && portalPosition && (
    <div
      ref={dropdownRef}
      className={`fixed z-[9999] py-1 bg-white rounded-lg shadow-lg border border-zinc-200 ${variant === "compact" ? "min-w-[140px]" : "min-w-[160px]"}`}
      style={{ top: portalPosition.top, left: portalPosition.left }}
    >
      {BLOCK_OPTIONS.map((opt) => (
        <button
          key={opt.type}
          type="button"
          onClick={() => handleSelect(opt.type)}
          className={`w-full text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 ${
            variant === "compact" ? "px-3 py-2" : "px-4 py-2.5 gap-3"
          }`}
        >
          <span
            className={`flex items-center justify-center rounded bg-zinc-100 text-zinc-600 font-medium ${
              variant === "compact" ? "w-5 h-5 text-xs" : "w-8 h-8 rounded-md"
            }`}
          >
            {opt.icon}
          </span>
          {opt.label}
        </button>
      ))}
    </div>
  );

  if (variant === "compact") {
    return (
      <>
        <div ref={anchorRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center justify-center w-8 h-8 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            title={label}
            aria-label={label}
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </>
    );
  }

  return (
    <>
      <div ref={anchorRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors text-sm"
        >
          <span className="text-zinc-400">+</span>
          {label}
        </button>
      </div>
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
}

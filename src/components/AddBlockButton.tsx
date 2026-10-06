"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { portalRoot } from "@/lib/portal-root";
import { usePortalPosition } from "@/hooks/usePortalPosition";
import { useDropdownA11y } from "@/hooks/useDropdownA11y";

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
  /** inline: dashed button · compact: round "+" icon · menu: labelled row inside an edit popover */
  variant?: "inline" | "compact" | "menu";
  /** Lets a hover popover stay open while the block-type list is open. */
  onOpenChange?: (open: boolean) => void;
}

export function AddBlockButton({
  onSelect,
  label = "Add block",
  variant = "inline",
  onOpenChange,
}: AddBlockButtonProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalPosition = usePortalPosition(anchorRef, open, {
    width: variant === "inline" ? 200 : 160,
    gap: 4,
  });

  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });
  useEffect(() => {
    onOpenChangeRef.current?.(open);
  }, [open]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  useDropdownA11y({ open, setOpen, triggerRef, panelRef: dropdownRef });

  const handleSelect = (type: (typeof BLOCK_OPTIONS)[number]["type"]) => {
    onSelect(type);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const roomy = variant === "inline";
  const dropdownContent = open && portalPosition && (
    <div
      ref={dropdownRef}
      role="group"
      aria-label={`${label}: choose a block type`}
      className={`fixed z-[9999] py-1 bg-white rounded-lg shadow-lg border border-zinc-200 ${roomy ? "min-w-[160px]" : "min-w-[140px]"}`}
      style={portalPosition}
    >
      {BLOCK_OPTIONS.map((opt) => (
        <button
          key={opt.type}
          type="button"
          onClick={() => handleSelect(opt.type)}
          className={`w-full text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 ${
            roomy ? "px-4 py-2.5 gap-3" : "px-3 py-2"
          }`}
        >
          <span
            className={`flex items-center justify-center rounded bg-zinc-100 text-zinc-600 font-medium ${
              roomy ? "w-8 h-8 rounded-md" : "w-5 h-5 text-xs"
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
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="edit-chip"
            title={label}
            aria-label={label}
            aria-expanded={open}
          >
            <span aria-hidden>+</span>
          </button>
        </div>
        {dropdownContent && createPortal(dropdownContent, portalRoot())}
      </>
    );
  }

  if (variant === "menu") {
    return (
      <>
        <div ref={anchorRef}>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="edit-menu-item"
            aria-expanded={open}
          >
            <span aria-hidden className="edit-menu-icon">
              +
            </span>
            {label}
          </button>
        </div>
        {dropdownContent && createPortal(dropdownContent, portalRoot())}
      </>
    );
  }

  return (
    <>
      <div ref={anchorRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors text-sm"
          aria-expanded={open}
        >
          <span aria-hidden className="text-zinc-400">+</span>
          {label}
        </button>
      </div>
      {dropdownContent && createPortal(dropdownContent, portalRoot())}
    </>
  );
}

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
  /** gap: 4px matches `--space-1` */
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
      className={`fixed z-[9999] py-[var(--space-1)] bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--border)] ${roomy ? "min-w-[160px]" : "min-w-[140px]"}`}
      style={portalPosition}
    >
      {BLOCK_OPTIONS.map((opt) => (
        <button
          key={opt.type}
          type="button"
          onClick={() => handleSelect(opt.type)}
          className={`w-full text-left text-sm text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--muted)_12%,var(--surface))] flex items-center ${
            roomy
              ? "gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-2)]"
              : "gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-2)]"
          }`}
        >
          <span
            className={`flex items-center justify-center rounded bg-[color-mix(in_srgb,var(--muted)_14%,var(--surface))] text-[var(--muted)] font-medium ${
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
          className="flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-2)] rounded-lg border border-dashed border-[var(--control-border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--muted)_10%,var(--surface))] transition-colors text-sm"
          aria-expanded={open}
        >
          <span aria-hidden className="text-[var(--muted)]">
            +
          </span>
          {label}
        </button>
      </div>
      {dropdownContent && createPortal(dropdownContent, portalRoot())}
    </>
  );
}

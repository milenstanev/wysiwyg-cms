"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { PageLayout } from "@/lib/cms/types";
import { LayoutSelector } from "./LayoutSelector";
import { usePortalPosition } from "@/hooks/usePortalPosition";

interface LayoutDropdownProps {
  value: PageLayout;
  onChange: (layout: PageLayout) => void;
}

export function LayoutDropdown({ value, onChange }: LayoutDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const portalPosition = usePortalPosition(triggerRef, open, { width: 320, gap: 4 });

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleChange = (layout: PageLayout) => {
    onChange(layout);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg text-[var(--muted)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
        aria-label="Choose layout"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Layout
        <span aria-hidden className="text-zinc-400">
          ▼
        </span>
      </button>
      {open &&
        portalPosition &&
        createPortal(
          <div
            ref={panelRef}
            data-testid="layout-dropdown"
            className="fixed z-[9999] min-w-[280px] rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg p-3"
            style={{ top: portalPosition.top, left: portalPosition.left }}
          >
            <LayoutSelector value={value} onChange={handleChange} variant="dropdown" />
          </div>,
          document.body
        )}
    </>
  );
}

"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { portalRoot } from "@/lib/portal-root";
import type { PageLayout } from "@/lib/cms/types";
import { LayoutSelector } from "./LayoutSelector";
import { usePortalPosition } from "@/hooks/usePortalPosition";
import { useDropdownA11y } from "@/hooks/useDropdownA11y";
import { TEST_ID } from "@/lib/test-ids";

interface LayoutDropdownProps {
  value: PageLayout;
  onChange: (layout: PageLayout) => void;
}

export function LayoutDropdown({ value, onChange }: LayoutDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** gap: 4px matches `--space-1` */
  const portalPosition = usePortalPosition(triggerRef, open, { width: 320, gap: 4 });

  useDropdownA11y({ open, setOpen, triggerRef, panelRef });

  const handleChange = (layout: PageLayout) => {
    onChange(layout);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-[var(--space-1)] px-[var(--space-3)] py-[var(--space-2)] text-sm rounded-lg text-[var(--muted)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
        aria-label="Choose layout"
        aria-expanded={open}
      >
        Layout
        <span aria-hidden className="text-[var(--muted)]">
          ▼
        </span>
      </button>
      {open &&
        portalPosition &&
        createPortal(
          <div
            ref={panelRef}
            data-testid={TEST_ID.layoutDropdown}
            role="group"
            aria-label="Page layouts"
            className="fixed z-[9999] min-w-[280px] rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg p-[var(--space-3)]"
            style={portalPosition}
          >
            <LayoutSelector value={value} onChange={handleChange} variant="dropdown" />
          </div>,
          portalRoot()
        )}
    </>
  );
}

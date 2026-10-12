"use client";

import { useState, useRef } from "react";
import type { PageLayout } from "@/lib/cms/types";
import { LayoutSelector } from "./LayoutSelector";
import { useDropdownA11y } from "@/hooks/useDropdownA11y";
import { TEST_ID } from "@/lib/test-ids";
import { EditPortalPanel, EDIT_PORTAL_GAP } from "@/components/edit-chrome";

interface LayoutDropdownProps {
  value: PageLayout;
  onChange: (layout: PageLayout) => void;
}

export function LayoutDropdown({ value, onChange }: LayoutDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
        className="editor-bar-button"
        aria-label="Choose layout"
        aria-expanded={open}
      >
        Layout
        <span aria-hidden className="text-[var(--muted)]">
          ▼
        </span>
      </button>
      <EditPortalPanel
        open={open}
        anchorRef={triggerRef}
        panelRef={panelRef}
        width={320}
        gap={EDIT_PORTAL_GAP}
        padded
        className="min-w-[280px]"
        data-testid={TEST_ID.layoutDropdown}
        aria-label="Page layouts"
      >
        <LayoutSelector value={value} onChange={handleChange} variant="dropdown" />
      </EditPortalPanel>
    </>
  );
}

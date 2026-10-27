"use client";

import { useState, useRef, useEffect } from "react";
import { useDropdownA11y } from "@/hooks/useDropdownA11y";
import {
  EditAddTrigger,
  EditMenuItem,
  EditPortalPanel,
  EDIT_PORTAL_GAP,
} from "@/components/edit-chrome";

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
  const roomy = variant === "inline";

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

  const dropdownContent = (
    <EditPortalPanel
      open={open}
      anchorRef={anchorRef}
      panelRef={dropdownRef}
      width={roomy ? 200 : 160}
      gap={EDIT_PORTAL_GAP}
      aria-label={`${label}: choose a block type`}
    >
      {BLOCK_OPTIONS.map((opt) => (
        <EditMenuItem key={opt.type} roomy={roomy} onClick={() => handleSelect(opt.type)}>
          <span
            aria-hidden
            className={
              roomy ? "edit-menu-option-icon edit-menu-option-icon-lg" : "edit-menu-option-icon"
            }
          >
            {opt.icon}
          </span>
          {opt.label}
        </EditMenuItem>
      ))}
    </EditPortalPanel>
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
        {dropdownContent}
      </>
    );
  }

  if (variant === "menu") {
    return (
      <>
        <div ref={anchorRef}>
          <EditMenuItem
            ref={triggerRef}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            icon="+"
          >
            {label}
          </EditMenuItem>
        </div>
        {dropdownContent}
      </>
    );
  }

  return (
    <>
      <div ref={anchorRef} className="relative">
        <EditAddTrigger ref={triggerRef} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {label}
        </EditAddTrigger>
      </div>
      {dropdownContent}
    </>
  );
}

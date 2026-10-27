"use client";

import type { ReactNode } from "react";
import { useEditPopover } from "@/hooks/useEditPopover";

type EditPopoverProps = {
  /** Positioning / region classes, e.g. `block-controls`, `empty-sections-menu`. */
  className?: string;
  /** Keep the menu open while a nested portal (settings, add-block list) is open. */
  pinned?: boolean;
  onDismiss?: () => void;
  rootTestId?: string;
  trigger: {
    label: string;
    title?: string;
    testId?: string;
    /** Defaults to `edit-chip`. Add `edit-chip-wide` when needed. */
    className?: string;
    children: ReactNode;
  };
  menu: {
    role?: string;
    "aria-label"?: string;
    "aria-orientation"?: "vertical" | "horizontal";
    testId?: string;
    children: ReactNode;
  };
  /** Portals or other siblings rendered inside the popover root (outside the menu). */
  children?: ReactNode;
};

/**
 * Hover / focus edit popover: chip + absolute menu + optional nested portals.
 * Visibility is CSS-driven (`.edit-popover`); a11y via `useEditPopover`.
 */
export function EditPopover({
  className = "",
  pinned = false,
  onDismiss,
  rootTestId,
  trigger,
  menu,
  children,
}: EditPopoverProps) {
  const { rootProps, triggerProps } = useEditPopover({ pinned, onDismiss });
  const rootClass = ["edit-popover", className].filter(Boolean).join(" ");
  const triggerClass = trigger.className ?? "edit-chip";

  return (
    <div
      className={rootClass}
      data-testid={rootTestId}
      data-open={pinned ? "true" : undefined}
      {...rootProps}
    >
      <button
        type="button"
        className={triggerClass}
        aria-label={trigger.label}
        title={trigger.title ?? trigger.label}
        data-testid={trigger.testId}
        {...triggerProps}
      >
        {trigger.children}
      </button>
      <div
        className="edit-popover-menu"
        role={menu.role}
        aria-label={menu["aria-label"]}
        aria-orientation={menu["aria-orientation"]}
        data-testid={menu.testId}
      >
        {menu.children}
      </div>
      {children}
    </div>
  );
}

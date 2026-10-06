"use client";

import { useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

/**
 * Accessibility state for a CSS hover / focus-within edit popover (`.edit-popover`).
 * Visibility stays CSS-driven (zero layout shift); this adds what CSS cannot:
 * - WCAG 1.4.13: Escape dismisses the popover without moving the pointer; focus returns to the chip
 * - the chip re-opens it with Enter / Space / click after a dismiss
 * - `aria-expanded` on the chip mirrors what is actually visible
 */
export function useEditPopover({ pinned = false, onDismiss }: { pinned?: boolean; onDismiss?: () => void } = {}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const rootProps = {
    "data-dismissed": dismissed ? "true" : undefined,
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => {
      setHovered(false);
      setDismissed(false);
    },
    onFocus: () => setFocused(true),
    onBlur: (e: FocusEvent<HTMLDivElement>) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      setFocused(false);
      setDismissed(false);
    },
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onDismiss?.();
      setDismissed(true);
      triggerRef.current?.focus();
    },
  };

  const triggerProps = {
    ref: triggerRef,
    "aria-expanded": (pinned || hovered || focused) && !dismissed,
    // Hover / focus already open it; a click (or Enter after Escape) re-opens, never closes
    onClick: () => setDismissed(false),
  };

  return { rootProps, triggerProps };
}

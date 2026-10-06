"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard + pointer behaviour for a trigger that opens a portalled panel (WAI-ARIA disclosure).
 * Portals render at the end of <body>, so without this keyboard users would have to tab
 * through the whole page to reach the options.
 * - open: focus moves to the first control in the panel
 * - Escape / Tab out / click outside: closes; Escape returns focus to the trigger
 */
export function useDropdownA11y({
  open,
  setOpen,
  triggerRef,
  panelRef,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
}) {
  // Latest callback without re-running the effects (an inline setOpen would re-focus every render)
  const setOpenRef = useRef(setOpen);
  useEffect(() => {
    setOpenRef.current = setOpen;
  });

  useEffect(() => {
    if (!open) return;
    const close = () => setOpenRef.current(false);
    const inside = (node: Node | null) =>
      !!node && (!!triggerRef.current?.contains(node) || !!panelRef.current?.contains(node));

    // Wait for the portal to mount (its position is measured first)
    let raf = 0;
    const focusFirst = (tries: number) => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      if (first) first.focus();
      else if (tries > 0) raf = requestAnimationFrame(() => focusFirst(tries - 1));
    };
    raf = requestAnimationFrame(() => focusFirst(5));

    const onPointerDown = (e: MouseEvent) => {
      if (!inside(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
      triggerRef.current?.focus();
    };
    const onFocusIn = (e: FocusEvent) => {
      if (!inside(e.target as Node)) close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open, triggerRef, panelRef]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    // Tab past the last option returns to the control after the trigger, like an inline menu
    const onPanelKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const atEdge = e.shiftKey ? document.activeElement === items[0] : document.activeElement === items.at(-1);
      if (!atEdge) return;
      e.preventDefault();
      setOpenRef.current(false);
      trigger.focus();
    };
    panel.addEventListener("keydown", onPanelKeyDown);
    return () => panel.removeEventListener("keydown", onPanelKeyDown);
  });
}

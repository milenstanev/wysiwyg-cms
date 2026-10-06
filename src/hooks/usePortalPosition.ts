"use client";

import { useState, useLayoutEffect, useEffect, useRef, type RefObject } from "react";

export interface PortalPositionOptions {
  /** Align right edge of content to anchor's right (content width = width) */
  alignRight?: boolean;
  /** Content width for alignRight; default 220 */
  width?: number;
  /** Offset below anchor; default 4 */
  gap?: number;
  /** When this changes, position is recomputed (e.g. block id when opening settings for a different block). */
  anchorKey?: string | number;
}

/**
 * Returns fixed position for a portal so it appears below the anchor and isn't clipped by overflow.
 * Updates on scroll/resize when open.
 * Uses useLayoutEffect + rAF so position is computed after the anchor ref is attached (e.g. after opening).
 */
export function usePortalPosition(
  anchorRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  options: PortalPositionOptions = {}
): { top: number; left: number } | null {
  const { alignRight = false, width = 220, gap = 4, anchorKey } = options;
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const raf = useRef<number | null>(null);

  const update = () => {
    if (!anchorRef.current || !isOpen) {
      setPosition(null);
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    const left = alignRight ? rect.right - width : rect.left;
    setPosition({
      top: rect.bottom + gap,
      left,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    // Measuring anchor DOM node synchronously in layout effect before paint is required for portal positioning
    // eslint-disable-next-line react-hooks/set-state-in-effect
    update();
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      update();
    });
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [isOpen, alignRight, width, gap, anchorKey]);

  useEffect(() => {
    if (!isOpen) return;
    const onUpdate = () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onUpdate, true);
    window.addEventListener("resize", onUpdate);
    return () => {
      window.removeEventListener("scroll", onUpdate, true);
      window.removeEventListener("resize", onUpdate);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [isOpen, alignRight, width, gap]);

  return isOpen ? position : null;
}

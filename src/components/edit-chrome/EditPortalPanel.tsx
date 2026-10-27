"use client";

import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { portalRoot } from "@/lib/portal-root";
import { usePortalPosition } from "@/hooks/usePortalPosition";
import { EDIT_PORTAL_GAP } from "./constants";

type EditPortalPanelProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  panelRef?: RefObject<HTMLDivElement | null>;
  width?: number;
  alignRight?: boolean;
  gap?: number;
  anchorKey?: string | number;
  /** Extra padding (`--space-3`) for denser content like layout picker. */
  padded?: boolean;
  className?: string;
  role?: string;
  "aria-label"?: string;
  "data-testid"?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Fixed portaled panel with the shared `.edit-portal-panel` shell and hover bridge.
 */
export function EditPortalPanel({
  open,
  anchorRef,
  panelRef,
  width,
  alignRight,
  gap = EDIT_PORTAL_GAP,
  anchorKey,
  padded = false,
  className = "",
  role = "group",
  "aria-label": ariaLabel,
  "data-testid": testId,
  style,
  children,
}: EditPortalPanelProps) {
  const portalPosition = usePortalPosition(anchorRef, open, {
    width,
    alignRight,
    gap,
    anchorKey,
  });

  if (!open || !portalPosition) return null;

  const placement = portalPosition.bottom != null ? "above" : "below";
  const classes = ["edit-portal-panel", padded ? "edit-portal-panel-padded" : "", className]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div
      ref={panelRef}
      role={role}
      aria-label={ariaLabel}
      data-testid={testId}
      data-placement={placement}
      className={classes}
      style={{ ...portalPosition, ...style }}
    >
      {children}
    </div>,
    portalRoot()
  );
}

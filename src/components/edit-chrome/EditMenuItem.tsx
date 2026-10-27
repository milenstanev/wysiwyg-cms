"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type EditMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Shows the leading glyph column (`.edit-menu-icon`). */
  icon?: ReactNode;
  danger?: boolean;
  /** Larger padding for portaled option lists. */
  roomy?: boolean;
};

export const EditMenuItem = forwardRef<HTMLButtonElement, EditMenuItemProps>(function EditMenuItem(
  { icon, danger = false, roomy = false, className = "", children, type = "button", ...rest },
  ref
) {
  const classes = [
    "edit-menu-item",
    roomy ? "edit-menu-item-roomy" : "",
    danger ? "edit-menu-danger" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {icon != null && (
        <span aria-hidden className="edit-menu-icon">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
});

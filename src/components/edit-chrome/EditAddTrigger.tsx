"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type EditAddTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
};

export const EditAddTrigger = forwardRef<HTMLButtonElement, EditAddTriggerProps>(
  function EditAddTrigger({ icon = "+", className = "", children, type = "button", ...rest }, ref) {
    const classes = ["edit-add-trigger", className].filter(Boolean).join(" ");
    return (
      <button ref={ref} type={type} className={classes} {...rest}>
        <span aria-hidden className="text-[var(--muted)]">
          {icon}
        </span>
        {children}
      </button>
    );
  }
);

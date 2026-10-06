interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
  /** When true, no default card styling — only structure (min-w-0). For custom HTML/CSS. */
  unstyled?: boolean;
}

/** Main content area. Uses design tokens (--content-accent, --card-radius, etc.). Set unstyled to style fully yourself. */
export function ContentCard({ children, className = "", unstyled = false }: ContentCardProps) {
  if (unstyled) {
    return <div className={`min-w-0 ${className}`}>{children}</div>;
  }
  return (
    <div className={`min-w-0 bg-[var(--surface)] layout-content-card ${className}`}>{children}</div>
  );
}

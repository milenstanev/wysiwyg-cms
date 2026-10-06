interface SidebarCardProps {
  side: "left" | "right";
  children: React.ReactNode;
  className?: string;
  /** When true, no default card styling — only structure. For custom HTML/CSS. */
  unstyled?: boolean;
}

/** Sidebar region. Uses --sidebar-left-accent / --sidebar-right-accent. Set unstyled to style fully yourself. */
export function SidebarCard({
  side,
  children,
  className = "",
  unstyled = false,
}: SidebarCardProps) {
  if (unstyled) {
    return <aside className={`min-w-0 space-y-6 ${className}`}>{children}</aside>;
  }
  const layoutClass = side === "left" ? "layout-sidebar-left" : "layout-sidebar-right";
  return <aside className={`min-w-0 space-y-6 ${layoutClass} ${className}`}>{children}</aside>;
}

/**
 * Placeholder for future module injection (Joomla-style module positions).
 * When placeholderLabel is set and there are no children, shows a visible
 * label so the layout reads like a real RocketTheme/Gantry template.
 */
interface ModulePositionProps {
  name: string;
  className?: string;
  /** Shown when children is empty — e.g. "Utility A", "Header", "Showcase B". */
  placeholderLabel?: string;
  children?: React.ReactNode;
}

export function ModulePosition({
  name,
  className = "",
  placeholderLabel,
  children,
}: ModulePositionProps) {
  const hasContent = children != null && !(Array.isArray(children) && children.length === 0);
  const showPlaceholder = !hasContent && placeholderLabel;

  return (
    <div
      data-module-position={name}
      data-module-placeholder
      className={className}
      aria-label={`Module position: ${name}`}
    >
      {showPlaceholder ? (
        <span className="opacity-70 select-none" data-module-placeholder-label>
          {placeholderLabel}
        </span>
      ) : (
        children
      )}
    </div>
  );
}

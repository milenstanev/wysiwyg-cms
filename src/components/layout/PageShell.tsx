import { CONTAINER_CLASS } from "@/lib/layout/constants";

interface PageShellProps {
  children: React.ReactNode;
  /** Renders inside a header bar with same width as content */
  header?: React.ReactNode;
  /** Renders at bottom with same width as content */
  footer?: React.ReactNode;
  /** Outer wrapper */
  className?: string;
  /** Extra classes for header, main, footer — merged with defaults. Use for designer overrides. */
  headerClassName?: string;
  mainClassName?: string;
  footerClassName?: string;
}

export function PageShell({
  children,
  header,
  footer,
  className = "",
  headerClassName = "",
  mainClassName = "",
  footerClassName = "",
}: PageShellProps) {
  return (
    <div
      data-page-shell
      className={`site-shell min-h-screen flex flex-col bg-[var(--background)] py-[var(--page-vertical-padding)] sm:py-[var(--space-6)] ${className}`}
    >
      {header && (
        <header
          data-page-header
          className={`site-header sticky top-3 ${CONTAINER_CLASS} w-full mb-[var(--page-header-gap)] flex flex-wrap items-center justify-between gap-[var(--space-3)] ${headerClassName}`}
        >
          {header}
        </header>
      )}
      <main id="main-content" tabIndex={-1} data-page-main className={`flex-1 ${CONTAINER_CLASS} w-full min-w-0 ${mainClassName}`}>
        {children}
      </main>
      {footer && (
        <footer data-page-footer className={`mt-auto w-full ${footerClassName}`}>
          {footer}
        </footer>
      )}
    </div>
  );
}

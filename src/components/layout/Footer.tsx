import Link from "next/link";
import { CONTAINER_CLASS } from "@/lib/layout/constants";

export function Footer() {
  return (
    <div className="site-footer mt-[var(--footer-gap)] border-t border-[var(--border)] py-[var(--space-6)] w-full">
      <div
        className={`${CONTAINER_CLASS} flex flex-col sm:flex-row items-center justify-between gap-[var(--space-4)] text-sm text-[var(--muted)]`}
      >
        <span>© {new Date().getFullYear()} WYSIWYG CMS</span>
        <nav className="flex gap-[var(--space-4)]">
          <Link href="/admin" className="hover:text-[var(--foreground)] transition-colors">
            Admin
          </Link>
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            Home
          </Link>
        </nav>
      </div>
    </div>
  );
}

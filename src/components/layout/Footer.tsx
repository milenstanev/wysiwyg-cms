import Link from "next/link";
import { CONTAINER_CLASS } from "@/lib/layout/constants";

export function Footer() {
  return (
    <footer className="site-footer mt-16 border-t border-[var(--border)] py-8 w-full">
      <div
        className={`${CONTAINER_CLASS} flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--muted)]`}
      >
        <span>© {new Date().getFullYear()} CMS Experiment</span>
        <nav className="flex gap-4">
          <Link href="/admin" className="hover:text-[var(--foreground)] transition-colors">
            Admin
          </Link>
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            Home
          </Link>
        </nav>
      </div>
    </footer>
  );
}

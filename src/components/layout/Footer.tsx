import Link from "next/link";
import { CONTAINER_CLASS } from "@/lib/layout/constants";

export function Footer() {
  return (
    <footer className="mt-12 pt-8 border-t border-zinc-200 w-full">
      <div
        className={`${CONTAINER_CLASS} flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500`}
      >
        <span>© {new Date().getFullYear()} CMS Experiment</span>
        <nav className="flex gap-4">
          <Link href="/admin" className="hover:text-zinc-700 transition-colors">
            Admin
          </Link>
          <Link href="/" className="hover:text-zinc-700 transition-colors">
            Home
          </Link>
        </nav>
      </div>
    </footer>
  );
}

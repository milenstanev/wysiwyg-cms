"use client";

import Link from "next/link";
import { PageRenderer } from "@/components/PageRenderer";
import { Footer } from "@/components/layout/Footer";
import { LayoutDropdown } from "@/components/layout/LayoutDropdown";
import { PageShell } from "@/components/layout/PageShell";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { usePageEditor } from "@/hooks/usePageEditor";
import type { Page } from "@/lib/cms/types";

export interface EditableSitePageProps {
  initialPage: Page;
  allPages: { id: string; slug: string; title: string }[];
  currentSlug: string;
}

export function EditableSitePage({ initialPage, allPages, currentSlug }: EditableSitePageProps) {
  const { page, isEditing, setEditing, saving, message, callbacks, actions } =
    usePageEditor(initialPage);

  const navPages = allPages.filter((p) => p.slug !== "home");

  const header = (
    <>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <Link href="/" className="site-brand" aria-label="CMS Experiment home">
          CMS <span>EXPERIMENT</span>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Site navigation">
          <Link
            href="/"
            aria-current={currentSlug === "home" ? "page" : undefined}
            className={`site-nav-link ${
              currentSlug === "home"
                ? "text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Home
          </Link>
          {navPages.map((p) => (
            <Link
              key={p.id}
              href={`/${p.slug}`}
              aria-current={p.slug === currentSlug ? "page" : undefined}
              className={`site-nav-link ${
                p.slug === currentSlug
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {p.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ThemeSwitcher />
        {message && (
          <span
            className={`text-sm ${message === "Saved!" ? "text-green-600" : "text-red-600"}`}
            role="status"
          >
            {message}
          </span>
        )}
        {isEditing ? (
          <>
            {callbacks.onLayoutChange && (
              <LayoutDropdown value={page.layout ?? "single"} onChange={callbacks.onLayoutChange} />
            )}
            <select
              value={page.slug}
              onChange={(e) => {
                const next = e.target.value;
                if (next === page.slug) return;
                if (!window.confirm("Switch page? Unsaved changes will be lost.")) return;
                window.location.assign(next === "home" ? "/?edit=1" : `/${next}?edit=1`);
              }}
              className="text-sm bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1.5 text-[var(--foreground)]"
              aria-label="Select page to edit"
            >
              {allPages.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => actions.cancel()}
              className="px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--border)] rounded transition-colors"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => actions.save()}
              disabled={saving}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium opacity-90 hover:opacity-100 disabled:opacity-50 transition-colors"
              aria-label={saving ? "Saving…" : "Save changes"}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full border border-[var(--foreground)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--surface)]"
            aria-label="Edit this page"
            data-testid="edit-page-button"
          >
            Edit this page
          </button>
        )}
      </div>
    </>
  );

  return (
    <PageShell header={header} footer={<Footer />}>
      <PageRenderer page={page} editable={isEditing} {...callbacks} />
    </PageShell>
  );
}

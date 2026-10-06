"use client";

import Link from "next/link";
import { PageRenderer } from "@/components/PageRenderer";
import { Footer } from "@/components/layout/Footer";
import { LayoutDropdown } from "@/components/layout/LayoutDropdown";
import { PageShell } from "@/components/layout/PageShell";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { usePageEditor } from "@/hooks/usePageEditor";
import type { Page } from "@/lib/cms/types";
import { TEST_ID } from "@/lib/test-ids";

export interface NavPageLink {
  id: string;
  slug: string;
  title: string;
  /** When false, hide from site nav (e.g. optional Blog with no layout blocks). Default true. */
  showInNav?: boolean;
}

export interface EditableSitePageProps {
  initialPage: Page;
  allPages: NavPageLink[];
  currentSlug: string;
}

export function EditableSitePage({ initialPage, allPages, currentSlug }: EditableSitePageProps) {
  const { page, isEditing, setEditing, saving, message, callbacks, actions } =
    usePageEditor(initialPage);

  const navPages = allPages.filter((p) => p.slug !== "home" && p.showInNav !== false);

  const header = (
    <>
      <div className="flex flex-wrap items-center gap-x-[var(--space-6)] gap-y-[var(--space-3)]">
        <Link href="/" className="site-brand" aria-label="WYSIWYG CMS home">
          WYSIWYG <span>CMS</span>
        </Link>
        <nav
          className="flex flex-wrap gap-x-[var(--space-4)] gap-y-[var(--space-2)] text-sm"
          aria-label="Site navigation"
        >
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
      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        <ThemeSwitcher />
        {/* Stays mounted (invisible) while editing so the header keeps its exact size. */}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`rounded-full border border-[var(--foreground)] px-[var(--space-4)] py-[var(--space-2)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--surface)] ${isEditing ? "invisible" : ""}`}
          aria-label="Edit this page"
          aria-hidden={isEditing || undefined}
          tabIndex={isEditing ? -1 : undefined}
          data-testid={TEST_ID.editPageButton}
        >
          Edit this page
        </button>
      </div>
    </>
  );

  return (
    <PageShell header={header} footer={<Footer />}>
      <PageRenderer
        page={page}
        editable={isEditing}
        allPages={allPages.map((p) => ({ id: p.id, slug: p.slug, title: p.title }))}
        currentSlug={currentSlug}
        {...callbacks}
      />
      {/* Always mounted so screen readers announce every change; the visible copy is aria-hidden */}
      <p role="status" className="sr-only">
        {message}
      </p>
      {(isEditing || message) && (
        <div className="editor-bar" role="region" aria-label="Editor" data-testid={TEST_ID.editorBar}>
          {message && (
            <span className="text-sm font-medium text-[var(--foreground)]" aria-hidden>
              {message === "Saved!" ? "✓ " : "⚠ "}
              {message}
            </span>
          )}
          {isEditing && (
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
                className="text-sm bg-[var(--surface)] border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] text-[var(--foreground)]"
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
                className="px-[var(--space-3)] py-[var(--space-1)] text-sm text-[var(--muted)] hover:bg-[var(--border)] rounded transition-colors"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => actions.save()}
                disabled={saving}
                className="px-[var(--space-4)] py-[var(--space-2)] bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 transition-colors"
                aria-label={saving ? "Saving…" : "Save changes"}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      )}
    </PageShell>
  );
}

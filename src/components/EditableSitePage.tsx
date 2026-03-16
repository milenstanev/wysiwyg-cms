"use client";

import Link from "next/link";
import { PageRenderer } from "@/components/PageRenderer";
import { Footer } from "@/components/layout/Footer";
import { PageShell } from "@/components/layout/PageShell";
import { usePageEditor } from "@/hooks/usePageEditor";
import type { Page } from "@/lib/cms/types";

export interface EditableSitePageProps {
  initialPage: Page;
  allPages: { id: string; slug: string; title: string }[];
  currentSlug: string;
}

export function EditableSitePage({ initialPage, allPages, currentSlug }: EditableSitePageProps) {
  const { page, isEditing, setEditing, saving, message, callbacks, actions } = usePageEditor(initialPage);

  const navPages = allPages.filter((p) => p.slug !== "home");

  const header = (
    <>
      <nav className="flex gap-4 text-sm" aria-label="Site navigation">
        <Link
          href="/"
          className={currentSlug === "home" ? "text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-900"}
        >
          Home
        </Link>
        {navPages.map((p) => (
          <Link
            key={p.id}
            href={`/${p.slug}`}
            className={p.slug === currentSlug ? "text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-900"}
          >
            {p.title}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
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
            <select
              value={page.slug}
              onChange={(e) =>
                window.location.assign(
                  e.target.value === "home" ? "/?edit=1" : `/${e.target.value}?edit=1`
                )
              }
              className="text-sm bg-white border border-zinc-300 rounded px-2 py-1.5 text-zinc-900"
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
              className="px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => actions.save()}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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

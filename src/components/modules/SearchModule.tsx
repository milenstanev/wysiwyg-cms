"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface SearchModuleProps {
  params?: Record<string, unknown>;
  pages?: { id: string; slug: string; title: string }[];
  editable?: boolean;
  onParamsChange?: (params: Record<string, unknown>) => void;
}

export function SearchModule({ params, pages = [], editable, onParamsChange }: SearchModuleProps) {
  const placeholder =
    typeof params?.placeholder === "string" ? params.placeholder : "Search pages…";
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [pages, query]);

  if (editable && onParamsChange) {
    return (
      <div className="space-y-[var(--space-2)]" data-module="search">
        <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Search</p>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Placeholder</span>
          <input
            type="text"
            value={placeholder}
            onChange={(e) => onParamsChange({ ...params, placeholder: e.target.value })}
            className="mt-[var(--space-1)] w-full text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--surface)]"
            aria-label="Search placeholder"
          />
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-2)]" data-module="search">
      <label className="sr-only" htmlFor="module-search">
        Search pages
      </label>
      <input
        id="module-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm border border-[var(--border)] rounded-lg px-[var(--space-3)] py-[var(--space-2)] bg-[var(--surface)] text-[var(--foreground)]"
      />
      {query.trim() && (
        <ul className="text-sm space-y-[var(--space-1)]" role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <li className="text-[var(--muted)]">No pages found</li>
          ) : (
            results.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.slug === "home" ? "/" : `/${p.slug}`}
                  className="text-[var(--accent)] hover:underline"
                >
                  {p.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

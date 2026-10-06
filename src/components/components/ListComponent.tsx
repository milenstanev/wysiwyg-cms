"use client";

import Link from "next/link";

export interface ListPageItem {
  id: string;
  slug: string;
  title: string;
}

export interface ListComponentProps {
  pages?: ListPageItem[];
  editable?: boolean;
}

/** Index of related/published pages. */
export function ListComponent({ pages = [], editable }: ListComponentProps) {
  const items = pages.filter((p) => p.slug !== "home");

  return (
    <div data-component="list" className="space-y-[var(--space-3)]">
      {editable && (
        <p className="text-xs text-[var(--muted)]">Page list (published pages)</p>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No pages to list.</p>
      ) : (
        <ul className="space-y-[var(--space-2)]">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/${p.slug}`}
                className="text-[var(--accent)] hover:underline font-medium"
              >
                {p.title}
              </Link>
              <span className="text-xs text-[var(--muted)] ml-[var(--space-2)]">/{p.slug}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

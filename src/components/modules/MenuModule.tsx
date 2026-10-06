"use client";

import Link from "next/link";

export interface MenuLink {
  label: string;
  href: string;
}

export interface MenuModuleProps {
  params?: Record<string, unknown>;
  pages?: { id: string; slug: string; title: string }[];
  currentSlug?: string;
  editable?: boolean;
  onParamsChange?: (params: Record<string, unknown>) => void;
}

function parseLinks(params?: Record<string, unknown>): MenuLink[] {
  const raw = params?.links;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is MenuLink =>
        item != null &&
        typeof item === "object" &&
        typeof (item as MenuLink).label === "string" &&
        typeof (item as MenuLink).href === "string"
    )
    .map((item) => ({ label: item.label, href: item.href }));
}

export function MenuModule({
  params,
  pages,
  currentSlug,
  editable,
  onParamsChange,
}: MenuModuleProps) {
  let links = parseLinks(params);
  if (links.length === 0 && pages && pages.length > 0) {
    links = [
      { label: "Home", href: "/" },
      ...pages
        .filter((p) => p.slug !== "home")
        .map((p) => ({ label: p.title, href: `/${p.slug}` })),
    ];
  }

  const updateLink = (index: number, patch: Partial<MenuLink>) => {
    if (!onParamsChange) return;
    const next = links.map((l, i) => (i === index ? { ...l, ...patch } : l));
    onParamsChange({ ...params, links: next });
  };

  const addLink = () => {
    if (!onParamsChange) return;
    onParamsChange({ ...params, links: [...links, { label: "New link", href: "/" }] });
  };

  const removeLink = (index: number) => {
    if (!onParamsChange) return;
    onParamsChange({ ...params, links: links.filter((_, i) => i !== index) });
  };

  if (editable && onParamsChange) {
    return (
      <div className="space-y-[var(--space-2)]" data-module="menu">
        <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Menu</p>
        {links.map((link, i) => (
          <div key={i} className="flex flex-wrap gap-[var(--space-2)] items-center">
            <input
              type="text"
              value={link.label}
              onChange={(e) => updateLink(i, { label: e.target.value })}
              aria-label={`Link ${i + 1} label`}
              className="text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--surface)] flex-1 min-w-[6rem]"
            />
            <input
              type="text"
              value={link.href}
              onChange={(e) => updateLink(i, { href: e.target.value })}
              aria-label={`Link ${i + 1} href`}
              className="text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--surface)] flex-1 min-w-[6rem]"
            />
            <button
              type="button"
              onClick={() => removeLink(i)}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label={`Remove link ${i + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addLink}
          className="text-xs font-medium text-[var(--accent)]"
        >
          + Add link
        </button>
      </div>
    );
  }

  return (
    <nav className="flex flex-wrap gap-x-[var(--space-4)] gap-y-[var(--space-2)] text-sm" data-module="menu" aria-label="Module menu">
      {links.map((link) => {
        const isCurrent =
          (link.href === "/" && currentSlug === "home") ||
          link.href === `/${currentSlug}`;
        return (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className={
              isCurrent
                ? "text-[var(--foreground)] font-medium"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }
            aria-current={isCurrent ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

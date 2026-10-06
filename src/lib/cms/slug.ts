/** Turn a title into a URL-safe slug (lowercase, hyphens). */
export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "page";
}

/** Ensure slug is valid for URLs (a-z, 0-9, hyphens). */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** Reserved path segments that cannot be page slugs. */
export const RESERVED_SLUGS = new Set(["admin", "api", "uploads", "_next"]);

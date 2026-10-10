/**
 * Allowlisted HTML for rich text fields.
 * Keep in sync with src/lib/cms/sanitize-html.ts (Next persist path).
 *
 * Inline: b, strong, i, em, u, a[href], br, span
 * Blocks: p, div, h2–h4, ul, ol, li, blockquote
 * Attrs: href (safe), style text-align only, class (allowlisted)
 */

const VOID_OK = new Set(["br", "img"]);
const WRAP_OK = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "a",
  "span",
  "p",
  "div",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
]);

const CLASS_OK = new Set([
  "line-height-18",
  "padding-bottom-10",
  "padding-bottom-20",
  "page-title1",
  "page-title2",
  "page-subtitle-title1",
]);

/** Safe link targets: site paths, http(s), and in-page hashes (not javascript:). */
export function isSafeHref(href: string): boolean {
  const t = href.trim();
  if (!t) return false;
  if (t.startsWith("/") && !t.startsWith("//")) return true;
  if (/^https?:\/\//i.test(t)) return true;
  if (t.startsWith("#") && !/^#?javascript:/i.test(t)) return true;
  return false;
}

/** Safe image srcs: site paths (e.g. /uploads/…) or http(s). */
export function isSafeImgSrc(src: string): boolean {
  const t = src.trim();
  if (!t) return false;
  if (t.startsWith("/") && !t.startsWith("//")) return true;
  if (/^https?:\/\//i.test(t)) return true;
  return false;
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function parseTextAlign(style: string): string | undefined {
  const m = style.match(/(?:^|;)\s*text-align\s*:\s*(left|right|center|justify)\s*(?:;|$)/i);
  return m?.[1]?.toLowerCase();
}

function parseAllowedClass(classAttr: string): string | undefined {
  const kept = classAttr
    .split(/\s+/)
    .map((c) => c.trim())
    .filter((c) => CLASS_OK.has(c));
  return kept.length ? kept.join(" ") : undefined;
}

type Token =
  | { kind: "text"; value: string }
  | { kind: "open"; tag: string; href?: string; align?: string; className?: string }
  | { kind: "close"; tag: string }
  | { kind: "void"; tag: string; src?: string; alt?: string };

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|[^<]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const full = m[0];
    if (full.startsWith("<")) {
      const tag = (m[1] ?? "").toLowerCase();
      const attrs = m[2] ?? "";
      const isClose = full.startsWith("</");
      if (isClose) {
        tokens.push({ kind: "close", tag });
      } else if (tag === "img") {
        const sm = attrs.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const src = sm?.[1] ?? sm?.[2] ?? sm?.[3] ?? "";
        const am = attrs.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        const alt = am?.[1] ?? am?.[2] ?? "";
        if (isSafeImgSrc(src)) tokens.push({ kind: "void", tag: "img", src, alt });
      } else if (VOID_OK.has(tag)) {
        tokens.push({ kind: "void", tag: "br" });
      } else if (WRAP_OK.has(tag)) {
        let href: string | undefined;
        let align: string | undefined;
        let className: string | undefined;
        if (tag === "a") {
          const hm = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
          href = hm?.[1] ?? hm?.[2] ?? hm?.[3] ?? "";
        }
        const sm = attrs.match(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        if (sm) align = parseTextAlign(sm[1] ?? sm[2] ?? "");
        const am = attrs.match(/\balign\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        if (!align && am) {
          const v = (am[1] ?? am[2] ?? am[3] ?? "").toLowerCase();
          if (v === "left" || v === "right" || v === "center" || v === "justify") align = v;
        }
        const cm = attrs.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        if (cm) className = parseAllowedClass(cm[1] ?? cm[2] ?? "");
        tokens.push({ kind: "open", tag, href, align, className });
      }
    } else {
      tokens.push({ kind: "text", value: full });
    }
  }
  return tokens;
}

function openTagHtml(t: Extract<Token, { kind: "open" }>): string | null {
  if (t.tag === "a") {
    if (!t.href || !isSafeHref(t.href)) return null;
    return `<a href="${escapeText(t.href.trim())}">`;
  }
  const attrs: string[] = [];
  if (t.align) attrs.push(`style="text-align:${t.align}"`);
  if (t.className) attrs.push(`class="${escapeText(t.className)}"`);
  return attrs.length ? `<${t.tag} ${attrs.join(" ")}>` : `<${t.tag}>`;
}

/** Sanitize rich HTML. Identical on SSR and client. */
export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  const tokens = tokenize(html);
  const stack: string[] = [];
  let out = "";

  for (const t of tokens) {
    if (t.kind === "text") {
      out += escapeText(decodeBasicEntities(t.value));
      continue;
    }
    if (t.kind === "void") {
      if (t.tag === "img" && t.src) {
        out += `<img src="${escapeText(t.src)}" alt="${escapeText(t.alt ?? "")}">`;
      } else {
        out += "<br>";
      }
      continue;
    }
    if (t.kind === "open") {
      const opened = openTagHtml(t);
      if (!opened) {
        if (t.tag === "a") stack.push("skip-a");
        continue;
      }
      out += opened;
      stack.push(t.tag);
      continue;
    }
    if (stack.length === 0) continue;
    const top = stack[stack.length - 1];
    if (top === "skip-a") {
      if (t.tag === "a") stack.pop();
      continue;
    }
    if (top !== t.tag) continue;
    stack.pop();
    out += `</${t.tag}>`;
  }

  while (stack.length) {
    const tag = stack.pop()!;
    if (tag === "skip-a") continue;
    out += `</${tag}>`;
  }

  return out;
}

/** Plain text from HTML (for comparisons / fallbacks). */
export function plainTextFromHtml(html: string): string {
  if (!html) return "";
  return sanitizeRichHtml(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/** Sanitize rich string fields on a content block (persist path). */
export function sanitizeContentBlockFields<T extends {
  content?: string;
  title?: string;
  items?: string[];
  rows?: string[][];
}>(block: T): T {
  const next: T = { ...block };
  if (typeof next.content === "string") next.content = sanitizeRichHtml(next.content);
  if (typeof next.title === "string") next.title = sanitizeRichHtml(next.title);
  if (Array.isArray(next.items)) {
    next.items = next.items.map((item) =>
      typeof item === "string" ? sanitizeRichHtml(item) : item
    );
  }
  if (Array.isArray(next.rows)) {
    next.rows = next.rows.map((row) =>
      Array.isArray(row)
        ? row.map((cell) => (typeof cell === "string" ? sanitizeRichHtml(cell) : cell))
        : row
    );
  }
  return next;
}

/** Sanitize rich string fields on a content block (persist path). */
export function sanitizeContentBlockFields<T extends {
  content?: string;
  title?: string;
  items?: string[];
  rows?: string[][];
}>(block: T): T {
  const next: T = { ...block };
  if (typeof next.content === "string") next.content = sanitizeRichHtml(next.content);
  if (typeof next.title === "string") next.title = sanitizeRichHtml(next.title);
  if (Array.isArray(next.items)) {
    next.items = next.items.map((item) =>
      typeof item === "string" ? sanitizeRichHtml(item) : item
    );
  }
  if (Array.isArray(next.rows)) {
    next.rows = next.rows.map((row) =>
      Array.isArray(row)
        ? row.map((cell) => (typeof cell === "string" ? sanitizeRichHtml(cell) : cell))
        : row
    );
  }
  return next;
}

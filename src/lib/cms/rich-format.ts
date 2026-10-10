/** Helpers for selection-based rich formatting inside [data-rich-edit]. */

export function richEditAncestor(node: Node | null): HTMLElement | null {
  let n: Node | null = node;
  while (n) {
    if (n instanceof HTMLElement && n.getAttribute("data-rich-edit") === "true") {
      return n;
    }
    n = n.parentNode;
  }
  return null;
}

export function selectionInRichEdit(options?: { allowCollapsed?: boolean }): {
  selection: Selection;
  range: Range;
  editable: HTMLElement;
} | null {
  const allowCollapsed = options?.allowCollapsed ?? true;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  if (selection.isCollapsed && !allowCollapsed) {
    const focused = richEditAncestor(document.activeElement);
    if (!focused) return null;
  }
  const range = selection.getRangeAt(0);
  const editable =
    richEditAncestor(range.commonAncestorContainer) ??
    richEditAncestor(selection.anchorNode) ??
    richEditAncestor(selection.focusNode) ??
    richEditAncestor(document.activeElement);
  if (!editable) return null;
  // Collapsed caret outside our field
  if (selection.isCollapsed && !editable.contains(range.commonAncestorContainer)) {
    return null;
  }
  return { selection, range, editable };
}

export function saveSelection(): Range | null {
  const ctx = selectionInRichEdit();
  return ctx ? ctx.range.cloneRange() : null;
}

export function restoreSelection(range: Range | null): boolean {
  if (!range) return false;
  const selection = window.getSelection();
  if (!selection) return false;
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

/** Commands matching the legacy InlineEditor button set. */
export type FormatCommand =
  | "bold"
  | "italic"
  | "underline"
  | "unlink"
  | "removeFormat"
  | "undo"
  | "redo"
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight"
  | "insertOrderedList"
  | "insertUnorderedList"
  | "formatBlock"
  | "indent"
  | "outdent"
  | "cut"
  | "copy"
  | "paste";

export function applyFormatCommand(cmd: FormatCommand, value?: string): boolean {
  const ctx = selectionInRichEdit();
  if (!ctx) return false;
  ctx.editable.focus();
  if (cmd === "formatBlock") {
    const tag = value || "p";
    return document.execCommand("formatBlock", false, tag);
  }
  return document.execCommand(cmd, false, value);
}

export function applyCreateLink(href: string): boolean {
  const ctx = selectionInRichEdit();
  if (!ctx) return false;
  const url = href.trim();
  if (!url) return false;
  ctx.editable.focus();
  return document.execCommand("createLink", false, url);
}

export function applyQuote(): boolean {
  return applyFormatCommand("formatBlock", "blockquote");
}

export function queryFormatState(
  cmd: "bold" | "italic" | "underline" | "insertOrderedList" | "insertUnorderedList" | "justifyLeft" | "justifyCenter" | "justifyRight"
): boolean {
  try {
    return document.queryCommandState(cmd);
  } catch {
    return false;
  }
}

/** Notify React state that the rich field's HTML changed after a command. */
export function emitRichInput(editable: HTMLElement): void {
  editable.dispatchEvent(new Event("input", { bubbles: true }));
}

export type StyleOption = {
  label: string;
  /** formatBlock tag */
  tag: string;
  className?: string;
};

/**
 * Style presets from legacy StyleModifier.
 * Page-title styles use h2 (page already has one h1) with the original class names.
 */
export const RICH_STYLE_OPTIONS: StyleOption[] = [
  { label: "Page Title Style 1", tag: "h2", className: "page-title1" },
  { label: "Page Title Style 2", tag: "h2", className: "page-title2" },
  { label: "Page Subtitle", tag: "h2", className: "page-subtitle-title1" },
  { label: "Paragraph Default Style", tag: "p", className: "line-height-18 padding-bottom-10" },
  { label: "Paragraph Style 1", tag: "p", className: "line-height-18 padding-bottom-20" },
  { label: "Paragraph Style 2", tag: "p", className: "line-height-18" },
  { label: "Quote", tag: "blockquote" },
];

/** Current block tag inside the rich field (for ButtonsModifire-style gating). */
export function selectionParentTag(): string {
  const ctx = selectionInRichEdit({ allowCollapsed: true });
  if (!ctx) return "";
  const node = ctx.selection.focusNode;
  let el: HTMLElement | null =
    node instanceof HTMLElement ? node : node?.parentElement ?? null;
  while (el && el !== ctx.editable) {
    const tag = el.tagName.toUpperCase();
    if (["P", "H1", "H2", "H3", "H4", "LI", "BLOCKQUOTE", "DIV"].includes(tag)) return tag;
    el = el.parentElement;
  }
  return ctx.editable.tagName.toUpperCase();
}

/** Hide list/link controls on heading-like tags (legacy ButtonsModifire). */
export function controlsForTag(tag: string): {
  lists: boolean;
  link: boolean;
  indent: boolean;
} {
  const heading = tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4";
  return {
    lists: !heading,
    link: !heading,
    indent: !heading,
  };
}

export function applyInsertImage(src: string): boolean {
  const ctx = selectionInRichEdit({ allowCollapsed: true });
  if (!ctx) return false;
  const url = src.trim();
  if (!url || !/^https?:\/\//i.test(url)) return false;
  ctx.editable.focus();
  return document.execCommand("insertImage", false, url);
}

export function applyStyleOption(option: StyleOption): boolean {
  const ctx = selectionInRichEdit({ allowCollapsed: true });
  if (!ctx) return false;
  ctx.editable.focus();
  const ok = document.execCommand("formatBlock", false, option.tag);
  if (ok && option.className) {
    const sel = window.getSelection();
    const node = sel?.focusNode;
    let el: HTMLElement | null =
      node instanceof HTMLElement ? node : node?.parentElement ?? null;
    while (el && el !== ctx.editable) {
      if (el.tagName.toLowerCase() === option.tag) {
        el.className = option.className;
        break;
      }
      el = el.parentElement;
    }
  }
  return ok;
}

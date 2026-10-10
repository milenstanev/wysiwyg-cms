"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { portalRoot } from "@/lib/portal-root";
import { sanitizeRichHtml } from "@/lib/cms/sanitize-html";
import {
  loadEditorUiPosition,
  saveEditorUiPosition,
} from "@/lib/cms/editor-ui-position";
import {
  applyCreateLink,
  applyFormatCommand,
  applyInsertImage,
  applyQuote,
  applyStyleOption,
  controlsForTag,
  emitRichInput,
  queryFormatState,
  restoreSelection,
  RICH_STYLE_OPTIONS,
  saveSelection,
  selectionInRichEdit,
  selectionParentTag,
  type FormatCommand,
} from "@/lib/cms/rich-format";
import { TEST_ID } from "@/lib/test-ids";

type Pos = { top: number; left: number };

type Marks = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  ol: boolean;
  ul: boolean;
  left: boolean;
  center: boolean;
  right: boolean;
};

type InputMode = "link" | "image" | null;

function clampToolbar(top: number, left: number, width: number, height: number): Pos {
  const pad = 8;
  const maxLeft = Math.max(pad, window.innerWidth - width - pad);
  const maxTop = Math.max(pad, window.innerHeight - height - pad);
  return {
    top: Math.min(Math.max(pad, top), maxTop),
    left: Math.min(Math.max(pad, left), maxLeft),
  };
}

function readMarks(): Marks {
  return {
    bold: queryFormatState("bold"),
    italic: queryFormatState("italic"),
    underline: queryFormatState("underline"),
    ol: queryFormatState("insertOrderedList"),
    ul: queryFormatState("insertUnorderedList"),
    left: queryFormatState("justifyLeft"),
    center: queryFormatState("justifyCenter"),
    right: queryFormatState("justifyRight"),
  };
}

/**
 * Floating control-box — port of the legacy InlineEditor chrome:
 * draggable + localStorage position, style select, format buttons,
 * link/image URL row, per-field Submit / Cancel.
 */
export function SelectionFormatToolbar() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<Pos>({ top: 72, left: 72 });
  const [marks, setMarks] = useState<Marks>(readMarks);
  const [parentTag, setParentTag] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [urlValue, setUrlValue] = useState("https://");
  const savedRange = useRef<Range | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const styleSelectRef = useRef<HTMLSelectElement>(null);
  const focusReturn = useRef<HTMLElement | null>(null);
  /** HTML when the current field gained the editor (Cancel restores this). */
  const htmlOnStart = useRef<string | null>(null);
  const activeEditable = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);
  const userPlaced = useRef(false);
  /** After Submit/Cancel, ignore refresh until focus leaves the field. */
  const closedSession = useRef(false);

  useEffect(() => {
    setMounted(true);
    const saved = loadEditorUiPosition();
    if (saved) {
      userPlaced.current = true;
      setPos({ top: saved.y, left: saved.x });
    }
  }, []);

  const hide = useCallback((opts?: { endSession?: boolean }) => {
    if (opts?.endSession) closedSession.current = true;
    setVisible(false);
    setInputMode(null);
    savedRange.current = null;
    htmlOnStart.current = null;
  }, []);

  const placeDefaultNear = useCallback((editable: HTMLElement) => {
    if (userPlaced.current) return;
    const rect = editable.getBoundingClientRect();
    const tw = toolbarRef.current?.offsetWidth ?? 420;
    const th = toolbarRef.current?.offsetHeight ?? 88;
    setPos(clampToolbar(rect.top - th - 8, rect.left, tw, th));
  }, []);

  const refresh = useCallback(() => {
    if (
      inputMode &&
      (document.activeElement === urlInputRef.current ||
        document.activeElement === styleSelectRef.current)
    ) {
      return;
    }
    if (dragRef.current) return;

    const ctx = selectionInRichEdit({ allowCollapsed: true });
    if (!ctx) {
      const active = document.activeElement;
      if (toolbarRef.current?.contains(active)) return;
      // Keep open while focus is still in the same editable
      if (activeEditable.current && activeEditable.current.contains(active as Node)) return;
      closedSession.current = false;
      activeEditable.current = null;
      hide();
      return;
    }

    if (closedSession.current) {
      // Stay closed until the user focuses a (possibly new) field after Submit/Cancel
      if (document.activeElement === ctx.editable || ctx.editable.contains(document.activeElement)) {
        return;
      }
      closedSession.current = false;
    }

    if (activeEditable.current !== ctx.editable) {
      closedSession.current = false;
      activeEditable.current = ctx.editable;
      htmlOnStart.current = ctx.editable.innerHTML;
      placeDefaultNear(ctx.editable);
    }

    savedRange.current = ctx.range.cloneRange();
    focusReturn.current = ctx.editable;
    setParentTag(selectionParentTag());
    setMarks(readMarks());
    setVisible(true);
  }, [hide, inputMode, placeDefaultNear]);

  useEffect(() => {
    const onSel = () => requestAnimationFrame(refresh);
    document.addEventListener("selectionchange", onSel);
    document.addEventListener("mouseup", onSel);
    document.addEventListener("keyup", onSel);
    document.addEventListener("focusin", onSel);
    window.addEventListener("scroll", onSel, true);
    window.addEventListener("resize", onSel);
    return () => {
      document.removeEventListener("selectionchange", onSel);
      document.removeEventListener("mouseup", onSel);
      document.removeEventListener("keyup", onSel);
      document.removeEventListener("focusin", onSel);
      window.removeEventListener("scroll", onSel, true);
      window.removeEventListener("resize", onSel);
    };
  }, [refresh]);

  useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (inputMode) {
          setInputMode(null);
          return;
        }
        hide();
        focusReturn.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, hide, inputMode]);

  const afterMutation = () => {
    const ctx = selectionInRichEdit({ allowCollapsed: true });
    const el = ctx?.editable ?? activeEditable.current;
    if (!el) return;
    const html = sanitizeRichHtml(el.innerHTML);
    if (el.innerHTML !== html) el.innerHTML = html;
    emitRichInput(el);
    savedRange.current = saveSelection();
    setMarks(readMarks());
    setParentTag(selectionParentTag());
  };

  const runCommand = (cmd: FormatCommand) => {
    restoreSelection(savedRange.current ?? saveSelection());
    if (!selectionInRichEdit({ allowCollapsed: true }) && activeEditable.current) {
      activeEditable.current.focus();
    }
    applyFormatCommand(cmd);
    afterMutation();
  };

  const openUrlInput = (mode: "link" | "image") => {
    savedRange.current = saveSelection() ?? savedRange.current;
    setUrlValue("https://");
    setInputMode(mode);
    requestAnimationFrame(() => urlInputRef.current?.focus());
  };

  const applyUrlInput = () => {
    restoreSelection(savedRange.current);
    const applied =
      inputMode === "link"
        ? applyCreateLink(urlValue)
        : inputMode === "image"
          ? applyInsertImage(urlValue)
          : false;
    if (!applied) return;
    afterMutation();
    setInputMode(null);
    refresh();
  };

  const onStyleChange = (value: string) => {
    const option = RICH_STYLE_OPTIONS.find((o) => `${o.tag}:${o.className ?? ""}` === value);
    if (!option) return;
    restoreSelection(savedRange.current ?? saveSelection());
    applyStyleOption(option);
    afterMutation();
  };

  /** Legacy submit-editor: keep HTML, close chrome for this field. */
  const submitField = () => {
    const el = activeEditable.current;
    if (el) {
      el.innerHTML = sanitizeRichHtml(el.innerHTML);
      emitRichInput(el);
      htmlOnStart.current = el.innerHTML;
      el.blur();
    }
    hide({ endSession: true });
  };

  /** Legacy cancel-edit: restore htmlOnStartEdit and tear down. */
  const cancelField = () => {
    const el = activeEditable.current;
    if (el && htmlOnStart.current != null) {
      el.innerHTML = htmlOnStart.current;
      emitRichInput(el);
      el.blur();
    }
    hide({ endSession: true });
  };

  const onDragPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    dragRef.current = {
      ox: e.clientX,
      oy: e.clientY,
      sx: pos.left,
      sy: pos.top,
    };
  };

  const onDragPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const tw = toolbarRef.current?.offsetWidth ?? 420;
    const th = toolbarRef.current?.offsetHeight ?? 88;
    const next = clampToolbar(
      drag.sy + (e.clientY - drag.oy),
      drag.sx + (e.clientX - drag.ox),
      tw,
      th
    );
    setPos(next);
  };

  const onDragPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    userPlaced.current = true;
    const el = toolbarRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      saveEditorUiPosition(r.left, r.top);
      setPos({ left: r.left, top: r.top });
    }
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  if (!mounted || !visible) return null;

  const gate = controlsForTag(parentTag);

  const btn = (
    label: string,
    aria: string,
    opts: {
      testId?: string;
      cmd?: FormatCommand;
      pressed?: keyof Marks;
      onClick?: () => void;
      className?: string;
      hidden?: boolean;
    }
  ) => {
    if (opts.hidden) return null;
    return (
      <button
        key={aria}
        type="button"
        className={`selection-format-btn${opts.className ? ` ${opts.className}` : ""}`}
        aria-label={aria}
        aria-pressed={opts.pressed ? marks[opts.pressed] : undefined}
        data-testid={opts.testId}
        onClick={() => {
          if (opts.onClick) opts.onClick();
          else if (opts.cmd) runCommand(opts.cmd);
        }}
      >
        <span aria-hidden="true">{label}</span>
      </button>
    );
  };

  const panel = (
    <div
      ref={toolbarRef}
      className="selection-format-toolbar control-box"
      role="toolbar"
      aria-label="Inline editor"
      data-testid={TEST_ID.selectionFormatToolbar}
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("input, select, .selection-format-drag")) return;
        e.preventDefault();
      }}
    >
      <button
        type="button"
        className="selection-format-drag"
        aria-label="Drag editor"
        data-testid={TEST_ID.formatDrag}
        onPointerDown={onDragPointerDown}
        onPointerMove={onDragPointerMove}
        onPointerUp={onDragPointerUp}
        onPointerCancel={onDragPointerUp}
      >
        <span aria-hidden="true">⋮⋮</span>
      </button>

      <label className="sr-only" htmlFor="selection-format-style">
        Paragraph style
      </label>
      <select
        id="selection-format-style"
        ref={styleSelectRef}
        className="selection-format-style select-styles"
        aria-label="Paragraph style"
        data-testid={TEST_ID.formatStyle}
        defaultValue=""
        onChange={(e) => {
          onStyleChange(e.target.value);
          e.target.value = "";
        }}
      >
        <option value="" disabled>
          Style…
        </option>
        {RICH_STYLE_OPTIONS.map((o) => (
          <option key={`${o.tag}:${o.className ?? ""}`} value={`${o.tag}:${o.className ?? ""}`}>
            {o.label}
          </option>
        ))}
      </select>

      <span className="selection-format-sep" aria-hidden="true" />

      {btn("↶", "Undo", { testId: TEST_ID.formatUndo, cmd: "undo" })}
      {btn("↷", "Redo", { testId: TEST_ID.formatRedo, cmd: "redo" })}
      {btn("Clear", "Remove formatting", { testId: TEST_ID.formatClear, cmd: "removeFormat" })}

      <span className="selection-format-sep" aria-hidden="true" />

      {btn("B", "Bold", { testId: TEST_ID.formatBold, cmd: "bold", pressed: "bold" })}
      {btn("I", "Italic", {
        testId: TEST_ID.formatItalic,
        cmd: "italic",
        pressed: "italic",
        className: "selection-format-btn-italic",
      })}
      {btn("U", "Underline", {
        testId: TEST_ID.formatUnderline,
        cmd: "underline",
        pressed: "underline",
        className: "selection-format-btn-underline",
      })}

      <span className="selection-format-sep" aria-hidden="true" />

      {btn("⟸", "Align left", {
        testId: TEST_ID.formatAlignLeft,
        cmd: "justifyLeft",
        pressed: "left",
      })}
      {btn("≡", "Align center", {
        testId: TEST_ID.formatAlignCenter,
        cmd: "justifyCenter",
        pressed: "center",
      })}
      {btn("⟹", "Align right", {
        testId: TEST_ID.formatAlignRight,
        cmd: "justifyRight",
        pressed: "right",
      })}

      <span className="selection-format-sep" aria-hidden="true" />

      {btn("1.", "Numbered list", {
        testId: TEST_ID.formatOrderedList,
        cmd: "insertOrderedList",
        pressed: "ol",
        hidden: !gate.lists,
      })}
      {btn("•", "Bullet list", {
        testId: TEST_ID.formatUnorderedList,
        cmd: "insertUnorderedList",
        pressed: "ul",
        hidden: !gate.lists,
      })}
      {btn("“”", "Quote", {
        testId: TEST_ID.formatQuote,
        hidden: !gate.lists,
        onClick: () => {
          restoreSelection(savedRange.current ?? saveSelection());
          applyQuote();
          afterMutation();
        },
      })}
      {btn("⇥", "Increase indentation", {
        testId: TEST_ID.formatIndent,
        cmd: "indent",
        hidden: !gate.indent,
      })}
      {btn("⇤", "Decrease indentation", {
        testId: TEST_ID.formatOutdent,
        cmd: "outdent",
        hidden: !gate.indent,
      })}

      <span className="selection-format-sep" aria-hidden="true" />

      {!gate.link ? null : (
        <button
          type="button"
          className="selection-format-btn"
          aria-label="Add link"
          aria-expanded={inputMode === "link"}
          data-testid={TEST_ID.formatLink}
          onClick={() => openUrlInput("link")}
        >
          <span aria-hidden="true">Link</span>
        </button>
      )}
      {btn("Unlink", "Remove link", {
        testId: TEST_ID.formatUnlink,
        cmd: "unlink",
        hidden: !gate.link,
      })}
      <button
        type="button"
        className="selection-format-btn"
        aria-label="Insert image"
        aria-expanded={inputMode === "image"}
        data-testid={TEST_ID.formatImage}
        onClick={() => openUrlInput("image")}
      >
        <span aria-hidden="true">Img</span>
      </button>

      <span className="selection-format-sep" aria-hidden="true" />

      {btn("Cut", "Cut", { testId: TEST_ID.formatCut, cmd: "cut" })}
      {btn("Copy", "Copy", { testId: TEST_ID.formatCopy, cmd: "copy" })}
      {btn("Paste", "Paste", { testId: TEST_ID.formatPaste, cmd: "paste" })}

      <span className="selection-format-sep" aria-hidden="true" />

      <button
        type="button"
        className="selection-format-btn selection-format-submit"
        aria-label="Apply field changes"
        data-testid={TEST_ID.formatSubmit}
        onClick={submitField}
      >
        Submit
      </button>
      <button
        type="button"
        className="selection-format-btn"
        aria-label="Cancel field editing"
        data-testid={TEST_ID.formatCancel}
        onClick={cancelField}
      >
        Cancel
      </button>

      {inputMode && (
        <div className="selection-format-link-row editor-input-box">
          <label className="sr-only" htmlFor="selection-format-url-input">
            {inputMode === "link" ? "Link URL" : "Image URL"}
          </label>
          <input
            id="selection-format-url-input"
            ref={urlInputRef}
            type="url"
            className="selection-format-link-input"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrlInput();
              }
            }}
            data-testid={TEST_ID.formatLinkInput}
            placeholder={inputMode === "link" ? "https://…" : "https://…/image.jpg"}
          />
          <button
            type="button"
            className="selection-format-btn editor-set-value"
            aria-label={inputMode === "link" ? "Apply link" : "Insert image"}
            onClick={applyUrlInput}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );

  return createPortal(panel, portalRoot());
}

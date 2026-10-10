/** Persist floating inline-editor control-box position (legacy EditorUi). */

export const INLINE_EDITOR_POS_KEY = "inlineEditor";

export type EditorUiPosition = { x: number; y: number };

export function loadEditorUiPosition(): EditorUiPosition | null {
  try {
    const raw = localStorage.getItem(INLINE_EDITOR_POS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EditorUiPosition>;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveEditorUiPosition(x: number, y: number): void {
  try {
    localStorage.setItem(INLINE_EDITOR_POS_KEY, JSON.stringify({ x, y }));
  } catch {
    // ignore
  }
}

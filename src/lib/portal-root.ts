/**
 * Target for edit-UI portals (dropdowns, settings panels). They are position: fixed, so the
 * container does not affect placement — but inside <main> they stay within a landmark
 * (axe "region"), so screen-reader users can find them by landmark navigation.
 */
export function portalRoot(): HTMLElement {
  return document.getElementById("main-content") ?? document.body;
}

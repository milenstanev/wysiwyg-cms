/**
 * Shared `data-testid` values for product UI and tests.
 * Use these constants on JSX (`data-testid={TEST_ID.x}`) and in Vitest/Playwright
 * (`getByTestId(TEST_ID.x)`) so selectors never drift.
 */
export const TEST_ID = {
  adminLoaded: "admin-loaded",
  editPageButton: "edit-page-button",
  editorBar: "editor-bar",
  layoutDropdown: "layout-dropdown",
  emptySectionsMenu: "empty-sections-menu",
  modulesPanel: "modules-panel",
  mediaPicker: "media-picker",
  blockToolbar: "block-toolbar",
  blockControlsTrigger: "block-controls-trigger",
  blockControlsMenu: "block-controls-menu",
  blockSettings: "block-settings",
  moveBlockUp: "move-block-up",
  moveBlockDown: "move-block-down",
  removeBlock: "remove-block",
  blockEditColumn: "block-edit-column",
  blockAddSlot: "block-add-slot",
  blockStack: "block-stack",
  blockEditUnit: "block-edit-unit",
  contentBlock: "content-block",
} as const;

export type TestId = (typeof TEST_ID)[keyof typeof TEST_ID];

/** CSS attribute selector, e.g. `[data-testid="content-block"]`. */
export function testIdSelector(id: TestId | string): string {
  return `[data-testid="${id}"]`;
}

/** Test-only ComponentSlot mock ids (`slot-main`, `slot-left`, …). */
export function componentSlotTestId(region: string): string {
  return `slot-${region}`;
}

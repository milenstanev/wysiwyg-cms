# Layout diagram

## Page structure (high level)

```
┌─────────────────────────────────────────────────────────────────┐
│  PageShell (min-h-screen, flex flex-col)                         │
├─────────────────────────────────────────────────────────────────┤
│  header (optional)     CONTAINER_CLASS, same width as content   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Nav links (Home, About, …)  │  Edit / Save / Cancel         │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  main (flex-1)          CONTAINER_CLASS                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  PageRenderer (article, CONTENT_WIDTH_CLASS)                 │ │
│  │  → see content layouts below                                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  footer (optional)      full width                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Footer component: CONTAINER_CLASS, © year, Admin, Home     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## PageRenderer content (inside main)

```
┌─────────────────────────────────────────────────────────────────┐
│  ModulePosition "top"                                            │
├─────────────────────────────────────────────────────────────────┤
│  h1  page.title                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Template rows: single | two-col | three-col | rockettheme       │
│  (only positions present on the template; empty modules collapse)│
├─────────────────────────────────────────────────────────────────┤
│  ModulePosition "bottom"                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Single column

```
┌─────────────────────────────────────────────────────────────────┐
│  ContentCard (amber left border, white bg)                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ComponentSlot region="main"                                 │ │
│  │    → BlocksColumn → BlockGridLayout (react-grid-layout)      │ │
│  │    → blocks: heading, text, banner, list, table, …           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Two columns (responsive)

- **&lt; md (768px):** stacked; main on top, left sidebar below.
- **≥ md:** grid 1fr 2fr; left sidebar | main.

```
┌──────────────────────┬──────────────────────────────────────────┐
│  SidebarCard (left)  │  ContentCard (main)                       │
│  sky left border     │  amber left border                        │
│  ┌────────────────┐ │  ┌────────────────────────────────────┐  │
│  │ ModulePosition │ │  │  ComponentSlot region="main"        │  │
│  │ "sidebar-left" │ │  │  → BlocksColumn(blocks)             │  │
│  ├────────────────┤ │  └────────────────────────────────────┘  │
│  │ ComponentSlot  │ │                                          │
│  │ region="left"   │ │                                          │
│  │ → leftBlocks   │ │                                          │
│  └────────────────┘ │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

## Three columns (responsive)

- **&lt; lg (1024px):** stacked; main, then left, then right.
- **≥ lg:** grid 1fr 2fr 1fr; left | main | right.

```
┌────────────┬────────────────────────────┬────────────┐
│ SidebarCard│  ContentCard (main)        │ SidebarCard│
│ (left)     │  amber left border         │ (right)    │
│ sky border │  ┌──────────────────────┐  │ violet     │
│ ┌────────┐ │  │ ComponentSlot        │  │ border     │
│ │Module  │ │  │ region="main"        │  │ ┌────────┐ │
│ │"side-  │ │  │ → blocks             │  │ │Module  │ │
│ │bar-    │ │  └──────────────────────┘  │ │"side-  │ │
│ │left"   │ │                            │ │bar-    │ │
│ ├────────┤ │                            │ │right"  │ │
│ │Slot    │ │                            │ ├────────┤ │
│ │left    │ │                            │ │Slot    │ │
│ │leftBlks│ │                            │ │right   │ │
│ └────────┘ │                            │ │rightBlks│
└────────────┴────────────────────────────┴────────────┘
```

## Width and spacing (lib/layout/constants)

| Token                   | Role                                                                        |
| ----------------------- | --------------------------------------------------------------------------- |
| `CONTENT_WIDTH_CLASS`   | max-width breakpoints: sm → 2xl (same for header, main, footer content)     |
| `CONTENT_PADDING_CLASS` | px-4 sm:px-6 lg:px-8                                                        |
| `CONTAINER_CLASS`       | CONTENT_WIDTH_CLASS + mx-auto + CONTENT_PADDING_CLASS                       |
| `LAYOUT_GRID.twoCol`    | grid; 1 col → 2 col at md                                                   |
| `LAYOUT_GRID.threeCol`  | grid; 1 col → 3 col at lg                                                   |
| `LAYOUT_ORDER`          | main first on mobile; sidebars below; at md/lg reorder to left, main, right |

## Template-driven layouts (RocketTheme-style)

Layouts are defined in **`src/lib/cms/layout-templates.ts`**. Each template has a list of **rows**; each row has a grid class and **position names**. Positions `main`, `left`, `right` get page content; all others are **module positions** (placeholders for future modules).

Available templates:

| id          | Name                        | Positions                                                                                              |
| ----------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| single      | Single column               | main                                                                                                   |
| two-col     | Two columns                 | left, main                                                                                             |
| three-col   | Three columns               | left, main, right                                                                                      |
| rockettheme | RocketTheme-style (complex) | utility-a/b/c, header, navigation, showcase-a/b/c/d, **main** (one column), bottom-a/b, footer-a/b/c/d |

Inspired by [RocketTheme](https://rockettheme.com) Joomla templates (Gantry-style). Each row in the rockettheme template has a distinct CSS class (e.g. `rockettheme-utility`, `rockettheme-header`, `rockettheme-showcase`, `rockettheme-footer`) so sections look like a real template: utility bar (dark), header (light), navigation bar, showcase boxes, mainbody, bottom band, footer columns. Module positions show placeholder labels when empty (e.g. "Utility A", "Showcase B"). To add a new layout: add a template with `rows: [{ gridClassName, positions, orderClassNames? }]`.

### Empty sections collapse (layout adapts)

In **view mode**, positions with no blocks are omitted and the row grid reflows:

1. Empty **module** cells (`utility-*`, `showcase-*`, …) are not rendered.
2. If an entire row has no visible positions, the **row is omitted** (no empty chrome/padding).
3. Empty **left** / **right** sidebars are omitted; two-col / three-col shrink to the remaining columns (`getRowGridClassName`).
4. Empty **main** still renders (page content area / empty state).

In **edit mode**, empty positions stay available so authors can add blocks.

Helpers: `isPositionVisible` in `PageRenderer`, `getRowGridClassName` in `layout-templates.ts`.

### Optional blocks (layout-scoped)

Blocks are **optional per layout**. Only positions that exist on the **current** template are rendered:

| Stored field | Used when layout includes… | Notes |
| ------------ | -------------------------- | ----- |
| `blocks` | `main` | Always for single / two-col / three-col / rockettheme mainbody |
| `leftBlocks` | `left` | Optional; ignored on `single` and `rockettheme` |
| `rightBlocks` | `right` | Optional; ignored on `single`, `two-col`, and `rockettheme` |
| `positionBlocks[id]` | that module id (e.g. `showcase-a`) | Optional; empty module cells collapse (row grid adjusts) |

Helpers live in **`src/lib/cms/page-blocks.ts`**: `getBlocksForPosition`, `layoutHasPosition`, `pageHasBlocksForLayout`, `shouldShowInNav`.

**Demo content:** Home ships as `layout: "rockettheme"` with filled `positionBlocks` (utility, header, navigation, showcase-a–d, bottom, footer). `leftBlocks` / `rightBlocks` may still be stored so switching to two-col / three-col keeps sidebar content without requiring it for RocketTheme.

### Optional Blog in navigation

The **Blog** page is optional in the site header:

- Listed in nav only when it has at least one block in a position that exists for **its** layout (`pageHasBlocksForLayout`).
- If Blog has no blocks (or only blocks for positions not in its layout), it stays out of nav but remains reachable by URL / admin page switcher.
- Other pages (About, Contact) always appear in nav when present.

Seed / demo: `content/pages.json` → re-run `npx prisma db seed` after editing so the DB picks up RocketTheme content.

## Block grid layout (react-grid-layout)

Each block is wrapped in a [React Grid Layout](https://react-grid-layout.github.io/react-grid-layout/) grid. In **edit mode** blocks are **draggable** and **resizable**; position and size are stored on each block as `gridItem: { x, y, w, h }` and persist with the page. In **view mode** the same layout is rendered without drag/resize handles.

- **Grid:** 12 columns, configurable row height (default 80px), vertical compaction.
- **Block type:** `ContentBlock` has optional `gridItem?: BlockGridItem` (x, y, w, h, minW, minH, maxW, maxH).
- **Component:** `BlocksColumn` → `BlockGridLayout` (uses `WidthProvider` + `ReactGridLayout` from `react-grid-layout/legacy`).
- **Empty state:** When a position has no blocks, view mode shows "No content in this area."; edit mode shows only "Add block (…)".
- **Edit hint:** When there are blocks and editable, a short line "Drag to move · Resize from the corner handle" is shown above the grid.

**Possible next steps (if something still feels unaccomplished):**

- Responsive breakpoints (different layout per screen size).
- Numeric inputs for w/h in the block toolbar (in addition to drag/resize).
- Per-block min/max size UI.
- Undo/redo for layout changes.

## Component hierarchy (simplified)

```
EditableSitePage
  PageShell(header=…, footer=<Footer />)
    header: nav + edit/save/cancel
    main:
      PageRenderer(page, editable, callbacks)
        ModulePosition("top")
        LayoutSelector (if editable)
        h1 (page.title)
        for each template.rows:
          div(row.gridClassName) → for each position: ContentCard/SidebarCard/ModulePosition
        ModulePosition("bottom")
    footer: Footer (CONTAINER_CLASS, links)
```

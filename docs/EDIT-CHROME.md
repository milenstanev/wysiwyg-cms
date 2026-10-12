# Edit chrome best practices

Shared styling and behavior for edit-mode popovers, menus, and portalled panels.

## Why

Hover menus used to mix `.edit-menu-item` (accent hover) with long Tailwind stacks (muted hover). Portaled submenus also sat in a gap with no hit-area bridge, so the parent popover could close while moving the pointer into the submenu.

## Building blocks

| Piece | Use for |
|-------|---------|
| `EditPopover` | Chip + absolute menu (block “⋯”, empty sections) |
| `EditMenuItem` | Every row inside a menu or portaled list |
| `EditPortalPanel` | Fixed floating panel (Add block types, settings, layout picker) |
| `EditAddTrigger` | Dashed “+ Add …” control |
| `.edit-chip` | Round overlay triggers |
| `.editor-bar-button` | Controls in the fixed editor bar |

Source: [`src/components/edit-chrome/`](../src/components/edit-chrome/), styles in [`src/app/globals.css`](../src/app/globals.css).

## Anatomy

```
EditPopover (.edit-popover)          ← absolute; zero layout shift
├── chip (.edit-chip)                ← hover / focus opens menu
├── menu (.edit-popover-menu)        ← ::before bridge to chip
│   └── EditMenuItem rows
└── EditPortalPanel (optional)       ← portaled; data-open pins parent
    └── ::before bridge to anchor
```

## Hover contract

1. **CSS opens the menu** — `:hover`, `:focus-within`, or `[data-open]` on `.edit-popover`.
2. **Pin for portals** — while a nested panel is open, pass `pinned` so `data-open` keeps the menu visible when the pointer is outside the popover host.
3. **Bridges** — `.edit-popover-menu::before` and `.edit-portal-panel::before` cover the gap (`EDIT_PORTAL_GAP` = 8px / `--space-2`).
4. **Escape** — `useEditPopover` sets `data-dismissed` and calls `onDismiss` to close nested panels first; click/focus on the chip clears dismiss.

## Accessibility

- Hover/focus menus: `useEditPopover` (WCAG 1.4.13 Escape, `aria-expanded`).
- Portalled disclosures: `useDropdownA11y` (focus into panel, Escape / Tab-out / outside click).
- Always portal via `portalRoot()` inside `<main>`, never `document.body`.

## Do not

- New Tailwind hover stacks for menu rows or portal shells
- Different hover colors for in-menu vs portaled options (both use `.edit-menu-item`)
- Put edit chrome in normal document flow

Cursor agents: see [`.cursor/rules/edit-chrome.mdc`](../.cursor/rules/edit-chrome.mdc) and the web-design skill.

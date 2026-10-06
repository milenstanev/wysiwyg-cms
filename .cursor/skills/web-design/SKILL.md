---
name: web-design
description: Creates polished, accessible, responsive web interfaces with coherent visual hierarchy and theme-aware styling. Use when designing, restyling, or visually reviewing pages and components.
---

# Web Design

## Workflow

1. Inspect the existing design system, components, and responsive behavior.
2. Preserve product behavior while improving hierarchy, spacing, typography, color, and interaction states.
3. Reuse existing tokens and components before introducing new abstractions.
4. Check light and dark themes where available.
5. Verify desktop and mobile layouts visually.
6. Meet WCAG 2.2 AA everywhere — structure, keyboard/focus, names, contrast, reflow, reduced motion (see `.cursor/rules/accessibility.mdc`; gate: `npm run test:a11y`).

## Spacing (required)

Always use the project **8pt spacing scale** from `globals.css`. Do not invent one-off rem/px gaps.

| Token | Size | Use for |
|-------|------|---------|
| `--space-1` | 4px | Hairline offsets, icon gaps |
| `--space-2` | 8px | Tight related controls |
| `--space-3` | 12px | Compact header/tool padding |
| `--space-4` | 16px | Default inner padding, block gutters |
| `--space-5` | 24px | Card padding, section rhythm |
| `--space-6` | 32px | Title→content, page chrome |
| `--space-7` | 48px | Major section / header separation |
| `--space-8` | 64px | Footer / page-level breathing room |
| `--space-9` | 96px | Rare hero-only separation |

Layout aliases (prefer these in templates):
- `--layout-gap-sm/md/lg/xl` — column/row gaps
- `--page-vertical-padding`, `--page-header-gap`, `--page-title-gap`
- `--section-gap`, `--block-gap`, `--card-padding`, `--footer-gap`

### Spacing rules

1. **One scale only** — every gap/padding/margin maps to a token above.
2. **Proximity** — related items use smaller steps (2–4); unrelated sections use larger (5–7).
3. **Consistent rhythm** — same role ⇒ same token (all cards use `--card-padding`).
4. **No stacked inflation** — avoid large outer padding + large empty fixed heights inside.
5. **Title hierarchy** — space under a page title (`--page-title-gap`) must feel ≥ space above it to the header.
6. **Grid / RGL caution** — with fine row heights, vertical `margin` multiplies per unit (`h + margin*(h-1)`). Prefer small unit `h` + 16px gutter, never large `h` with non-zero marginY.
7. **Responsive** — keep the same token steps; only change layout structure at breakpoints, not random gap jumps (gap-4 → gap-14).

## Tokens over hardcoded values (required)

If a token exists, use it — do not hardcode the same spacing, color, or radius.

- Spacing → `var(--space-*)` / layout aliases (`p-[var(--space-4)]`, `gap-[var(--layout-gap-md)]`)
- Color → `var(--foreground)`, `var(--surface)`, `var(--border)`, `var(--muted)`, `var(--accent)`, `var(--on-accent)`, …
- Hardcoded values allowed only in token definitions, or when no token fits (keep rare)
- JS layout numbers that must match tokens (e.g. grid gutter `16`) should equal `--space-4` and stay documented

## Theme color harmony (required)

Palettes must be harmonious and accessible (see `.cursor/rules/theme-color-harmony.mdc`).

- One accent family per theme; sidebar accents stay related (analogous / complement)
- WCAG AA for text pairs; use `--on-accent` on accent fills
- Optional `--title-gradient` / `--header-gradient` for expressive themes (Atelier, Harbor, Nord, Ink)
- Do not override `.page-title` color with Tailwind `text-[…]` when gradients use `background-clip: text`
- Each theme sets `--theme-font-display` + `--theme-font-sans` (loaded in `layout.tsx`); no Inter/Roboto/Arial for themed surfaces

## No fixed height (required)

Do not put a fixed `height` on wrappers around variable content.

- View **and** edit: natural stack (`height: auto`); content defines size
- Never combine fixed height + `overflow: hidden` on content cards (clips / overlaps)
- OK: `min-height` for empty states, `aspect-video` for media, 1px rules, icon boxes

## Always verify edit mode (required)

View and edit are different paths. After layout/spacing/height changes, check **edit mode** too (`?edit=1`), and keep tests that assert edit mode (no clip, no overlap) — not view-only.
## CSS selectors (required)

Keep selectors as simple as possible.

1. Prefer a single class: `.content-block`, `.block-body`, `.page-title`.
2. Do **not** style via `data-testid` — test IDs are for tests, not CSS.
3. Do **not** nest ancestors unless required to win specificity or scope an override.
4. When overriding an existing rule, extend the simple base with one specific qualifier only if needed (e.g. `.block-body` → `.layout-sidebar-left .block-body`), never long chains.
5. Avoid tag + attribute + descendant stacks like `.block-grid-layout [data-testid="…"] .block-body`.

Read `reference.md` for the full token list and `examples.md` for before/after spacing patterns.

## Supporting files

- Read `reference.md` for project-specific design references when it contains guidance.
- Read `examples.md` for approved examples when it contains examples.
- Use utilities from `scripts/` only when they are documented and relevant.

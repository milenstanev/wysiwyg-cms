# Design system references

## Spacing scale (8pt)

Defined on `:root` in `src/app/globals.css`:

```
--space-1: 0.25rem;  /*  4px */
--space-2: 0.5rem;   /*  8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-7: 3rem;     /* 48px */
--space-8: 4rem;     /* 64px */
--space-9: 6rem;     /* 96px */
```

### Semantic aliases

| Token | Default | Role |
|-------|---------|------|
| `--layout-gap-sm` | space-4 | Compact column gaps |
| `--layout-gap-md` | space-5 | Default multi-col gap |
| `--layout-gap-lg` | space-6 | Wide multi-col gap |
| `--page-vertical-padding` | space-5 | Shell top/bottom |
| `--page-header-gap` | space-6 (editorial: space-7) | Header → title |
| `--page-title-gap` | space-6 (editorial: space-7) | Title → content (total) |
| `--section-gap` | space-6 | PageRenderer section stack; space above a heading that opens a group |
| `--block-gap` | space-5 | Between content blocks |
| `--heading-gap` | space-3 | Heading → the block it introduces |
| `--card-padding` | space-5 | Region cards (main, sidebars) |
| `--footer-gap` | space-7 | Main → footer |
| `--measure` | 68ch | Max line length for block paragraphs |

### Proximity ladder

Related things sit closer than unrelated things:
heading → its content (12) < block → block (24) < before a heading / section (32) ≤ title → content (32–48).

- Blocks are **flat** inside their region card — no border / padding / shadow per block. Banner and showcase keep their own box, so containers never nest more than two deep.
- Every gap comes from **one** source. When two sources meet (flex gap + margin), the margin is `calc(target - gap)` so the total equals the token.

### Where applied

- `PageShell` — page vertical padding + header gap. `.site-shell` uses `overflow: clip` (`hidden` would make it a scroll container and break the sticky header).
- `PageRenderer` / `.page-content` — `gap: var(--section-gap)`
- `.page-title` — `margin-bottom: calc(var(--page-title-gap) - var(--section-gap))`
- `layout-templates` + `LAYOUT_GRID` — CSS vars `--layout-gap-md` / `--layout-gap-lg`
- `BlockGridLayout` — content-sized stack; `--block-gap` between blocks; `.block-unit-after-heading` / `.block-unit-heading` for heading proximity
- `.block-body p` — `max-width: var(--measure)`
- `BannerBlock` / `ShowcaseBlock` — padding via `--space-*`

### Tests

- Unit: `src/lib/layout/spacing-tokens.test.ts` — scale + aliases + LAYOUT_GRID use tokens
- E2E: `e2e/spacing-scale.spec.ts` — resolved px steps, chrome rhythm, block/card padding, inter-block gap ≈ 16px

## Color tokens

Theme-switched via `html[data-theme]`:

| Token | Role |
|-------|------|
| `--background` / `--foreground` | Page + primary text (≥ 4.5:1) |
| `--surface` / `--muted` | Cards + secondary text |
| `--border` | Chrome separation |
| `--accent` / `--on-accent` | Primary actions + label on accent |
| `--content-accent` | Content card edge / title rule (same family or intentional complement) |
| `--sidebar-*-accent` | Region accents (analogous to brand) |
| `--title-gradient` / `--header-gradient` | Opt-in; used by Atelier, Harbor, Nord, Ink |
| `--theme-font-sans` / `--theme-font-display` | Body + title/brand fonts (per theme) |

### Theme fonts

| Theme | Display | Body |
|-------|---------|------|
| editorial | Literata | Source Sans 3 |
| pebble | DM Sans | DM Sans |
| atelier | Fraunces | Source Sans 3 |
| harbor | Source Serif 4 | Outfit |
| nord | IBM Plex Serif | IBM Plex Sans |
| ink | Cormorant Garamond | Karla |
| gallery | Forum | Outfit |

Loaded in `app/layout.tsx` via `next/font/google`; applied on `[data-theme]`. Avoid Inter/Roboto/Arial for themed UI.

**Harmony:** one dominant hue family; do not mix unrelated primaries in one theme (see `.cursor/rules/theme-color-harmony.mdc`).

**Gradients:** Atelier / Harbor / Nord / Ink apply `--title-gradient` to `.page-title` and `.site-brand`, and `--header-gradient` to `.site-header`. Editorial / Pebble / Gallery stay flat.

## Accessibility

- Text contrast must meet WCAG AA against `--surface` / `--background`.
- Every interactive control needs a visible keyboard focus state.
- Prefer CSS variables so themes keep contrast when switching.
- Button labels on accent use `--on-accent`, not hardcoded white.

## Tokens vs hardcoded

Use tokens for product UI spacing/color/radius. Hardcoded values belong in token definitions (`:root` / `[data-theme]`) or rare one-offs / numeric library APIs (e.g. RGL gutter `16` = `--space-4`).

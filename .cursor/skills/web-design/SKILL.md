---
name: web-design
description: >-
  Creates polished, accessible, responsive web interfaces with coherent visual
  hierarchy and theme-aware styling. Use when designing, restyling, or visually
  reviewing pages and components.
---

# Web Design

## Workflow

1. Inspect the existing design system, components, and responsive behavior.
2. Preserve product behavior while improving hierarchy, spacing, typography, color, and interaction states.
3. Reuse existing tokens and components before introducing new abstractions.
4. Check light and dark themes where available (all six themes in the switcher).
5. Verify desktop and mobile layouts visually; check **edit mode** too (`?edit=1`).
6. Meet WCAG 2.2 AA — gate: `npm run test:a11y` (see enforcement rules below).

## Enforcement (project rules — do not duplicate)

Follow these always-applied / scoped rules; this skill does not restate them:

| Concern | Rule |
|---------|------|
| Tokens over hardcodes | [`.cursor/rules/design-tokens.mdc`](../../rules/design-tokens.mdc) |
| Theme palette harmony | [`.cursor/rules/theme-color-harmony.mdc`](../../rules/theme-color-harmony.mdc) |
| No fixed height on content | [`.cursor/rules/no-fixed-height.mdc`](../../rules/no-fixed-height.mdc) |
| Verify edit mode | [`.cursor/rules/test-edit-mode.mdc`](../../rules/test-edit-mode.mdc) |
| Simple CSS selectors | [`.cursor/rules/simple-css-selectors.mdc`](../../rules/simple-css-selectors.mdc) |
| WCAG 2.2 AA | [`.cursor/rules/accessibility.mdc`](../../rules/accessibility.mdc) |

## Spacing (quick map)

Use the **8pt scale** from `src/app/globals.css`. Prefer layout aliases in templates (`--layout-gap-*`, `--page-*-gap`, `--card-padding`, `--section-gap`, …).

| Token | Size | Typical use |
|-------|------|-------------|
| `--space-1` … `--space-4` | 4–16px | Chrome, control padding, block gutters |
| `--space-5` … `--space-7` | 24–48px | Cards, section rhythm, header separation |
| `--space-8` … `--space-9` | 64–96px | Footer / rare hero |

Full token list, proximity ladder, and grid caveats: [`reference.md`](reference.md).  
Before/after spacing patterns: [`examples.md`](examples.md).

## Contrast gate

Do not invent a second contrast script. Run the existing gate:

```bash
npm run test:a11y
```

Theme token pairs: [`src/lib/theme-contrast.test.ts`](../../../src/lib/theme-contrast.test.ts).  
See also [`scripts/README.md`](scripts/README.md).

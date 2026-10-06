# Spacing examples

## Page chrome

Before: Header `mb` 5rem, title `mb` 4px — huge void above the title, content jammed under it.
After: `--page-header-gap` (32–48px) above title, `--page-title-gap` (24–32px) below — balanced hierarchy.

## Content cards

Before: `--card-padding: clamp(1.5rem, 4vw, 3rem)` plus nested block cards with fixed ~236px empty height.
After: `--card-padding: var(--space-5)` (24px); blocks use type-sized grid heights (~69–188px) with 16px gutters.

## Multi-column gaps

Before: `gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 2xl:gap-14` (inconsistent jumps).
After: `gap-[var(--layout-gap-md)] md:gap-[var(--layout-gap-lg)]` (24px → 32px).

## Block stack

Before: React Grid Layout with `ROW_HEIGHT=1`, `margin=[4,4]`, `h=48` → visual height `48 + 4*47 = 236px` empty cards.
After: `margin=[16,16]`, compact unit heights (`heading: 5` ≈ 69px) so gutters and content size stay on the 8pt scale.

## CSS selectors

Before: `.block-grid-layout [data-testid="content-block"] .block-body`
After: `.block-body` (and `.content-block` for the card). Override only when needed: `.layout-sidebar-left .block-body`.

## Tokens vs hardcoded

Before: `gap-4`, `py-8`, `padding: 1rem 1.25rem`, `mb-3`
After: `gap-[var(--space-4)]`, `py-[var(--space-6)]`, `padding: var(--space-4) var(--space-5)`, `mb-[var(--space-3)]`

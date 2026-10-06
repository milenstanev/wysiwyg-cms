# What we did

Record of the work on layout, editing, spacing, and accessibility. The site is a Next.js app; page content lives in Postgres and is edited in place.

## Themes get their own type

Each of the six themes (Editorial, Pebble, Atelier, Harbor, Nord, Ink) sets a display font and a body font. They are loaded in the root layout and applied through `--theme-font-display` and `--theme-font-sans`. Palettes stay in the theme blocks in `src/app/globals.css`.

## Edit mode does not move the page

View and edit render the same boxes. Edit controls sit on top of the content, never in the flow, so toggling edit mode does not shift a box by even 1px.

- Each block has a small "⋯" chip. Hover or keyboard focus opens a menu with settings, move, add, and remove.
- Empty sections stay hidden. A "+ Section" chip adds the first block to one of them.
- Save, Cancel, layout, and page switch live in a fixed bar at the bottom.
- The "Edit this page" button stays in the header while editing, but invisible, so the header keeps its size.

Checked with geometry tests (0px) on Home, About, and Contact, all six themes, and phone, tablet, and desktop widths, plus a pixel comparison of the main content once the overlay is hidden.

## Starting pages live in the database

The first load inserts any missing starter pages. They are the initial state, the same idea as React's initial state: later edits in the database are kept.

| Page    | Layout                         |
| ------- | ------------------------------ |
| Home    | RocketTheme                    |
| About   | Two columns                    |
| Blog    | One column                     |
| Contact | Three columns, with a right sidebar |

`npm run db:reset-content` puts the pages back to that starter set. `npm run db:seed` only inserts pages that are missing.

## Spacing follows proximity

Related things sit closer than unrelated things. Every gap is one token from the 8px scale (4, 8, 12, 16, 24, 32, 48, 64, 96).

| Relationship                         | Size        |
| ------------------------------------ | ----------- |
| A heading to the block it introduces | 12px        |
| One block to the next                | 24px        |
| Before a heading, and between sections | 32px      |
| Page title to the content            | 32px (48px on Editorial) |
| Header to the title                  | 32px (48px on Editorial) |

Blocks are flat text inside the region card (main, sidebar, or module cell). They no longer have their own border, padding, and shadow, so cards are not nested three deep. Banner and showcase keep their own box. Paragraphs stop at 68 characters per line.

## Accessibility is required (WCAG 2.2 AA)

The rule is `.cursor/rules/accessibility.mdc`. It applies to every page, edit mode, `/admin`, the 404 page, and every theme. Run the gate with:

```bash
npm run test:a11y
```

That runs a contrast check on the theme colours, then a browser suite (`e2e/accessibility.spec.ts`, axe-core).

What the suite covers:

- Automated scan of every site page in view and edit, all six themes, `/admin`, the 404 page, and each edit menu while it is open.
- Keyboard: the first Tab is "Skip to content"; every stop shows a focus ring that nothing covers; Escape closes menus; dropdowns move focus in and return it.
- One `h1` (the page title), one header, one main, one footer.
- No sideways scroll at 320px, text-spacing overrides, and reduced motion.

Problems that scan found, and the fixes:

- **Dark Home rows.** Utility, nav, and footer text was about 1.3:1 on the dark fill. Those rows now remap the text colours.
- **Save buttons.** They were faded with opacity, which dropped the label below 4.5:1. They are solid, and status text uses a ✓ or ⚠ as well as colour.
- **Atelier and Nord accents.** Both failed as button text. Each was darkened inside its own colour family.
- **Form edges.** Input and select borders were about 1.2:1. They use `--control-border` (3:1).
- **Headings.** A heading block could be a second `h1`. Content headings are h2–h4; an old stored level of 1 renders as h2.
- **Landmarks.** Footers were nested, and admin settings plus dropdowns sat outside any landmark. There is one footer, and menus render inside `<main>`.
- **Keyboard.** No skip link, no visible focus on editable text, and menus that could not be closed with Escape. Two hooks cover that: `useEditPopover` for the hover chips, `useDropdownA11y` for dropdowns.

## How it was checked

| Check | Result |
| ----- | ------ |
| `npm run test` | 200 unit tests passed, repeated |
| `npm run test:a11y` | 6 contrast tests + 29 browser tests passed |
| Read-only Playwright (spacing, zero-shift, overlap, pages, buttons, accessibility) | 82 passed, twice |

The Playwright specs that click Save and write to the database were not run as a full set. Two unit tests used to edit the real Contact and Home pages while other tests ran; they now use their own temporary pages and delete them afterwards.

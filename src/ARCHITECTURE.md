# Frontend architecture

**Design and architecture are deliberate and production-ready:** clear layers, single source of truth for layout and domain, contract-first APIs, and full unit + E2E coverage.

## Layers

- **`app/`** — Next.js routes and server data loading. Minimal logic; pass data to client components.
- **`components/`** — UI only. No direct API calls or business rules. Receives data and callbacks via props.
- **`hooks/`** — Client state and side effects (e.g. `usePageEditor` for page state and persistence).
- **`lib/cms/`** — Domain types, block defaults, and region/component mapping. Single source of truth for content model.
- **`lib/layout/`** — Layout constants (content width, grid classes, padding). Use these so header, main, and footer stay aligned.

## Data flow

- **Read**: `app/page.tsx` / `app/[slug]/page.tsx` load page via `getPageBySlug` (from `lib/cms/store-db`) and pass to `EditableSitePage`.
- **Edit**: `EditableSitePage` uses `usePageEditor(initialPage)`, which owns page state and exposes `callbacks` for `PageRenderer`. Save goes to `PUT /api/content/[slug]`.
- **Admin**: Same `PageRenderer` and block semantics; admin page owns fetch-by-slug and uses `createBlock` from `lib/cms/block-defaults` for new blocks.

See **`docs/LAYOUT-DIAGRAM.md`** for ASCII layout diagrams (PageShell, single / two-col / three-col, width constants).

## Key files

| Purpose                         | Location                          |
| ------------------------------- | --------------------------------- |
| Page content model              | `lib/cms/types.ts`                |
| New block defaults + ID         | `lib/cms/block-defaults.ts`       |
| Page renderer contract          | `lib/cms/page-editor.types.ts`    |
| Layout width/padding/grid       | `lib/layout/constants.ts`         |
| Page state + save               | `hooks/usePageEditor.ts`          |
| Page shell (header/main/footer) | `components/layout/PageShell.tsx` |

## Adding a new block type

1. Add the type to `BlockType` and `BLOCK_TYPES` in `lib/cms/types.ts`.
2. Add defaults in `getDefaultBlockContent` in `lib/cms/block-defaults.ts`.
3. Add a case in `ContentBlock` component and register in `lib/cms/components.tsx` if you introduce a new block renderer.
4. Add the option in `AddBlockButton` (and any block picker) so users can insert it.

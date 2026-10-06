# CMS Experiment

A decoupled CMS frontend built with Next.js, featuring a WYSIWYG-style admin panel. Content can be stored in Postgres (Prisma) or MongoDB (Node.js API server).

## Design & architecture

**The design and architecture are production-grade and ready to deploy.**

- **Clean layering** — App (routes) → components (UI) → hooks (state) → lib (domain & layout). No circular dependencies; single source of truth for types, layout constants, and block defaults.
- **Contract-first** — Shared types (`lib/cms/page-editor.types.ts`, `lib/cms/types.ts`) and layout constants (`lib/layout/constants.ts`) so header, main, and footer stay aligned and the renderer has a stable API.
- **Separation of concerns** — Page state and persistence live in `usePageEditor`; UI only receives data and callbacks. Same `PageRenderer` and block semantics for both site and admin.
- **Testability** — Unit tests (Vitest) for lib, hooks, and components; E2E (Playwright) for critical flows. See `src/ARCHITECTURE.md` for the full picture.

## Features

- **Public frontend** – Renders content from the CMS layer
- **Admin with visual editing** – Edit content inline and see live preview
- **API** – Next.js Route Handlers (`/api/content`) or standalone Node.js + MongoDB server
- **Docker** – Postgres, MongoDB, Node API, and Next.js via Docker Compose
- **Unit tests** – Vitest + React Testing Library
- **E2E tests** – Playwright

## Getting Started

### Option A: Local (Next.js + Postgres)

```bash
npm install
cp .env.example .env   # edit DATABASE_URL if your Postgres differs
docker run --name cms-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cms -p 5432:5432 -d postgres:17-alpine
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### Option B: Full Docker dev environment (recommended)

```bash
npm run dev:docker
```

Starts MongoDB, Node API, and Next.js with hot reload. One command.

- **Web**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Node API**: http://localhost:4000/api/content

```bash
npm run dev:docker:down     # Stop
npm run dev:docker:logs     # View logs
npm run dev:docker:seed     # Seed DB (after first run)
```

### Option C: Docker production

```bash
docker compose up -d
```

## Scripts

| Command                   | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `npm run dev`             | Start dev server                                     |
| `npm run build`           | Production build                                     |
| `npm run start`           | Run production server                                |
| `npm run test`            | Run unit tests (Vitest)                              |
| `npm run test:e2e`        | Run E2E tests (Playwright)                           |
| `npm run test:watch`      | Unit tests in watch mode                             |
| `npm run db:seed`         | Seed database from content/pages.json                |
| `npm run dev:docker`      | Full dev stack (MongoDB + API + Web) with hot reload |
| `npm run dev:docker:down` | Stop dev stack                                       |
| `npm run dev:docker:logs` | Tail logs                                            |
| `npm run dev:docker:seed` | Seed DB in running dev container                     |

## Testing

- **Unit (Vitest):** 86 tests across `lib/` (block-defaults, components, store-db, layout constants), `hooks/usePageEditor`, API routes (`GET/PUT /api/content`), and components (PageRenderer, BlocksColumn, ContentBlock, AddBlockButton, layout, not-found). Run: `npm run test`.
- **E2E (Playwright):** Home (edit/save, cancel, layout switch, add/remove block, nav) and Admin (page switch, edit/save, layout, add block, footer links). Run: `npm run test:e2e` (starts dev server automatically).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Public home
│   ├── [slug]/page.tsx   # Dynamic pages
│   ├── admin/            # Admin area
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── not-found.tsx     # 404 page
│   └── api/content/      # Content API (Next.js Route Handlers)
├── components/
│   ├── AddBlockButton.tsx
│   ├── ContentBlock.tsx
│   ├── EditableSitePage.tsx
│   ├── PageRenderer.tsx
│   └── layout/
│       ├── Container.tsx
│       └── Footer.tsx
├── lib/
│   ├── db.ts             # Prisma client (Postgres)
│   └── cms/
│       ├── types.ts
│       ├── store-db.ts   # DB-backed content store
│       └── store.ts      # Legacy file-based store
└── test/setup.ts
server/                  # Node.js + MongoDB API (can be git submodule)
├── src/
│   ├── config/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   ├── controllers/
│   ├── routes/
│   └── server.ts
├── Dockerfile
└── package.json
content/pages.json
e2e/
├── home.spec.ts
└── admin.spec.ts
```

## Deploy checklist

Before deploying, run:

```bash
npm run test          # Unit tests (Vitest)
npm run build         # Production build
npm run test:e2e      # E2E (optional; needs dev server or deployed URL)
```

For production: set `DATABASE_URL` (Postgres) and `ADMIN_PASSWORD` in the environment. `npm run build` applies migrations itself; seed a fresh database with:

```bash
npm run db:seed
```

Docker production: `docker compose up -d` (see Option C above).

Vercel: see [docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md).

## Content Model

- **Page**: id, slug, title, blocks, updatedAt
- **Block**: id, type (heading | text | image | banner | list | table | showcase), content

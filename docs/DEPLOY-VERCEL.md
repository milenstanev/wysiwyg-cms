# Deploying to Vercel from GitHub

**Short answer: yes.** The app runs on Vercel once persistence moves off SQLite. Everything else
(Next.js 16 App Router, route handlers, `force-dynamic` pages) is natively supported.

Phases 1 and 2 are **already applied in this repo**; they are documented here so the reasoning is
recoverable. Phases 3 onward are the operator steps.

## Why SQLite could not stay

`src/lib/db.ts` used to talk to a local SQLite file through `better-sqlite3`:

```ts
const url = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url });
```

Vercel runs each request in a serverless function with a **read-only, ephemeral filesystem**. The
public pages would render (the file is bundled read-only), but every save through
`PUT /api/content/[slug]` would either fail or be silently discarded on the next cold start.

A second issue: `/admin` had no authentication, so on a public URL anyone could edit the site.

---

## Phase 1 — Prisma on Postgres (done)

Prisma 7 removed the Rust query engine, so a driver adapter is required.

1. **Dependencies** — `@prisma/adapter-pg` and `pg` replace `@prisma/adapter-better-sqlite3` and
   `better-sqlite3`. Pin the adapter to the same version as `@prisma/client` (7.4.2); npm
   otherwise resolves a newer adapter than the client, which is unsupported.

2. **[prisma/schema.prisma](../prisma/schema.prisma)** — provider only. Prisma 7 rejects
   `url = env("DATABASE_URL")` inside the schema; the connection string is read from
   [prisma.config.ts](../prisma.config.ts), which is already wired to `process.env.DATABASE_URL`.

   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

3. **[src/lib/db.ts](../src/lib/db.ts)** — `PrismaPg` adapter, with the client cached on
   `globalThis` outside production so dev hot reloads do not open a new pool each time.
   `DATABASE_URL` is now required; the `file:...dev.db` fallback is gone.

4. **Migrations** — the old migrations were SQLite DDL (`DATETIME`, inline `PRIMARY KEY`) and
   cannot apply to Postgres, so they were replaced by a single Postgres baseline in
   `prisma/migrations/20261006120000_init/`. It was generated without a live database using:

   ```bash
   npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script
   ```

   The `Page` model itself needed no changes — all block fields are already JSON-encoded `String`.

5. **Build script** — Vercel caches `node_modules`, so the Prisma client must be generated
   explicitly, and migrations run before the build:

   ```json
   "build": "prisma migrate deploy && prisma generate && next build"
   ```

   [Dockerfile](../Dockerfile) deliberately runs `npx next build` instead, because no database is
   reachable at image build time; it applies migrations from its `CMD`.

### Local development

Both compose files now ship a `postgres:17-alpine` service, so `npm run dev:docker` works
unchanged. For plain `npm run dev`, run Postgres yourself and point `.env` at it:

```bash
docker run --name cms-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cms -p 5432:5432 -d postgres:17-alpine
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cms"
```

Then `npx prisma migrate deploy && npm run db:seed`.

---

## Phase 2 — Protect `/admin` (done)

[src/proxy.ts](../src/proxy.ts) holds a shared-password gate. Next 16 deprecated the
`middleware.ts` convention in favour of `proxy.ts`, which always runs on the Node.js runtime —
so `node:crypto` is available for constant-time comparison.

Behaviour:

- `ADMIN_PASSWORD` unset means **the gate is off**. That keeps local dev, unit tests, and the
  Playwright suite working without credentials.
- `/admin/*` requires HTTP Basic auth and returns a `WWW-Authenticate` challenge otherwise.
- `/api/content/*` reads stay public (the site needs them); writes require auth. Leaving writes
  open would make the admin gate cosmetic, since `PUT /api/content/[slug]` is the only thing
  standing between a visitor and the content.
- A successful Basic auth sets an httpOnly `cms_admin` cookie holding a SHA-256 token derived
  from the password. This is what lets the inline editor on public pages save: browsers do not
  resend Basic credentials to `/api/content` after authenticating under `/admin`.

If a visitor edits a public page without signing in, the save returns 401 and the editor shows
"Not signed in — open /admin first".

Covered by [src/proxy.test.ts](../src/proxy.test.ts).

---

## Phase 3 — Push to GitHub

The repo currently has **no remote** and is on branch `experiment`.

```bash
# Create the repo on github.com (or: gh repo create cms-experiment --private --source=. --push)
git remote add origin https://github.com/YOUR_USER/cms-experiment.git
git add -A
git commit -m "Deploy prep: Postgres adapter, admin auth"
git push -u origin experiment
```

Notes:

- `.gitignore` already excludes `.env*` and `*.db`, so no secrets or the local SQLite file are
  pushed. All environment values go into the Vercel dashboard.
- `server/` (Node + MongoDB API) is tracked but unused by the Next.js app and is not deployed by
  Vercel. Leave it, or split it out per [SUBMODULE.md](../SUBMODULE.md). If it ever becomes a real
  submodule, Vercel needs access to that repo too.

---

## Phase 4 — Create the database and import into Vercel

1. In the Vercel dashboard: **Add New → Project → Import** the GitHub repo. Framework preset is
   auto-detected as Next.js; root directory `./`; leave build settings at defaults (the
   `package.json` build script handles Prisma).
2. **Storage → Create Database → Neon (Postgres)** from the Vercel Marketplace, and connect it to
   the project. This injects `DATABASE_URL` automatically for all environments.
3. Add the remaining environment variable under **Settings → Environment Variables**:
   - `ADMIN_PASSWORD` — any strong value (Production + Preview).
4. Set the production branch to `experiment` under **Settings → Git**, or merge to `main` first.
5. Deploy. `prisma migrate deploy` in the build step creates the `Page` table on first run.

---

## Phase 5 — Seed production content

The schema is created by migrations, but the database starts empty, so every page would 404.
Seed once from your machine against the production URL:

```bash
# Copy DATABASE_URL from the Vercel/Neon dashboard
DATABASE_URL="postgresql://..." npx prisma db seed
```

`prisma/seed.ts` reads `content/pages.json` and upserts each page, so it is safe to re-run.

---

## Phase 6 — Verify

Before pushing:

```bash
npm run test          # Vitest
npm run build         # catches Prisma client / type errors
```

After deploy, on the live URL:

- `/`, `/about`, `/blog`, `/contact` render seeded content.
- `/admin` prompts for the password and rejects a wrong one.
- Editing and saving a block persists after a hard refresh **and** after a few minutes idle
  (this is the real proof the ephemeral-filesystem problem is gone).
- `GET /api/content` returns the page list as JSON.

Optionally point Playwright at the deployment:

```bash
PLAYWRIGHT_TEST_BASE_URL="https://your-app.vercel.app" npm run test:e2e
```

---

## Summary of changes made

- [prisma/schema.prisma](../prisma/schema.prisma) — `provider = "postgresql"`
- [src/lib/db.ts](../src/lib/db.ts) — `PrismaPg` adapter, cached client
- `prisma/migrations/` — regenerated as a Postgres baseline
- [package.json](../package.json) — Postgres deps, build runs `prisma migrate deploy && prisma generate`
- [src/proxy.ts](../src/proxy.ts) — new, gates `/admin` and content writes
- [src/hooks/usePageEditor.ts](../src/hooks/usePageEditor.ts) — surfaces 401 as a sign-in hint
- [.env.example](../.env.example) — Postgres connection string and `ADMIN_PASSWORD`
- `docker-compose.yml`, `docker-compose.dev.yml`, `Dockerfile` — Postgres service instead of a
  SQLite volume

Unused on Vercel but harmless: `Dockerfile*`, `docker-compose*.yml`, `server/`, and the legacy
file-based `src/lib/cms/store.ts` (not imported anywhere; it writes to `content/pages.json` and
would fail on a read-only filesystem if it ever were).

# Verification checklist

Run this when you wake up (or before deploy) to confirm nothing broke.

## One command

```bash
npm run verify
```

Runs **unit tests** then **production build**. If both pass, the project is in a good state.

## Full checklist (optional)

| Step | Command | What it does |
|------|---------|--------------|
| 1 | `npm run test` | 110 unit tests (Vitest) |
| 2 | `npm run build` | Next.js production build |
| 3 | `npm run test:e2e` | E2E tests (Playwright; needs dev server or deploy) |

## Expected results

- **test**: `Test Files 21 passed (21)`, `Tests 110 passed (110)`
- **build**: `Compiled successfully`, routes listed
- **test:e2e**: All specs green (run when app is reachable)

I can’t run hour-by-hour overnight from here; run `npm run verify` once in the morning to confirm everything still passes.

# web-design scripts

No standalone scripts live here. Contrast and a11y are enforced by the project test gate.

## Contrast + accessibility

Theme token pairs (WCAG AA) are checked in [`src/lib/theme-contrast.test.ts`](../../../../src/lib/theme-contrast.test.ts).  
Rendered pages use axe in `e2e/accessibility.spec.ts`.

```bash
npm run test:a11y
```

Do not add a duplicate `check-contrast.ts` in this folder — keep one source of truth with the Vitest suite.

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { THEMES } from "./theme";

/**
 * WCAG AA contrast for every real token pair in every theme, read straight from globals.css.
 * Fast guard for palette edits; e2e/accessibility.spec.ts checks the rendered pages with axe.
 */

const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf-8");

function themeTokens(theme: string): Record<string, string> {
  const out: Record<string, string> = {};
  const block = new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([^}]*)\\}`, "g");
  for (const [, body] of css.matchAll(block)) {
    for (const [, key, value] of body.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6})\b/gi)) out[key] = value;
  }
  return out;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** [text, background, minimum] — every pairing the UI actually renders */
const PAIRS: [string, string, number][] = [
  ["--foreground", "--background", 4.5],
  ["--foreground", "--surface", 4.5],
  ["--muted", "--surface", 4.5],
  ["--muted", "--background", 4.5],
  ["--on-accent", "--accent", 4.5],
  ["--accent", "--background", 4.5],
  ["--accent", "--surface", 4.5],
];

describe("theme contrast (WCAG 2.2 AA)", () => {
  for (const theme of THEMES.map((t) => t.id)) {
    it(`${theme}: every text/background token pair is ≥ 4.5:1`, () => {
      const tokens = themeTokens(theme);
      const failures = PAIRS.filter(([fg, bg]) => tokens[fg] && tokens[bg])
        .map(([fg, bg, min]) => ({ pair: `${fg} on ${bg}`, ratio: contrast(tokens[fg], tokens[bg]), min }))
        .filter((r) => r.ratio < r.min)
        .map((r) => `${r.pair} = ${r.ratio.toFixed(2)}:1 (needs ${r.min}:1)`);
      expect(Object.keys(tokens).length, `${theme} defines hex tokens`).toBeGreaterThan(5);
      expect(failures).toEqual([]);
    });
  }
});

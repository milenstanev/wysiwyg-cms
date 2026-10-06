import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { LAYOUT_GRID, CONTENT_PADDING_CLASS } from "./constants";

/**
 * Guards the 8pt spacing research: tokens stay on the scale, layout helpers use them.
 */
describe("spacing tokens (8pt research)", () => {
  const globals = readFileSync(
    path.join(process.cwd(), "src/app/globals.css"),
    "utf-8"
  );

  it("defines the full 8pt space-1…9 scale in rem", () => {
    expect(globals).toMatch(/--space-1:\s*0\.25rem/);
    expect(globals).toMatch(/--space-2:\s*0\.5rem/);
    expect(globals).toMatch(/--space-3:\s*0\.75rem/);
    expect(globals).toMatch(/--space-4:\s*1rem/);
    expect(globals).toMatch(/--space-5:\s*1\.5rem/);
    expect(globals).toMatch(/--space-6:\s*2rem/);
    expect(globals).toMatch(/--space-7:\s*3rem/);
    expect(globals).toMatch(/--space-8:\s*4rem/);
    expect(globals).toMatch(/--space-9:\s*6rem/);
  });

  it("maps layout aliases onto space-* tokens", () => {
    expect(globals).toMatch(/--layout-gap-sm:\s*var\(--space-4\)/);
    expect(globals).toMatch(/--layout-gap-md:\s*var\(--space-5\)/);
    expect(globals).toMatch(/--layout-gap-lg:\s*var\(--space-6\)/);
    expect(globals).toMatch(/--page-header-gap:\s*var\(--space-6\)/);
    expect(globals).toMatch(/--page-title-gap:\s*var\(--space-6\)/);
    expect(globals).toMatch(/--section-gap:\s*var\(--space-6\)/);
    expect(globals).toMatch(/--block-gap:\s*var\(--space-5\)/);
    expect(globals).toMatch(/--heading-gap:\s*var\(--space-3\)/);
    expect(globals).toMatch(/--card-padding:\s*var\(--space-5\)/);
    expect(globals).toMatch(/--footer-gap:\s*var\(--space-7\)/);
  });

  it("LAYOUT_GRID uses layout-gap tokens (not arbitrary Tailwind gap jumps)", () => {
    expect(LAYOUT_GRID.twoCol).toContain("gap-[var(--layout-gap-md)]");
    expect(LAYOUT_GRID.twoCol).toContain("md:gap-[var(--layout-gap-lg)]");
    expect(LAYOUT_GRID.threeCol).toContain("gap-[var(--layout-gap-md)]");
    expect(LAYOUT_GRID.threeCol).toContain("lg:gap-[var(--layout-gap-lg)]");
    expect(LAYOUT_GRID.twoCol).not.toMatch(/gap-\d+/);
  });

  it("CONTENT_PADDING_CLASS uses space tokens", () => {
    expect(CONTENT_PADDING_CLASS).toContain("px-[var(--space-4)]");
    expect(CONTENT_PADDING_CLASS).toContain("sm:px-[var(--space-5)]");
    expect(CONTENT_PADDING_CLASS).toContain("lg:px-[var(--space-6)]");
  });

  it("block-stack uses the block gap; heading proximity uses heading/section gaps", () => {
    expect(globals).toMatch(/\.block-stack\s*\{[^}]*gap:\s*var\(--block-gap\)/s);
    expect(globals).toMatch(
      /\.block-unit-after-heading\s*\{[^}]*margin-top:\s*calc\(var\(--heading-gap\) - var\(--block-gap\)\)/s
    );
    expect(globals).toMatch(
      /\.block-unit-heading\s*\{[^}]*margin-top:\s*calc\(var\(--section-gap\) - var\(--block-gap\)\)/s
    );
  });

  it("blocks are flat (no per-block padding) and prose is capped at a readable measure", () => {
    expect(globals).not.toMatch(/\.block-body\s*\{[^}]*padding:/s);
    expect(globals).toMatch(/--measure:\s*68ch/);
    expect(globals).toMatch(/\.block-body p\s*\{[^}]*max-width:\s*var\(--measure\)/s);
  });
});

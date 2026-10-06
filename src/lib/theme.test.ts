import { describe, it, expect } from "vitest";
import { isThemeId, THEMES, getThemeFonts } from "./theme";

describe("theme", () => {
  it("recognizes known theme ids", () => {
    expect(THEMES.map((t) => t.id)).toEqual([
      "editorial",
      "pebble",
      "atelier",
      "harbor",
      "nord",
      "ink",
      "gallery",
    ]);
    expect(isThemeId("atelier")).toBe(true);
    expect(isThemeId("nope")).toBe(false);
  });

  it("defines a distinct display/body font pairing for every theme", () => {
    const pairs = THEMES.map((t) => `${t.fonts.display}|${t.fonts.sans}`);
    expect(new Set(pairs).size).toBe(THEMES.length);
    for (const theme of THEMES) {
      expect(theme.fonts.display.length).toBeGreaterThan(0);
      expect(theme.fonts.sans.length).toBeGreaterThan(0);
      expect(getThemeFonts(theme.id)).toEqual(theme.fonts);
    }
  });
});

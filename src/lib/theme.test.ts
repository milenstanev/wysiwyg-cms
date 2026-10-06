import { describe, it, expect } from "vitest";
import { isThemeId, THEMES } from "./theme";

describe("theme", () => {
  it("recognizes known theme ids", () => {
    expect(THEMES.map((t) => t.id)).toEqual([
      "editorial",
      "pebble",
      "atelier",
      "harbor",
      "nord",
      "ink",
    ]);
    expect(isThemeId("atelier")).toBe(true);
    expect(isThemeId("nope")).toBe(false);
  });
});

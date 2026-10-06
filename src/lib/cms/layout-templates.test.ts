import { describe, it, expect } from "vitest";
import {
  getLayoutTemplate,
  getAllLayoutTemplates,
  getTemplateIds,
  isContentPosition,
  getRowGridClassName,
  CONTENT_POSITIONS,
} from "./layout-templates";

describe("layout-templates", () => {
  it("returns template by id", () => {
    expect(getLayoutTemplate("single")).toBeDefined();
    expect(getLayoutTemplate("single")?.name).toBe("Single column");
    expect(getLayoutTemplate("rockettheme")?.name).toMatch(/RocketTheme/);
  });

  it("returns undefined for unknown id", () => {
    expect(getLayoutTemplate("unknown")).toBeUndefined();
  });

  it("getAllLayoutTemplates returns all four templates", () => {
    const all = getAllLayoutTemplates();
    expect(all.length).toBe(4);
    expect(getTemplateIds()).toEqual(["single", "two-col", "three-col", "rockettheme"]);
  });

  it("rockettheme template has multiple rows and Gantry-style positions", () => {
    const t = getLayoutTemplate("rockettheme")!;
    expect(t.rows.length).toBe(7);
    const positions = t.rows.flatMap((r) => r.positions);
    expect(positions).toContain("utility-a");
    expect(positions).toContain("header");
    expect(positions).toContain("navigation");
    expect(positions).toContain("showcase-a");
    expect(positions).toContain("main");
    expect(positions).toContain("left");
    expect(positions).toContain("right");
    expect(positions).toContain("footer-a");
  });

  it("isContentPosition identifies main, left, right", () => {
    expect(isContentPosition("main")).toBe(true);
    expect(isContentPosition("left")).toBe(true);
    expect(isContentPosition("right")).toBe(true);
    expect(isContentPosition("header")).toBe(false);
    expect(isContentPosition("utility-a")).toBe(false);
  });

  it("CONTENT_POSITIONS lists main, left, right", () => {
    expect(CONTENT_POSITIONS).toEqual(["main", "left", "right"]);
  });

  it("getRowGridClassName returns row class when all positions visible", () => {
    const row = {
      gridClassName: "grid grid-cols-1 sm:grid-cols-3 gap-2",
      positions: ["a", "b", "c"],
    };
    expect(getRowGridClassName(row, 3)).toBe("grid grid-cols-1 sm:grid-cols-3 gap-2");
  });

  it("getRowGridClassName adjusts columns when fewer positions visible", () => {
    const row = {
      gridClassName: "grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4",
      positions: ["a", "b", "c"],
    };
    expect(getRowGridClassName(row, 2)).toBe("grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4");
    expect(getRowGridClassName(row, 1)).toContain("grid-cols-1");
    expect(getRowGridClassName(row, 1)).not.toMatch(/sm:grid-cols/);
  });

  it("getRowGridClassName strips md: and lg: and grid-cols-[...] when one position visible", () => {
    const row = {
      gridClassName: "grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4",
      positions: ["left", "main"],
    };
    const out = getRowGridClassName(row, 1);
    expect(out).toContain("grid-cols-1");
    expect(out).not.toMatch(/md:grid-cols/);
    expect(out).toContain("gap-4");
  });
});

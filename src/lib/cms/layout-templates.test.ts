import { describe, it, expect } from "vitest";
import {
  getLayoutTemplate,
  getAllLayoutTemplates,
  getTemplateIds,
  isContentPosition,
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
});

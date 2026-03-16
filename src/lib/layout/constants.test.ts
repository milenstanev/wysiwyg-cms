import { describe, it, expect } from "vitest";
import {
  CONTENT_WIDTH_CLASS,
  CONTENT_PADDING_CLASS,
  CONTAINER_CLASS,
  LAYOUT_GRID,
  LAYOUT_ORDER,
} from "./constants";

describe("layout constants", () => {
  it("CONTENT_WIDTH_CLASS includes max-w breakpoints", () => {
    expect(CONTENT_WIDTH_CLASS).toContain("max-w-");
    expect(CONTENT_WIDTH_CLASS).toContain("w-full");
  });

  it("CONTENT_PADDING_CLASS includes padding", () => {
    expect(CONTENT_PADDING_CLASS).toMatch(/px-/);
  });

  it("CONTAINER_CLASS includes width and padding", () => {
    expect(CONTAINER_CLASS).toContain("mx-auto");
    expect(CONTAINER_CLASS).toContain(CONTENT_WIDTH_CLASS);
    expect(CONTAINER_CLASS).toContain(CONTENT_PADDING_CLASS);
  });

  it("LAYOUT_GRID has twoCol and threeCol", () => {
    expect(LAYOUT_GRID.twoCol).toContain("grid");
    expect(LAYOUT_GRID.threeCol).toContain("grid");
  });

  it("LAYOUT_ORDER has main, left, right", () => {
    expect(LAYOUT_ORDER.main).toContain("order-");
    expect(LAYOUT_ORDER.left).toContain("order-");
    expect(LAYOUT_ORDER.right).toContain("order-");
  });
});

import { describe, it, expect } from "vitest";
import { getComponentForRegion } from "./components";
import type { ComponentType } from "./types";

describe("getComponentForRegion", () => {
  it("returns mainComponent for main region when set", () => {
    const page = { mainComponent: "content" as ComponentType };
    expect(getComponentForRegion(page, "main")).toBe("content");
  });

  it("returns default content for main when mainComponent not set", () => {
    const page = {};
    expect(getComponentForRegion(page, "main")).toBe("content");
  });

  it("returns leftComponent for left region when set", () => {
    const page = { leftComponent: "content" as ComponentType };
    expect(getComponentForRegion(page, "left")).toBe("content");
  });

  it("returns default content for left when leftComponent not set", () => {
    const page = {};
    expect(getComponentForRegion(page, "left")).toBe("content");
  });

  it("returns rightComponent for right region when set", () => {
    const page = { rightComponent: "content" as ComponentType };
    expect(getComponentForRegion(page, "right")).toBe("content");
  });

  it("returns default content for right when rightComponent not set", () => {
    const page = {};
    expect(getComponentForRegion(page, "right")).toBe("content");
  });
});

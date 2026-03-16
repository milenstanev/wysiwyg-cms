import { describe, it, expect } from "vitest";
import {
  generateBlockId,
  getDefaultBlockContent,
  createBlock,
} from "./block-defaults";
import type { BlockType } from "./types";

const BLOCK_TYPES: BlockType[] = [
  "heading",
  "text",
  "image",
  "banner",
  "list",
  "table",
  "showcase",
];

describe("block-defaults", () => {
  describe("generateBlockId", () => {
    it("returns a string starting with block-", () => {
      expect(generateBlockId()).toMatch(/^block-/);
    });

    it("returns unique ids across calls", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 50; i++) ids.add(generateBlockId());
      expect(ids.size).toBe(50);
    });
  });

  describe("getDefaultBlockContent", () => {
    it("returns content for each block type", () => {
      expect(getDefaultBlockContent("heading")).toMatchObject({ content: "New heading" });
      expect(getDefaultBlockContent("text")).toMatchObject({ content: "New paragraph..." });
      expect(getDefaultBlockContent("image")).toMatchObject({ content: "" });
      expect(getDefaultBlockContent("banner")).toMatchObject({
        title: "Banner title",
        content: "Banner subtitle or description",
      });
      expect(getDefaultBlockContent("showcase")).toMatchObject({
        title: "Feature title",
        content: "Feature description...",
      });
      expect(getDefaultBlockContent("list")).toMatchObject({
        content: "",
        items: ["First item", "Second item", "Third item"],
      });
      expect(getDefaultBlockContent("table")).toMatchObject({
        content: "",
        rows: [
          ["Header 1", "Header 2"],
          ["Cell 1", "Cell 2"],
        ],
      });
    });
  });

  describe("createBlock", () => {
    it("returns a block with id, type, and defaults for each BlockType", () => {
      for (const type of BLOCK_TYPES) {
        const block = createBlock(type);
        expect(block.id).toMatch(/^block-/);
        expect(block.type).toBe(type);
        expect(typeof block.content).toBe("string");
        if (type === "list") expect(Array.isArray(block.items)).toBe(true);
        if (type === "table") expect(Array.isArray(block.rows)).toBe(true);
        if (type === "banner" || type === "showcase") expect(block.title).toBeDefined();
      }
    });

    it("applies overrides", () => {
      const block = createBlock("heading", { content: "Custom", id: "fixed-id" });
      expect(block.id).toBe("fixed-id");
      expect(block.content).toBe("Custom");
      expect(block.type).toBe("heading");
    });

    it("overrides id so block can have stable id", () => {
      const block = createBlock("text", { id: "my-stable-id" });
      expect(block.id).toBe("my-stable-id");
    });

    it("list type has items array from defaults", () => {
      const block = createBlock("list");
      expect(block.items).toBeDefined();
      expect(Array.isArray(block.items)).toBe(true);
      expect(block.items!.length).toBeGreaterThan(0);
    });

    it("empty string content in overrides is preserved", () => {
      const block = createBlock("heading", { content: "" });
      expect(block.content).toBe("");
    });
  });
});

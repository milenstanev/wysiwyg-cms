import { describe, it, expect } from "vitest";
import { normalizePage, parseBlocksJson, parsePositionBlocksJson } from "./normalize-page";
import type { ContentBlock, Page } from "./types";

describe("normalizePage", () => {
  const base = {
    id: "p1",
    slug: "test",
    title: "Test",
    updatedAt: new Date().toISOString(),
  };

  it("returns full page with blocks arrays when given minimal payload", () => {
    const result = normalizePage(base as Parameters<typeof normalizePage>[0]);
    expect(result.id).toBe("p1");
    expect(result.slug).toBe("test");
    expect(result.title).toBe("Test");
    expect(result.layout).toBe("single");
    expect(result.blocks).toEqual([]);
    expect(result.leftBlocks).toEqual([]);
    expect(result.rightBlocks).toEqual([]);
    expect(result.positionBlocks).toEqual({});
    expect(result.mainComponent).toBe("content");
    expect(result.leftComponent).toBe("content");
    expect(result.rightComponent).toBe("content");
  });

  it("ensures blocks is always an array", () => {
    expect(normalizePage({ ...base, blocks: null }).blocks).toEqual([]);
    expect(normalizePage({ ...base, blocks: undefined }).blocks).toEqual([]);
    expect(
      normalizePage({ ...base, blocks: "not-array" as unknown as ContentBlock[] }).blocks
    ).toEqual([]);
    const valid = [{ id: "b1", type: "text", content: "Hi" }];
    expect(normalizePage({ ...base, blocks: valid }).blocks).toEqual(valid);
  });

  it("ensures leftBlocks and rightBlocks are arrays", () => {
    const out = normalizePage({ ...base, leftBlocks: undefined, rightBlocks: null });
    expect(out.leftBlocks).toEqual([]);
    expect(out.rightBlocks).toEqual([]);
    const withSidebars = normalizePage({
      ...base,
      leftBlocks: [{ id: "l1", type: "text", content: "L" }],
      rightBlocks: [{ id: "r1", type: "text", content: "R" }],
    });
    expect(withSidebars.leftBlocks).toHaveLength(1);
    expect(withSidebars.rightBlocks).toHaveLength(1);
  });

  it("ensures positionBlocks is a record of arrays", () => {
    expect(normalizePage({ ...base, positionBlocks: undefined }).positionBlocks).toEqual({});
    expect(normalizePage({ ...base, positionBlocks: null }).positionBlocks).toEqual({});
    const withPos = normalizePage({
      ...base,
      positionBlocks: { "utility-a": [{ id: "u1", type: "text", content: "U" }] },
    });
    expect(withPos.positionBlocks["utility-a"]).toHaveLength(1);
  });

  it("filters invalid items from block arrays", () => {
    const result = normalizePage({
      ...base,
      blocks: [
        null,
        { id: "b1", type: "text", content: "Ok" },
        undefined,
        { type: "text", content: "no-id" },
      ] as unknown as ContentBlock[],
    });
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].id).toBe("b1");
  });

  it("filters blocks with unknown type", () => {
    const result = normalizePage({
      ...base,
      blocks: [
        { id: "b1", type: "text", content: "Valid" },
        { id: "b2", type: "script", content: "Invalid type" },
        { id: "b3", type: "heading", content: "Also valid" },
      ] as unknown as ContentBlock[],
    });
    expect(result.blocks).toHaveLength(2);
    expect(result.blocks.map((b) => b.id)).toEqual(["b1", "b3"]);
  });

  it("filters blocks with non-string id", () => {
    const result = normalizePage({
      ...base,
      blocks: [
        { id: "ok", type: "text", content: "Valid" },
        { id: 123, type: "text", content: "Number id" },
        { id: null, type: "heading", content: "Null id" },
      ] as unknown as ContentBlock[],
    });
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].id).toBe("ok");
  });

  it("defaults invalid layout to single", () => {
    expect(normalizePage({ ...base, layout: "invalid" as Page["layout"] }).layout).toBe("single");
    expect(normalizePage({ ...base, layout: "two-col" }).layout).toBe("two-col");
  });
});

describe("parseBlocksJson", () => {
  it("returns [] for null or empty string", () => {
    expect(parseBlocksJson(null)).toEqual([]);
    expect(parseBlocksJson(undefined)).toEqual([]);
    expect(parseBlocksJson("")).toEqual([]);
  });

  it("returns [] for invalid JSON", () => {
    expect(parseBlocksJson("not json")).toEqual([]);
    expect(parseBlocksJson("null")).toEqual([]);
  });

  it("returns [] when parsed value is not an array", () => {
    expect(parseBlocksJson("{}")).toEqual([]);
    expect(parseBlocksJson("1")).toEqual([]);
  });

  it("parses valid blocks array", () => {
    const blocks = [{ id: "b1", type: "text", content: "Hi" }];
    expect(parseBlocksJson(JSON.stringify(blocks))).toEqual(blocks);
  });
});

describe("parsePositionBlocksJson", () => {
  it("returns {} for null or empty string", () => {
    expect(parsePositionBlocksJson(null)).toEqual({});
    expect(parsePositionBlocksJson("")).toEqual({});
  });

  it("returns {} for invalid JSON", () => {
    expect(parsePositionBlocksJson("not json")).toEqual({});
  });

  it("returns safe object for valid position blocks", () => {
    const pos = { "utility-a": [{ id: "u1", type: "text", content: "U" }] };
    expect(parsePositionBlocksJson(JSON.stringify(pos))).toEqual(pos);
  });
});

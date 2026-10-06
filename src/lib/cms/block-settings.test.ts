import { describe, it, expect } from "vitest";
import {
  BLOCK_SETTINGS,
  getBlockSettings,
  getBlockSetting,
  getBlockSettingOrDefault,
} from "./block-settings";
import type { ContentBlock } from "./types";

describe("block-settings", () => {
  it("defines settings for table (complex)", () => {
    const defs = BLOCK_SETTINGS.table;
    expect(defs.length).toBeGreaterThan(0);
    expect(defs.map((d) => d.key)).toContain("headerRow");
    expect(defs.map((d) => d.key)).toContain("striped");
    expect(defs.map((d) => d.key)).toContain("bordered");
    expect(defs.map((d) => d.key)).toContain("caption");
  });

  it("defines settings for heading and list", () => {
    expect(BLOCK_SETTINGS.heading.some((d) => d.key === "level")).toBe(true);
    expect(BLOCK_SETTINGS.list.some((d) => d.key === "listStyle")).toBe(true);
  });

  it("getBlockSettings returns defaults when block has no settings", () => {
    const block: ContentBlock = { id: "1", type: "table", content: "", rows: [] };
    const s = getBlockSettings(block);
    expect(s.headerRow).toBe(true);
    expect(s.striped).toBe(false);
    expect(s.bordered).toBe(true);
  });

  it("getBlockSettings merges block.settings over defaults", () => {
    const block: ContentBlock = {
      id: "1",
      type: "table",
      content: "",
      rows: [],
      settings: { striped: true, caption: "My table" },
    };
    const s = getBlockSettings(block);
    expect(s.headerRow).toBe(true);
    expect(s.striped).toBe(true);
    expect(s.caption).toBe("My table");
  });

  it("getBlockSetting returns undefined for key not in schema", () => {
    const block: ContentBlock = { id: "1", type: "table", content: "", rows: [] };
    expect(getBlockSetting<string>(block, "unknownKey")).toBeUndefined();
  });

  it("getBlockSettingOrDefault returns fallback for key not in schema", () => {
    const block: ContentBlock = { id: "1", type: "table", content: "", rows: [] };
    expect(getBlockSettingOrDefault(block, "unknownKey", "Default")).toBe("Default");
  });

  it("getBlockSettingOrDefault returns value when present", () => {
    const block: ContentBlock = {
      id: "1",
      type: "table",
      content: "",
      rows: [],
      settings: { caption: "Custom" },
    };
    expect(getBlockSettingOrDefault(block, "caption", "Default")).toBe("Custom");
  });
});

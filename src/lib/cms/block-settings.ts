import type { BlockType, ContentBlock } from "./types";

export type SettingType = "boolean" | "text" | "select";

export interface BlockSettingDef {
  key: string;
  label: string;
  type: SettingType;
  /** For select: { value: label } */
  options?: Record<string, string>;
  default?: unknown;
  placeholder?: string;
}

/** Settings schema per block type. More complex blocks (e.g. table) have more options. */
export const BLOCK_SETTINGS: Record<BlockType, BlockSettingDef[]> = {
  table: [
    { key: "headerRow", label: "First row as header", type: "boolean", default: true },
    { key: "striped", label: "Striped rows", type: "boolean", default: false },
    { key: "bordered", label: "Bordered", type: "boolean", default: true },
    {
      key: "caption",
      label: "Table caption",
      type: "text",
      default: "",
      placeholder: "Optional caption",
    },
  ],
  heading: [
    {
      key: "level",
      label: "Heading level",
      type: "select",
      // The page title is the only h1; content headings start at h2
      default: "2",
      options: { "2": "H2", "3": "H3", "4": "H4" },
    },
  ],
  text: [],
  image: [
    { key: "alt", label: "Alt text", type: "text", default: "", placeholder: "Describe the image" },
  ],
  banner: [],
  list: [
    {
      key: "listStyle",
      label: "List style",
      type: "select",
      default: "bullet",
      options: { bullet: "Bullets", numbered: "Numbered" },
    },
  ],
  showcase: [],
};

export function getBlockSettings(block: ContentBlock): Record<string, unknown> {
  const defs = BLOCK_SETTINGS[block.type] ?? [];
  const out: Record<string, unknown> = { ...(block.settings ?? {}) };
  for (const d of defs) {
    if (out[d.key] === undefined && d.default !== undefined) {
      out[d.key] = d.default;
    }
  }
  return out;
}

export function getBlockSetting<T>(block: ContentBlock, key: string): T | undefined {
  const settings = getBlockSettings(block);
  return settings[key] as T | undefined;
}

export function getBlockSettingOrDefault<T>(block: ContentBlock, key: string, fallback: T): T {
  const v = getBlockSetting<T>(block, key);
  return v !== undefined ? v : fallback;
}

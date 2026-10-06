import type { BlockType, ContentBlock } from "./types";

export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Default content for a new block by type. Used by any UI that creates blocks (site editor, admin). */
export function getDefaultBlockContent(type: BlockType): Partial<ContentBlock> {
  switch (type) {
    case "banner":
      return { title: "Banner title", content: "Banner subtitle or description" };
    case "showcase":
      return { title: "Feature title", content: "Feature description..." };
    case "list":
      return { content: "", items: ["First item", "Second item", "Third item"] };
    case "table":
      return {
        content: "",
        rows: [
          ["Header 1", "Header 2"],
          ["Cell 1", "Cell 2"],
        ],
      };
    case "image":
      return { content: "" };
    case "heading":
      return { content: "New heading" };
    case "text":
    default:
      return { content: "New paragraph..." };
  }
}

/** Create a new block with defaults for the given type. */
export function createBlock(type: BlockType, overrides: Partial<ContentBlock> = {}): ContentBlock {
  const defaults = getDefaultBlockContent(type);
  return {
    id: generateBlockId(),
    type,
    content: (defaults.content as string) ?? "",
    ...defaults,
    ...overrides,
  };
}

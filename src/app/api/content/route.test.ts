import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/content", () => {
  it("returns list of pages with id, slug, title", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
    for (const p of data) {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("slug");
      expect(p).toHaveProperty("title");
      expect(p).not.toHaveProperty("blocks");
      expect(p).not.toHaveProperty("leftBlocks");
      expect(p).not.toHaveProperty("rightBlocks");
    }
  });
});

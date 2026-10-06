import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { GET, PUT } from "./route";
import { deletePage, updatePage } from "@/lib/cms/store-db";
import type { Page } from "@/lib/cms/types";

describe("GET /api/content/[slug]", () => {
  it("returns full page for known slug", async () => {
    const res = await GET(new Request("http://localhost/api/content/home"), {
      params: Promise.resolve({ slug: "home" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.slug).toBe("home");
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("title");
    expect(data).toHaveProperty("blocks");
    expect(data).toHaveProperty("updatedAt");
    expect(Array.isArray(data.blocks)).toBe(true);
  });

  it("returns 404 for unknown slug", async () => {
    const res = await GET(new Request("http://localhost/api/content/unknown-xyz"), {
      params: Promise.resolve({ slug: "unknown-xyz" }),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toHaveProperty("error");
  });

  it("returns 400 for empty slug", async () => {
    const res = await GET(new Request("http://localhost/api/content/"), {
      params: Promise.resolve({ slug: "" }),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Slug is required");
  });
});

describe("PUT /api/content/[slug]", () => {
  // Own throwaway page: test files run in parallel, so never mutate real content pages
  const tempSlug = `api-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const temp: Page = {
    id: tempSlug,
    slug: tempSlug,
    title: "API Test",
    layout: "single",
    blocks: [{ id: "t1", type: "text", content: "Original" }],
    updatedAt: new Date().toISOString(),
  };
  const put = (body: unknown, slug = tempSlug) =>
    PUT(
      new Request(`http://localhost/api/content/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ slug }) }
    );

  beforeAll(async () => {
    await updatePage(temp);
  });

  afterAll(async () => {
    await deletePage(tempSlug);
  });

  it("updates page and returns it", async () => {
    const putRes = await put({
      ...temp,
      title: "API Test (Updated)",
      blocks: [...temp.blocks, { id: "api-test-block", type: "text", content: "API test" }],
    });
    expect(putRes.status).toBe(200);
    const result = await putRes.json();
    expect(result.title).toBe("API Test (Updated)");
    expect(result.blocks.some((b: { id: string }) => b.id === "api-test-block")).toBe(true);
  });

  it("returns 400 when body is invalid JSON", async () => {
    const res = await PUT(
      new Request("http://localhost/api/content/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "not valid json {",
      }),
      { params: Promise.resolve({ slug: "home" }) }
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("returns 400 when id is missing or empty", async () => {
    const res = await PUT(
      new Request("http://localhost/api/content/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "",
          slug: "home",
          title: "Home",
          blocks: [],
          updatedAt: new Date().toISOString(),
        }),
      }),
      { params: Promise.resolve({ slug: "home" }) }
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty("error");
  });

  it("returns 400 when body slug differs from URL and id is not that page (no rename)", async () => {
    // A matching id would be a valid rename and mutate the real home page
    const res = await PUT(
      new Request("http://localhost/api/content/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "not-the-home-page",
          slug: "other",
          title: "Wrong",
          blocks: [],
          updatedAt: new Date().toISOString(),
        }),
      }),
      { params: Promise.resolve({ slug: "home" }) }
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty("error");
  });

  it("PUT accepts minimal body and returns normalized page", async () => {
    const res = await put({ id: tempSlug, slug: tempSlug, title: "API Normalized" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe("API Normalized");
    expect(Array.isArray(data.blocks)).toBe(true);
    expect(Array.isArray(data.leftBlocks)).toBe(true);
    expect(Array.isArray(data.rightBlocks)).toBe(true);
    expect(data.updatedAt).toBeDefined();
  });

  it("PUT accepts page with empty blocks array", async () => {
    const res = await put({ ...temp, blocks: [] });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.blocks).toEqual([]);
  });
});

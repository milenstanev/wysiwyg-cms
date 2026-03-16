import { describe, it, expect } from "vitest";
import { GET, PUT } from "./route";
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
});

describe("PUT /api/content/[slug]", () => {
  it("updates page and returns it", async () => {
    const existingRes = await GET(new Request("http://localhost/api/content/contact"), {
      params: Promise.resolve({ slug: "contact" }),
    });
    const existing: Page = await existingRes.json();
    const updated: Page = {
      ...existing,
      title: "Contact (API Test)",
      blocks: [...existing.blocks, { id: "api-test-block", type: "text", content: "API test" }],
    };

    const putRes = await PUT(
      new Request("http://localhost/api/content/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }),
      { params: Promise.resolve({ slug: "contact" }) }
    );
    expect(putRes.status).toBe(200);
    const result = await putRes.json();
    expect(result.title).toBe("Contact (API Test)");
    expect(result.blocks.some((b: { id: string }) => b.id === "api-test-block")).toBe(true);

    await PUT(
      new Request("http://localhost/api/content/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...existing, title: "Contact" }),
      }),
      { params: Promise.resolve({ slug: "contact" }) }
    );
  });

  it("returns 400 when slug in body does not match URL", async () => {
    const res = await PUT(
      new Request("http://localhost/api/content/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "home",
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

  it("PUT accepts page with empty blocks array", async () => {
    const existingRes = await GET(new Request("http://localhost/api/content/contact"), {
      params: Promise.resolve({ slug: "contact" }),
    });
    const existing: Page = await existingRes.json();
    const emptyBlocksPage: Page = {
      ...existing,
      blocks: [],
    };

    const res = await PUT(
      new Request("http://localhost/api/content/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emptyBlocksPage),
      }),
      { params: Promise.resolve({ slug: "contact" }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.blocks).toEqual([]);

    await PUT(
      new Request("http://localhost/api/content/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existing),
      }),
      { params: Promise.resolve({ slug: "contact" }) }
    );
  });
});

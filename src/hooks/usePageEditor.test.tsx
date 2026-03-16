import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePageEditor } from "./usePageEditor";
import type { Page } from "@/lib/cms/types";

const mockPage: Page = {
  id: "p1",
  slug: "test",
  title: "Test Page",
  layout: "single",
  blocks: [
    { id: "b1", type: "heading", content: "Hello" },
    { id: "b2", type: "text", content: "Body" },
  ],
  updatedAt: new Date().toISOString(),
};

describe("usePageEditor", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("window", {
    location: { search: "" },
  });
  });

  it("returns initial page and not editing", () => {
    const { result } = renderHook(() => usePageEditor(mockPage));
    expect(result.current.page).toEqual(mockPage);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.message).toBeNull();
  });

  it("callbacks update page state", () => {
    const { result } = renderHook(() => usePageEditor(mockPage));

    act(() => {
      result.current.setEditing(true);
    });
    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.callbacks.onTitleEdit?.("New Title");
    });
    expect(result.current.page.title).toBe("New Title");

    act(() => {
      result.current.callbacks.onBlockEdit?.("b1", "Updated heading");
    });
    expect(result.current.page.blocks[0].content).toBe("Updated heading");

    act(() => {
      result.current.callbacks.onLayoutChange?.("two-col");
    });
    expect(result.current.page.layout).toBe("two-col");
  });

  it("onAddBlock adds a new block to main", () => {
    const { result } = renderHook(() => usePageEditor(mockPage));
    act(() => result.current.setEditing(true));

    act(() => {
      result.current.callbacks.onAddBlock?.(null, "text", "main");
    });
    expect(result.current.page.blocks.length).toBe(3);
    expect(result.current.page.blocks[0].type).toBe("text");
  });

  it("onRemoveBlock removes block from main", () => {
    const { result } = renderHook(() => usePageEditor(mockPage));
    act(() => result.current.setEditing(true));

    act(() => {
      result.current.callbacks.onRemoveBlock?.("b1");
    });
    expect(result.current.page.blocks.length).toBe(1);
    expect(result.current.page.blocks[0].id).toBe("b2");
  });

  it("save calls PUT and sets message on success", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ...mockPage, title: "Saved" }), { status: 200 })
    );

    const { result } = renderHook(() => usePageEditor(mockPage));
    act(() => result.current.setEditing(true));

    await act(async () => {
      await result.current.actions.save();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/content/test",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(result.current.message).toBe("Saved!");
  });

  it("save sets error message on failure", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 500 }));

    const { result } = renderHook(() => usePageEditor(mockPage));
    act(() => result.current.setEditing(true));

    await act(async () => {
      await result.current.actions.save();
    });

    expect(result.current.message).toBe("Failed to save");
  });

  it("cancel clears editing", () => {
    const { result } = renderHook(() => usePageEditor(mockPage));
    act(() => result.current.setEditing(true));
    expect(result.current.isEditing).toBe(true);
    act(() => result.current.actions.cancel());
    expect(result.current.isEditing).toBe(false);
  });

  it("onBlockEdit updates block in left region (sidebar)", () => {
    const pageWithLeft: Page = {
      ...mockPage,
      layout: "two-col",
      leftBlocks: [{ id: "left1", type: "text", content: "Sidebar text" }],
    };
    const { result } = renderHook(() => usePageEditor(pageWithLeft));
    act(() => result.current.setEditing(true));

    act(() => {
      result.current.callbacks.onBlockEdit?.("left1", "Updated sidebar");
    });
    expect(result.current.page.leftBlocks).toHaveLength(1);
    expect(result.current.page.leftBlocks![0].content).toBe("Updated sidebar");
  });

  it("onAddBlock adds to empty left region", () => {
    const pageTwoCol: Page = {
      ...mockPage,
      layout: "two-col",
      leftBlocks: [],
    };
    const { result } = renderHook(() => usePageEditor(pageTwoCol));
    act(() => result.current.setEditing(true));

    act(() => {
      result.current.callbacks.onAddBlock?.(null, "heading", "left");
    });
    expect(result.current.page.leftBlocks).toHaveLength(1);
    expect(result.current.page.leftBlocks![0].type).toBe("heading");
  });

  it("onRemoveBlock removes from left region", () => {
    const pageWithLeft: Page = {
      ...mockPage,
      layout: "two-col",
      leftBlocks: [{ id: "left1", type: "text", content: "To remove" }],
    };
    const { result } = renderHook(() => usePageEditor(pageWithLeft));
    act(() => result.current.setEditing(true));

    act(() => {
      result.current.callbacks.onRemoveBlock?.("left1");
    });
    expect(result.current.page.leftBlocks).toHaveLength(0);
  });

  it("onMoveBlock up when first does nothing", () => {
    const { result } = renderHook(() => usePageEditor(mockPage));
    act(() => result.current.setEditing(true));
    const before = result.current.page.blocks.map((b) => b.id);

    act(() => {
      result.current.callbacks.onMoveBlock?.("b1", "up", "main");
    });
    expect(result.current.page.blocks.map((b) => b.id)).toEqual(before);
  });

  it("onMoveBlock down when last does nothing", () => {
    const { result } = renderHook(() => usePageEditor(mockPage));
    act(() => result.current.setEditing(true));
    const before = result.current.page.blocks.map((b) => b.id);

    act(() => {
      result.current.callbacks.onMoveBlock?.("b2", "down", "main");
    });
    expect(result.current.page.blocks.map((b) => b.id)).toEqual(before);
  });

  it("handles page with empty blocks", () => {
    const emptyPage: Page = {
      ...mockPage,
      blocks: [],
    };
    const { result } = renderHook(() => usePageEditor(emptyPage));
    act(() => result.current.setEditing(true));
    act(() => {
      result.current.callbacks.onAddBlock?.(null, "text", "main");
    });
    expect(result.current.page.blocks).toHaveLength(1);
  });

  it("save sets error message when fetch rejects", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => usePageEditor(mockPage));
    act(() => result.current.setEditing(true));

    await act(async () => {
      await result.current.actions.save();
    });

    expect(result.current.message).toBe("Failed to save");
  });
});

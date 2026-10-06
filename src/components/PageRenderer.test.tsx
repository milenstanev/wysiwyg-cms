import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { PageRenderer } from "./PageRenderer";
import type { Page } from "@/lib/cms/types";
import { TEST_ID, componentSlotTestId } from "@/lib/test-ids";

vi.mock("@/lib/cms/components", () => ({
  getComponentForRegion: () => "content",
  ComponentSlot: ({
    blocks,
    region,
  }: {
    blocks: { id: string; type: string; content: string }[];
    region: string;
  }) => (
    // Keep in sync with componentSlotTestId(region) in @/lib/test-ids
    <div data-testid={`slot-${region}`}>
      {blocks.map((b) => (
        <span key={b.id} data-block-id={b.id}>
          {b.content}
        </span>
      ))}
    </div>
  ),
}));

const singlePage: Page = {
  id: "1",
  slug: "home",
  title: "Home",
  layout: "single",
  blocks: [{ id: "b1", type: "heading", content: "Welcome" }],
  updatedAt: new Date().toISOString(),
};

const twoColPage: Page = {
  ...singlePage,
  layout: "two-col",
  leftBlocks: [{ id: "l1", type: "text", content: "Sidebar" }],
};

const threeColPage: Page = {
  ...singlePage,
  layout: "three-col",
  leftBlocks: [{ id: "l1", type: "text", content: "Left" }],
  rightBlocks: [{ id: "r1", type: "text", content: "Right" }],
};

describe("PageRenderer", () => {
  it("renders page title", () => {
    render(<PageRenderer page={singlePage} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Home");
  });

  it("renders single layout with main content", () => {
    render(<PageRenderer page={singlePage} />);
    const slot = screen.getByTestId(componentSlotTestId("main"));
    expect(within(slot).getByText("Welcome")).toBeInTheDocument();
  });

  it("renders two-col layout with left and main slots", () => {
    render(<PageRenderer page={twoColPage} />);
    expect(screen.getByTestId(componentSlotTestId("left"))).toBeInTheDocument();
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
    expect(within(screen.getByTestId(componentSlotTestId("left"))).getByText("Sidebar")).toBeInTheDocument();
  });

  it("renders three-col layout with left, main, right slots", () => {
    render(<PageRenderer page={threeColPage} />);
    expect(screen.getByTestId(componentSlotTestId("left"))).toBeInTheDocument();
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
    expect(screen.getByTestId(componentSlotTestId("right"))).toBeInTheDocument();
    expect(within(screen.getByTestId(componentSlotTestId("right"))).getByText("Right")).toBeInTheDocument();
  });

  it("does not render layout selector in content (it lives in header so content does not move)", () => {
    const onLayoutChange = vi.fn();
    render(<PageRenderer page={singlePage} editable onLayoutChange={onLayoutChange} />);
    expect(screen.queryByText("Layout:")).not.toBeInTheDocument();
  });

  it("renders rockettheme template; empty module rows collapse to main only", () => {
    const rocketPage: Page = { ...singlePage, layout: "rockettheme" };
    const { container } = render(<PageRenderer page={rocketPage} />);
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
    expect(container.querySelectorAll("[data-module-position]").length).toBe(0);
    expect(container.querySelectorAll("[data-template-row]").length).toBe(1);
  });

  it("renders rockettheme module positions when they have blocks", () => {
    const rocketPage: Page = {
      ...singlePage,
      layout: "rockettheme",
      positionBlocks: {
        "utility-a": [{ id: "u1", type: "text", content: "U" }],
        header: [{ id: "h1", type: "heading", content: "Header" }],
        "showcase-a": [{ id: "s1", type: "text", content: "S" }],
      },
    };
    const { container } = render(<PageRenderer page={rocketPage} />);
    expect(container.querySelectorAll("[data-module-position]").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll("[data-template-row]").length).toBeGreaterThan(1);
  });

  it("does not render empty Utility A (or other empty module positions) when not editable", () => {
    const rocketPage: Page = { ...singlePage, layout: "rockettheme", positionBlocks: {} };
    const { container } = render(<PageRenderer page={rocketPage} />);
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
    expect(container.querySelector('[data-module-position="utility-a"]')).not.toBeInTheDocument();
    expect(screen.queryByText("Utility A")).not.toBeInTheDocument();
    // Entire empty module rows (utility/header/nav/…) are omitted — only mainbody remains
    const rows = container.querySelectorAll("[data-template-row]");
    expect(rows.length).toBe(1);
    expect(rows[0]).toHaveAttribute("data-visible-count", "1");
  });

  it("collapses empty showcase cells and adapts the row grid", () => {
    const rocketPage: Page = {
      ...singlePage,
      layout: "rockettheme",
      positionBlocks: {
        "showcase-a": [{ id: "s1", type: "text", content: "Only A" }],
        "showcase-c": [{ id: "s3", type: "text", content: "Only C" }],
      },
    };
    const { container } = render(<PageRenderer page={rocketPage} />);
    expect(container.querySelector('[data-module-position="showcase-a"]')).toBeInTheDocument();
    expect(container.querySelector('[data-module-position="showcase-b"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-module-position="showcase-c"]')).toBeInTheDocument();
    expect(container.querySelector('[data-module-position="showcase-d"]')).not.toBeInTheDocument();
    const showcaseRow = [...container.querySelectorAll("[data-template-row]")].find(
      (el) => el.querySelector('[data-module-position="showcase-a"]')
    );
    expect(showcaseRow).toHaveAttribute("data-visible-count", "2");
    expect(showcaseRow?.className).toMatch(/sm:grid-cols-2/);
  });

  it("hides empty left/right sidebars in view mode and adapts two-col to one column", () => {
    const pageEmptyLeft: Page = {
      ...singlePage,
      layout: "two-col",
      leftBlocks: [],
    };
    const { container } = render(<PageRenderer page={pageEmptyLeft} />);
    expect(screen.queryByTestId(componentSlotTestId("left"))).not.toBeInTheDocument();
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
    const row = container.querySelector("[data-template-row]");
    expect(row).toHaveAttribute("data-visible-count", "1");
    expect(row?.className).toContain("grid-cols-1");
    expect(row?.className).not.toMatch(/md:grid-cols/);
  });

  it("edit mode keeps empty sidebars hidden (WYSIWYG) and offers them in the empty-sections menu", () => {
    const pageEmptyLeft: Page = {
      ...singlePage,
      layout: "two-col",
      leftBlocks: [],
    };
    const onAddBlock = vi.fn();
    render(<PageRenderer page={pageEmptyLeft} editable onAddBlock={onAddBlock} />);
    expect(screen.queryByTestId(componentSlotTestId("left"))).not.toBeInTheDocument();
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();

    const menu = screen.getByTestId(TEST_ID.emptySectionsMenu);
    fireEvent.click(within(menu).getByRole("button", { name: "Add block (left)" }));
    fireEvent.click(screen.getByRole("button", { name: /Heading/ }));
    expect(onAddBlock).toHaveBeenCalledWith(null, "heading", "left");
  });

  it("renders Utility A when it has blocks", () => {
    const rocketPage: Page = {
      ...singlePage,
      layout: "rockettheme",
      positionBlocks: {
        "utility-a": [{ id: "u1", type: "text", content: "Utility A content" }],
      },
    };
    const { container } = render(<PageRenderer page={rocketPage} />);
    expect(container.querySelector('[data-module-position="utility-a"]')).toBeInTheDocument();
    expect(screen.getByText("Utility A content")).toBeInTheDocument();
  });

  it("does not show layout selector when not editable", () => {
    render(<PageRenderer page={singlePage} />);
    expect(screen.queryByText("Layout:")).not.toBeInTheDocument();
  });

  it("defaults layout to single when not set", () => {
    const pageNoLayout = { ...singlePage, layout: undefined };
    render(<PageRenderer page={pageNoLayout} />);
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
  });

  it("renders single layout with empty blocks without crashing", () => {
    const emptyPage: Page = { ...singlePage, blocks: [] };
    render(<PageRenderer page={emptyPage} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Home");
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
  });

  it("two-col with empty leftBlocks hides left in view mode", () => {
    const pageEmptyLeft: Page = {
      ...singlePage,
      layout: "two-col",
      leftBlocks: [],
    };
    render(<PageRenderer page={pageEmptyLeft} />);
    expect(screen.queryByTestId(componentSlotTestId("left"))).not.toBeInTheDocument();
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
  });

  it("two-col with missing leftBlocks (undefined) hides left in view mode", () => {
    const pageNoLeft: Partial<Page> & Pick<Page, "id" | "slug" | "title" | "updatedAt"> = {
      ...singlePage,
      layout: "two-col",
      blocks: [],
      leftBlocks: undefined,
      rightBlocks: undefined,
    };
    render(<PageRenderer page={pageNoLeft as Page} />);
    expect(screen.queryByTestId(componentSlotTestId("left"))).not.toBeInTheDocument();
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
  });

  it("three-col with missing sidebars shows only main in view mode", () => {
    const pageNoSidebars: Partial<Page> & Pick<Page, "id" | "slug" | "title" | "updatedAt"> = {
      ...singlePage,
      layout: "three-col",
      blocks: [{ id: "m1", type: "text", content: "Main only" }],
      leftBlocks: undefined,
      rightBlocks: undefined,
    };
    const { container } = render(<PageRenderer page={pageNoSidebars as Page} />);
    expect(screen.queryByTestId(componentSlotTestId("left"))).not.toBeInTheDocument();
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
    expect(screen.queryByTestId(componentSlotTestId("right"))).not.toBeInTheDocument();
    expect(screen.getByText("Main only")).toBeInTheDocument();
    expect(container.querySelector("[data-template-row]")).toHaveAttribute(
      "data-visible-count",
      "1"
    );
  });

  it("renders when blocks is undefined (minimal page)", () => {
    const minimalPage = {
      id: "m1",
      slug: "min",
      title: "Minimal",
      updatedAt: new Date().toISOString(),
      blocks: undefined,
    };
    render(<PageRenderer page={minimalPage as Page} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Minimal");
    expect(screen.getByTestId(componentSlotTestId("main"))).toBeInTheDocument();
  });
});

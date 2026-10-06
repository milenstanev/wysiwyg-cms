import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { PageRenderer } from "./PageRenderer";
import type { Page } from "@/lib/cms/types";

vi.mock("@/lib/cms/components", () => ({
  getComponentForRegion: () => "content",
  ComponentSlot: ({
    blocks,
    region,
  }: {
    blocks: { id: string; type: string; content: string }[];
    region: string;
  }) => (
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
    const slot = screen.getByTestId("slot-main");
    expect(within(slot).getByText("Welcome")).toBeInTheDocument();
  });

  it("renders two-col layout with left and main slots", () => {
    render(<PageRenderer page={twoColPage} />);
    expect(screen.getByTestId("slot-left")).toBeInTheDocument();
    expect(screen.getByTestId("slot-main")).toBeInTheDocument();
    expect(within(screen.getByTestId("slot-left")).getByText("Sidebar")).toBeInTheDocument();
  });

  it("renders three-col layout with left, main, right slots", () => {
    render(<PageRenderer page={threeColPage} />);
    expect(screen.getByTestId("slot-left")).toBeInTheDocument();
    expect(screen.getByTestId("slot-main")).toBeInTheDocument();
    expect(screen.getByTestId("slot-right")).toBeInTheDocument();
    expect(within(screen.getByTestId("slot-right")).getByText("Right")).toBeInTheDocument();
  });

  it("does not render layout selector in content (it lives in header so content does not move)", () => {
    const onLayoutChange = vi.fn();
    render(<PageRenderer page={singlePage} editable onLayoutChange={onLayoutChange} />);
    expect(screen.queryByText("Layout:")).not.toBeInTheDocument();
  });

  it("renders rockettheme template with multiple rows and module positions", () => {
    const rocketPage: Page = { ...singlePage, layout: "rockettheme" };
    const { container } = render(<PageRenderer page={rocketPage} />);
    expect(screen.getByTestId("slot-main")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-module-position]").length).toBeGreaterThan(3);
    expect(container.querySelector("[data-template-row]")).toBeInTheDocument();
  });

  it("does not render empty Utility A (or other empty module positions) when not editable", () => {
    const rocketPage: Page = { ...singlePage, layout: "rockettheme", positionBlocks: {} };
    const { container } = render(<PageRenderer page={rocketPage} />);
    expect(screen.getByTestId("slot-main")).toBeInTheDocument();
    expect(container.querySelector('[data-module-position="utility-a"]')).not.toBeInTheDocument();
    expect(screen.queryByText("Utility A")).not.toBeInTheDocument();
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
    expect(screen.getByTestId("slot-main")).toBeInTheDocument();
  });

  it("renders single layout with empty blocks without crashing", () => {
    const emptyPage: Page = { ...singlePage, blocks: [] };
    render(<PageRenderer page={emptyPage} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Home");
    expect(screen.getByTestId("slot-main")).toBeInTheDocument();
  });

  it("renders two-col with empty leftBlocks", () => {
    const pageEmptyLeft: Page = {
      ...singlePage,
      layout: "two-col",
      leftBlocks: [],
    };
    render(<PageRenderer page={pageEmptyLeft} />);
    expect(screen.getByTestId("slot-left")).toBeInTheDocument();
    expect(screen.getByTestId("slot-main")).toBeInTheDocument();
  });

  it("renders two-col with missing leftBlocks (undefined) without crashing", () => {
    const pageNoLeft: Partial<Page> & Pick<Page, "id" | "slug" | "title" | "updatedAt"> = {
      ...singlePage,
      layout: "two-col",
      blocks: [],
      leftBlocks: undefined,
      rightBlocks: undefined,
    };
    render(<PageRenderer page={pageNoLeft as Page} />);
    expect(screen.getByTestId("slot-left")).toBeInTheDocument();
    expect(screen.getByTestId("slot-main")).toBeInTheDocument();
  });

  it("renders three-col with missing leftBlocks and rightBlocks without crashing", () => {
    const pageNoSidebars: Partial<Page> & Pick<Page, "id" | "slug" | "title" | "updatedAt"> = {
      ...singlePage,
      layout: "three-col",
      blocks: [{ id: "m1", type: "text", content: "Main only" }],
      leftBlocks: undefined,
      rightBlocks: undefined,
    };
    render(<PageRenderer page={pageNoSidebars as Page} />);
    expect(screen.getByTestId("slot-left")).toBeInTheDocument();
    expect(screen.getByTestId("slot-main")).toBeInTheDocument();
    expect(screen.getByTestId("slot-right")).toBeInTheDocument();
    expect(screen.getByText("Main only")).toBeInTheDocument();
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
    expect(screen.getByTestId("slot-main")).toBeInTheDocument();
  });
});

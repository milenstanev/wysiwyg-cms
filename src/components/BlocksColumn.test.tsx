import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { BlocksColumn } from "./BlocksColumn";
import type { ContentBlock } from "@/lib/cms/types";
import { TEST_ID, testIdSelector } from "@/lib/test-ids";

const blocks: ContentBlock[] = [
  { id: "1", type: "heading", content: "Title" },
  { id: "2", type: "text", content: "Paragraph" },
];

describe("BlocksColumn", () => {
  it("renders all blocks in view mode", () => {
    render(<BlocksColumn blocks={blocks} region="main" />);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
  });

  it("does not show Add block button when not editable", () => {
    render(<BlocksColumn blocks={blocks} region="main" />);
    expect(screen.queryByText(/Add block/)).not.toBeInTheDocument();
  });

  it("shows Add block button when editable and onAddBlock provided", () => {
    render(<BlocksColumn blocks={blocks} region="main" editable onAddBlock={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Add block (main)" })).toBeInTheDocument();
  });

  it("calls onRemoveBlock when remove button clicked", () => {
    const onRemoveBlock = vi.fn();
    render(
      <BlocksColumn
        blocks={blocks}
        region="main"
        editable
        onAddBlock={vi.fn()}
        onRemoveBlock={onRemoveBlock}
      />
    );
    const removeButtons = screen.getAllByRole("button", { name: "Remove block" });
    expect(removeButtons.length).toBeGreaterThan(0);
    fireEvent.click(removeButtons[0]);
    expect(onRemoveBlock).toHaveBeenCalledWith("1");
  });

  it("calls onMoveBlock when move up clicked", () => {
    const onMoveBlock = vi.fn();
    render(
      <BlocksColumn
        blocks={blocks}
        region="main"
        editable
        onAddBlock={vi.fn()}
        onMoveBlock={onMoveBlock}
      />
    );
    const moveUp = screen.getByRole("button", { name: "Move up" });
    fireEvent.click(moveUp);
    expect(onMoveBlock).toHaveBeenCalledWith("2", "up", "main");
  });

  it("calls onMoveBlock when move down clicked", () => {
    const onMoveBlock = vi.fn();
    render(
      <BlocksColumn
        blocks={blocks}
        region="main"
        editable
        onAddBlock={vi.fn()}
        onMoveBlock={onMoveBlock}
      />
    );
    const moveDown = screen.getByRole("button", { name: "Move down" });
    fireEvent.click(moveDown);
    expect(onMoveBlock).toHaveBeenCalledWith("1", "down", "main");
  });

  it("toolbar buttons are accessible by role and name (aria-label)", () => {
    render(
      <BlocksColumn
        blocks={blocks}
        region="main"
        editable
        onAddBlock={vi.fn()}
        onRemoveBlock={vi.fn()}
        onMoveBlock={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Move up" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move down" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Remove block" }).length).toBe(2);
  });

  it("renders with empty blocks and still shows Add block when editable", () => {
    render(<BlocksColumn blocks={[]} region="main" editable onAddBlock={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Add block (main)" })).toBeInTheDocument();
  });

  it("edit mode renders the same block box tree as view mode (chrome is extra, never wrapping)", () => {
    const { container: view } = render(<BlocksColumn blocks={blocks} region="main" />);
    const { container: edit } = render(
      <BlocksColumn
        blocks={blocks}
        region="main"
        editable
        onAddBlock={vi.fn()}
        onRemoveBlock={vi.fn()}
        onMoveBlock={vi.fn()}
        onBlockUpdate={vi.fn()}
      />
    );
    const chain = (root: HTMLElement) =>
      [...root.querySelectorAll(testIdSelector(TEST_ID.contentBlock))].map((card) => {
        const path: string[] = [];
        for (let el: Element | null = card; el && el !== root; el = el.parentElement) {
          path.push(el.className);
        }
        return path.join(" < ");
      });
    expect(chain(edit)).toEqual(chain(view));
  });

  it("block controls are one small chip whose popover holds every action", () => {
    render(
      <BlocksColumn
        blocks={blocks}
        region="main"
        editable
        onAddBlock={vi.fn()}
        onRemoveBlock={vi.fn()}
        onMoveBlock={vi.fn()}
        onBlockUpdate={vi.fn()}
      />
    );
    const triggers = screen.getAllByTestId(TEST_ID.blockControlsTrigger);
    expect(triggers).toHaveLength(2);
    const menu = screen.getAllByTestId(TEST_ID.blockControlsMenu)[0];
    expect(within(menu).getByRole("button", { name: "Move down" })).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: "Add block above" })).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: "Add block below" })).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: "Remove block" })).toBeInTheDocument();
  });

  it("with one block and move handlers, neither move button is visible", () => {
    const oneBlock = [blocks[0]];
    render(
      <BlocksColumn
        blocks={oneBlock}
        region="main"
        editable
        onAddBlock={vi.fn()}
        onMoveBlock={vi.fn()}
      />
    );
    expect(screen.queryByRole("button", { name: "Move up" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Move down" })).not.toBeInTheDocument();
  });

  it("Block settings button is accessible when block has settings", () => {
    const tableBlock: ContentBlock = {
      id: "t1",
      type: "table",
      content: "",
      rows: [["A", "B"]],
    };
    render(
      <BlocksColumn
        blocks={[tableBlock]}
        region="main"
        editable
        onAddBlock={vi.fn()}
        onBlockUpdate={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Block settings" })).toBeInTheDocument();
  });

  it("view mode stacks blocks without fixed inline height", () => {
    render(<BlocksColumn blocks={blocks} region="main" />);
    expect(screen.getByTestId(TEST_ID.blockStack)).toBeInTheDocument();
    const nodes = screen.getAllByTestId(TEST_ID.contentBlock);
    for (const node of nodes) {
      expect(node.style.height).toBe("");
      expect(node).not.toHaveClass("overflow-hidden");
    }
  });

  it("edit mode uses the same content-sized stack as view (no fixed RGL heights)", () => {
    render(
      <BlocksColumn
        blocks={blocks}
        region="main"
        editable
        onAddBlock={vi.fn()}
        onBlockUpdate={vi.fn()}
      />
    );
    expect(screen.getByTestId(TEST_ID.blockStack)).toBeInTheDocument();
    const nodes = screen.getAllByTestId(TEST_ID.contentBlock);
    expect(nodes).toHaveLength(2);
    for (const node of nodes) {
      expect(node.style.height).toBe("");
    }
  });

  it("edit toolbars and add controls sit outside the content-block wrapper", () => {
    render(
      <BlocksColumn
        blocks={blocks}
        region="main"
        editable
        onAddBlock={vi.fn()}
        onRemoveBlock={vi.fn()}
        onMoveBlock={vi.fn()}
        onBlockUpdate={vi.fn()}
      />
    );
    const units = screen.getAllByTestId(TEST_ID.blockEditUnit);
    expect(units.length).toBe(2);
    for (const unit of units) {
      const toolbar = unit.querySelector(testIdSelector(TEST_ID.blockToolbar));
      const content = unit.querySelector(testIdSelector(TEST_ID.contentBlock));
      expect(toolbar).toBeTruthy();
      expect(content).toBeTruthy();
      expect(content!.contains(toolbar)).toBe(false);
      expect(toolbar!.compareDocumentPosition(content!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(screen.getAllByTestId(TEST_ID.blockAddSlot).length).toBeGreaterThan(0);
    for (const slot of screen.getAllByTestId(TEST_ID.blockAddSlot)) {
      expect(slot.closest(testIdSelector(TEST_ID.contentBlock))).toBeNull();
    }
  });
});

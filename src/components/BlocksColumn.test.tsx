import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlocksColumn } from "./BlocksColumn";
import type { ContentBlock } from "@/lib/cms/types";

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
    expect(screen.getByText(/Add block \(main\)/)).toBeInTheDocument();
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
    expect(screen.getByText(/Add block \(main\)/)).toBeInTheDocument();
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
});

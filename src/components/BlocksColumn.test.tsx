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
    render(
      <BlocksColumn
        blocks={blocks}
        region="main"
        editable
        onAddBlock={vi.fn()}
      />
    );
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
    const removeButtons = screen.getAllByTitle("Remove block");
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
    const moveUp = screen.getByTitle("Move up");
    fireEvent.click(moveUp);
    expect(onMoveBlock).toHaveBeenCalledWith("2", "up", "main");
  });

  it("renders with empty blocks and still shows Add block when editable", () => {
    render(
      <BlocksColumn
        blocks={[]}
        region="main"
        editable
        onAddBlock={vi.fn()}
      />
    );
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
    expect(screen.queryByTitle("Move up")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Move down")).not.toBeInTheDocument();
  });
});

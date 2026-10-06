import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlockSettingsPanel } from "./BlockSettingsPanel";
import type { ContentBlock } from "@/lib/cms/types";

describe("BlockSettingsPanel", () => {
  it("calls onSettingsChange when table checkbox (striped) is toggled", () => {
    const onSettingsChange = vi.fn();
    const block: ContentBlock = {
      id: "t1",
      type: "table",
      content: "",
      rows: [["A"], ["B"]],
    };
    render(<BlockSettingsPanel block={block} onSettingsChange={onSettingsChange} />);

    const stripedCheckbox = screen.getByRole("checkbox", { name: /Striped rows/i });
    expect(stripedCheckbox).not.toBeChecked();
    fireEvent.click(stripedCheckbox);

    expect(onSettingsChange).toHaveBeenCalledTimes(1);
    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ striped: true, headerRow: true, bordered: true })
    );
  });

  it("calls onSettingsChange when table caption is typed", () => {
    const onSettingsChange = vi.fn();
    const block: ContentBlock = {
      id: "t1",
      type: "table",
      content: "",
      rows: [],
      settings: { caption: "" },
    };
    render(<BlockSettingsPanel block={block} onSettingsChange={onSettingsChange} />);

    const captionInput = screen.getByLabelText(/Table caption/i);
    fireEvent.change(captionInput, { target: { value: "My table" } });

    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ caption: "My table" }));
  });

  it("calls onSettingsChange when heading level select is changed", () => {
    const onSettingsChange = vi.fn();
    const block: ContentBlock = { id: "h1", type: "heading", content: "Title" };
    render(<BlockSettingsPanel block={block} onSettingsChange={onSettingsChange} />);

    const select = screen.getByLabelText(/Heading level/i);
    fireEvent.change(select, { target: { value: "2" } });

    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ level: "2" }));
  });

  it("calls onSettingsChange when list style is changed to numbered", () => {
    const onSettingsChange = vi.fn();
    const block: ContentBlock = { id: "l1", type: "list", content: "", items: [] };
    render(<BlockSettingsPanel block={block} onSettingsChange={onSettingsChange} />);

    const select = screen.getByLabelText(/List style/i);
    fireEvent.change(select, { target: { value: "numbered" } });

    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ listStyle: "numbered" })
    );
  });

  it("calls onSettingsChange when image alt text is set", () => {
    const onSettingsChange = vi.fn();
    const block: ContentBlock = { id: "i1", type: "image", content: "https://example.com/img.png" };
    render(<BlockSettingsPanel block={block} onSettingsChange={onSettingsChange} />);

    const altInput = screen.getByLabelText(/Alt text/i);
    fireEvent.change(altInput, { target: { value: "A nice image" } });

    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ alt: "A nice image" }));
  });

  it("shows no settings message for text block and calls onClose when Close clicked", () => {
    const onClose = vi.fn();
    const block: ContentBlock = { id: "x1", type: "text", content: "Hello" };
    render(<BlockSettingsPanel block={block} onSettingsChange={vi.fn()} onClose={onClose} />);

    expect(screen.getByText(/No settings for this block type/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("table panel shows First row as header, Striped, Bordered, Caption", () => {
    const block: ContentBlock = { id: "t1", type: "table", content: "", rows: [] };
    render(<BlockSettingsPanel block={block} onSettingsChange={vi.fn()} />);

    expect(screen.getByRole("checkbox", { name: /First row as header/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Striped rows/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Bordered/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Table caption/i)).toBeInTheDocument();
  });
});

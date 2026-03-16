import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddBlockButton } from "./AddBlockButton";

describe("AddBlockButton", () => {
  it("renders with default label and opens dropdown on click", () => {
    const onSelect = vi.fn();
    render(<AddBlockButton onSelect={onSelect} />);
    expect(screen.getByRole("button", { name: /Add block/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Add block/ }));
    expect(screen.getByRole("button", { name: /Heading/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Paragraph/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /List/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Table/ })).toBeInTheDocument();
  });

  it("calls onSelect with block type when option clicked", () => {
    const onSelect = vi.fn();
    render(<AddBlockButton onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /Add block/ }));
    fireEvent.click(screen.getByRole("button", { name: /Paragraph/ }));
    expect(onSelect).toHaveBeenCalledWith("text");
  });

  it("renders compact variant with aria-label", () => {
    render(<AddBlockButton onSelect={vi.fn()} variant="compact" label="Add block (main)" />);
    expect(screen.getByRole("button", { name: "Add block (main)" })).toBeInTheDocument();
  });

  it("shows custom label when provided", () => {
    render(<AddBlockButton onSelect={vi.fn()} label="Insert block" />);
    expect(screen.getByRole("button", { name: /Insert block/ })).toBeInTheDocument();
  });
});

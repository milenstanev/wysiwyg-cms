import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayoutSelector } from "./LayoutSelector";

describe("LayoutSelector", () => {
  it("renders all layout options", () => {
    render(<LayoutSelector value="single" onChange={vi.fn()} />);
    expect(screen.getByText("Layout:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Single column" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Two columns" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Three columns" })).toBeInTheDocument();
  });

  it("calls onChange when option clicked", () => {
    const onChange = vi.fn();
    render(<LayoutSelector value="single" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Two columns" }));
    expect(onChange).toHaveBeenCalledWith("two-col");
  });

  it("marks current value as selected (has correct class)", () => {
    render(<LayoutSelector value="three-col" onChange={vi.fn()} />);
    const selected = screen.getByRole("button", { name: "Three columns" });
    expect(selected).toHaveClass("bg-zinc-900");
  });
});

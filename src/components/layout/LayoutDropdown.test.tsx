import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayoutDropdown } from "./LayoutDropdown";

describe("LayoutDropdown", () => {
  it("renders Layout trigger button with accessible name", () => {
    render(<LayoutDropdown value="single" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Choose layout/i })).toBeInTheDocument();
  });

  it("opens dropdown in portal (document.body) when trigger clicked", () => {
    render(<LayoutDropdown value="single" onChange={vi.fn()} />);
    expect(screen.queryByTestId("layout-dropdown")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Choose layout/i }));
    expect(screen.getByTestId("layout-dropdown")).toBeInTheDocument();
    expect(screen.getByText("Layout:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Single column" })).toBeInTheDocument();
    expect(document.body.querySelector("[data-testid=layout-dropdown]")).toBeTruthy();
  });

  it("calls onChange and closes when option selected", () => {
    const onChange = vi.fn();
    render(<LayoutDropdown value="single" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Choose layout/i }));
    fireEvent.click(screen.getByRole("button", { name: "Two columns" }));
    expect(onChange).toHaveBeenCalledWith("two-col");
    expect(screen.queryByTestId("layout-dropdown")).not.toBeInTheDocument();
  });
});

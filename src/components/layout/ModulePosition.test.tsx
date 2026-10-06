import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModulePosition } from "./ModulePosition";

describe("ModulePosition", () => {
  it("renders nothing when empty (no children, no placeholder)", () => {
    const { container } = render(<ModulePosition name="top" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with data-module-position when it has children", () => {
    const { container } = render(
      <ModulePosition name="footer">
        <span>Footer content</span>
      </ModulePosition>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("data-module-position")).toBe("footer");
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("shows placeholder label when provided and empty", () => {
    render(<ModulePosition name="utility-a" placeholderLabel="Utility A" />);
    expect(screen.getByText("Utility A")).toBeInTheDocument();
    expect(
      screen.getByRole("generic", { name: "Module position: utility-a" })
    ).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModulePosition } from "./ModulePosition";

describe("ModulePosition", () => {
  it("renders with data-module-position attribute", () => {
    const { container } = render(<ModulePosition name="top" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("data-module-position")).toBe("top");
    expect(el.hasAttribute("data-module-placeholder")).toBe(true);
  });

  it("renders children when provided", () => {
    render(
      <ModulePosition name="footer">
        <span>Footer content</span>
      </ModulePosition>
    );
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("has accessible label", () => {
    render(<ModulePosition name="sidebar-left" />);
    expect(
      screen.getByRole("generic", { name: "Module position: sidebar-left" })
    ).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarCard } from "./SidebarCard";

describe("SidebarCard", () => {
  it("renders children", () => {
    render(<SidebarCard side="left">Left content</SidebarCard>);
    expect(screen.getByText("Left content")).toBeInTheDocument();
  });

  it("uses aside element", () => {
    const { container } = render(
      <SidebarCard side="left">X</SidebarCard>
    );
    expect(container.querySelector("aside")).toBeInTheDocument();
  });

  it("applies left layout class for side left", () => {
    const { container } = render(
      <SidebarCard side="left">X</SidebarCard>
    );
    expect(container.querySelector("aside")).toHaveClass("layout-sidebar-left");
  });

  it("applies right layout class for side right", () => {
    const { container } = render(
      <SidebarCard side="right">X</SidebarCard>
    );
    expect(container.querySelector("aside")).toHaveClass("layout-sidebar-right");
  });
});

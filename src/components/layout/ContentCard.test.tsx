import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContentCard } from "./ContentCard";

describe("ContentCard", () => {
  it("renders children", () => {
    render(<ContentCard>Hello inside card</ContentCard>);
    expect(screen.getByText("Hello inside card")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<ContentCard className="custom-class">Content</ContentCard>);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

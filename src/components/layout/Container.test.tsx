import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "./Container";

describe("Container", () => {
  it("renders children", () => {
    render(<Container>Inner</Container>);
    expect(screen.getByText("Inner")).toBeInTheDocument();
  });

  it("applies default container width class", () => {
    const { container } = render(<Container>X</Container>);
    expect((container.firstChild as HTMLElement).className).toMatch(/max-w-/);
  });

  it("applies narrow variant when specified", () => {
    const { container } = render(
      <Container variant="narrow">X</Container>
    );
    expect(container.firstChild).toHaveClass("max-w-2xl");
  });

  it("merges custom className", () => {
    const { container } = render(
      <Container className="my-class">X</Container>
    );
    expect(container.firstChild).toHaveClass("my-class");
  });
});

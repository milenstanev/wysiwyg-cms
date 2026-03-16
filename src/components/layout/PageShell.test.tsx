import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageShell } from "./PageShell";

describe("PageShell", () => {
  it("renders children in main", () => {
    render(
      <PageShell>
        <span>Main content</span>
      </PageShell>
    );
    expect(screen.getByText("Main content")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Main content");
  });

  it("renders header when provided", () => {
    render(
      <PageShell header={<span>Site header</span>}>
        <span>Main</span>
      </PageShell>
    );
    expect(screen.getByText("Site header")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveTextContent("Site header");
  });

  it("renders footer when provided", () => {
    render(
      <PageShell footer={<span>Site footer</span>}>
        <span>Main</span>
      </PageShell>
    );
    expect(screen.getByText("Site footer")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Site footer");
  });

  it("does not render header or footer when not provided", () => {
    render(<PageShell>Only main</PageShell>);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Only main");
  });
});

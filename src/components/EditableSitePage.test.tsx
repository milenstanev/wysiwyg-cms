import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { EditableSitePage } from "./EditableSitePage";
import type { Page } from "@/lib/cms/types";

const mockPage: Page = {
  id: "1",
  slug: "home",
  title: "Welcome",
  layout: "single",
  blocks: [{ id: "b1", type: "heading", content: "Hello" }],
  updatedAt: new Date().toISOString(),
};

const allPages = [
  { id: "1", slug: "home", title: "Welcome" },
  { id: "2", slug: "about", title: "About Us" },
];

describe("EditableSitePage", () => {
  it("renders page title and nav links", () => {
    render(<EditableSitePage initialPage={mockPage} allPages={allPages} currentSlug="home" />);
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Site navigation" });
    expect(within(nav).getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "About Us" })).toBeInTheDocument();
  });

  it("shows Edit this page when not editing", () => {
    render(<EditableSitePage initialPage={mockPage} allPages={allPages} currentSlug="home" />);
    expect(screen.getByRole("button", { name: /Edit this page/i })).toBeInTheDocument();
  });

  it("renders main content from page", () => {
    render(<EditableSitePage initialPage={mockPage} allPages={allPages} currentSlug="home" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("when editing, Layout trigger is in header and layout options fly in portal (not in content flow)", () => {
    const { container } = render(
      <EditableSitePage initialPage={mockPage} allPages={allPages} currentSlug="home" />
    );
    fireEvent.click(screen.getByRole("button", { name: /Edit this page/i }));
    const header = container.querySelector("[data-page-header]");
    expect(header).toBeTruthy();
    const layoutTrigger = screen.getByRole("button", { name: /Choose layout/i });
    expect(header).toContainElement(layoutTrigger);
    expect(screen.queryByText("Layout:")).not.toBeInTheDocument();
    fireEvent.click(layoutTrigger);
    expect(screen.getByText("Layout:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Single column" })).toBeInTheDocument();
    expect(screen.getByTestId("layout-dropdown")).toBeInTheDocument();
    expect(document.body.querySelector("[data-testid=layout-dropdown]")).toBeTruthy();
  });

  it("edit toolbar buttons are accessible by role and name", () => {
    render(<EditableSitePage initialPage={mockPage} allPages={allPages} currentSlug="home" />);
    expect(screen.getByRole("button", { name: /Edit this page/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Edit this page/i }));
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Choose layout/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Choose layout/i }));
    expect(screen.getByRole("button", { name: "Single column" })).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { EditableSitePage } from "./EditableSitePage";
import type { Page } from "@/lib/cms/types";
import { TEST_ID, testIdSelector } from "@/lib/test-ids";

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

  it("when editing, Layout trigger is in the floating editor bar and layout options fly in portal (not in content flow)", () => {
    const { container } = render(
      <EditableSitePage initialPage={mockPage} allPages={allPages} currentSlug="home" />
    );
    const header = container.querySelector("[data-page-header]")!;
    const headerNodesView = header.querySelectorAll("*").length;
    fireEvent.click(screen.getByRole("button", { name: /Edit this page/i }));
    const layoutTrigger = screen.getByRole("button", { name: /Choose layout/i });
    expect(screen.getByTestId(TEST_ID.editorBar)).toContainElement(layoutTrigger);
    expect(header).not.toContainElement(layoutTrigger);
    expect(container.querySelector("[data-page-renderer]")).not.toContainElement(layoutTrigger);
    // Header keeps the same children (edit button only turns invisible) so it cannot change size
    expect(header.querySelectorAll("*").length).toBe(headerNodesView);
    expect(screen.queryByText("Layout:")).not.toBeInTheDocument();
    fireEvent.click(layoutTrigger);
    expect(screen.getByText("Layout:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Single column" })).toBeInTheDocument();
    expect(screen.getByTestId(TEST_ID.layoutDropdown)).toBeInTheDocument();
    expect(document.body.querySelector(testIdSelector(TEST_ID.layoutDropdown))).toBeTruthy();
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

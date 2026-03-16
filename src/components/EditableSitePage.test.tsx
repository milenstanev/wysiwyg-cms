import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
    render(
      <EditableSitePage
        initialPage={mockPage}
        allPages={allPages}
        currentSlug="home"
      />
    );
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Site navigation" });
    expect(within(nav).getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "About Us" })).toBeInTheDocument();
  });

  it("shows Edit this page when not editing", () => {
    render(
      <EditableSitePage
        initialPage={mockPage}
        allPages={allPages}
        currentSlug="home"
      />
    );
    expect(screen.getByRole("button", { name: /Edit this page/i })).toBeInTheDocument();
  });

  it("renders main content from page", () => {
    render(
      <EditableSitePage
        initialPage={mockPage}
        allPages={allPages}
        currentSlug="home"
      />
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});

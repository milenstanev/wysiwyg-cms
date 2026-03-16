import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument();
  });

  it("has link to Admin", () => {
    render(<Footer />);
    const admin = screen.getByRole("link", { name: "Admin" });
    expect(admin).toHaveAttribute("href", "/admin");
  });

  it("has link to Home", () => {
    render(<Footer />);
    const home = screen.getByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("href", "/");
  });
});

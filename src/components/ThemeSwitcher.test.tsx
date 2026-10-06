import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { THEME_STORAGE_KEY } from "@/lib/theme";

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem(THEME_STORAGE_KEY);
  });

  it("lists all themes and is labelled", () => {
    render(<ThemeSwitcher />);
    const select = screen.getByRole("combobox", { name: /Choose theme/i });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Atelier" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Nord" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Ink" })).toBeInTheDocument();
  });

  it("applies selected theme to document and storage", () => {
    render(<ThemeSwitcher />);
    fireEvent.change(screen.getByRole("combobox", { name: /Choose theme/i }), {
      target: { value: "harbor" },
    });
    expect(document.documentElement.getAttribute("data-theme")).toBe("harbor");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("harbor");
  });
});

"use client";

import { useState } from "react";
import { applyTheme, DEFAULT_THEME, readStoredTheme, THEMES, type ThemeId } from "@/lib/theme";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME;
    return readStoredTheme();
  });

  return (
    <label className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
      <span className="sr-only">Theme</span>
      <span
        className="size-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--surface)]"
        aria-hidden
      />
      <select
        value={theme}
        onChange={(e) => {
          const next = e.target.value as ThemeId;
          setTheme(next);
          applyTheme(next);
        }}
        aria-label="Choose theme"
        className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground)]"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id} title={t.note}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export const THEME_STORAGE_KEY = "cms-theme";

/**
 * Theme catalog. Each theme has a display + body font pairing
 * (loaded in `app/layout.tsx`, applied via `--theme-font-*` in globals.css).
 */
export const THEMES = [
  {
    id: "editorial",
    label: "Editorial",
    note: "Literata + Source Sans 3",
    fonts: { display: "Literata", sans: "Source Sans 3" },
  },
  {
    id: "pebble",
    label: "Pebble",
    note: "DM Sans",
    fonts: { display: "DM Sans", sans: "DM Sans" },
  },
  {
    id: "atelier",
    label: "Atelier",
    note: "Fraunces + Source Sans 3",
    fonts: { display: "Fraunces", sans: "Source Sans 3" },
  },
  {
    id: "harbor",
    label: "Harbor",
    note: "Source Serif 4 + Outfit",
    fonts: { display: "Source Serif 4", sans: "Outfit" },
  },
  {
    id: "nord",
    label: "Nord",
    note: "IBM Plex Serif + Sans",
    fonts: { display: "IBM Plex Serif", sans: "IBM Plex Sans" },
  },
  {
    id: "ink",
    label: "Ink",
    note: "Cormorant + Karla",
    fonts: { display: "Cormorant Garamond", sans: "Karla" },
  },
  {
    id: "gallery",
    label: "Gallery",
    note: "Forum + Outfit",
    fonts: { display: "Forum", sans: "Outfit" },
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "editorial";

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

export function getThemeFonts(id: ThemeId): { display: string; sans: string } {
  return THEMES.find((t) => t.id === id)!.fonts;
}

export function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute("data-theme", id);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // private mode / blocked storage
  }
}

export function readStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

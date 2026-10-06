export const THEME_STORAGE_KEY = "cms-theme";

export const THEMES = [
  { id: "editorial", label: "Editorial", note: "Modern monochrome studio" },
  { id: "pebble", label: "Pebble", note: "Quiet studio gray" },
  { id: "atelier", label: "Atelier", note: "Warm paper & terracotta" },
  { id: "harbor", label: "Harbor", note: "Sand, teal, coastal" },
  { id: "nord", label: "Nord", note: "Arctic frost (nordtheme.com)" },
  { id: "ink", label: "Ink", note: "Charcoal & gold night" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "editorial";

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEMES.some((t) => t.id === value);
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

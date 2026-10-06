export interface SiteSettings {
  siteName: string;
  description: string;
  defaultOgImage?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "WYSIWYG CMS",
  description: "A decoupled CMS with WYSIWYG editing",
};

import { promises as fs } from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "content", "site-settings.json");

export async function loadSiteSettings(): Promise<SiteSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return {
      siteName: typeof parsed.siteName === "string" ? parsed.siteName : DEFAULT_SITE_SETTINGS.siteName,
      description:
        typeof parsed.description === "string"
          ? parsed.description
          : DEFAULT_SITE_SETTINGS.description,
      defaultOgImage:
        typeof parsed.defaultOgImage === "string" ? parsed.defaultOgImage : undefined,
    };
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  return settings;
}

import type { Metadata } from "next";
import type { Page } from "./types";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "./site-settings";

export function buildPageMetadata(page: Page, settings: SiteSettings = DEFAULT_SITE_SETTINGS): Metadata {
  const title = page.seo?.title?.trim() || page.title;
  const description =
    page.seo?.description?.trim() || settings.description || DEFAULT_SITE_SETTINGS.description;
  const ogImage = page.seo?.ogImage?.trim() || settings.defaultOgImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

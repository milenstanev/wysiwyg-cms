import { getPublishedPageBySlug, loadPublishedPages } from "@/lib/cms/store-db";
import { EditableSitePage } from "@/components/EditableSitePage";
import { shouldShowInNav } from "@/lib/cms/page-blocks";
import { loadSiteSettings } from "@/lib/cms/site-settings";
import { buildPageMetadata } from "@/lib/cms/page-metadata";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPublishedPageBySlug("home"), loadSiteSettings()]);
  if (!page) {
    return { title: settings.siteName, description: settings.description };
  }
  return buildPageMetadata(page, settings);
}

export default async function Home() {
  const [page, pages] = await Promise.all([getPublishedPageBySlug("home"), loadPublishedPages()]);
  if (!page) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center">
        <h1 className="text-[var(--muted)]">No content found.</h1>
      </main>
    );
  }

  const allPages = pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    showInNav: shouldShowInNav(p),
  }));
  return <EditableSitePage initialPage={page} allPages={allPages} currentSlug="home" />;
}

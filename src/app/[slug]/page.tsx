import { getPublishedPageBySlug, loadPublishedPages } from "@/lib/cms/store-db";
import { EditableSitePage } from "@/components/EditableSitePage";
import { shouldShowInNav } from "@/lib/cms/page-blocks";
import { loadSiteSettings } from "@/lib/cms/site-settings";
import { buildPageMetadata } from "@/lib/cms/page-metadata";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "admin" || slug === "api") return {};
  const [page, settings] = await Promise.all([getPublishedPageBySlug(slug), loadSiteSettings()]);
  if (!page) return { title: "Not found" };
  return buildPageMetadata(page, settings);
}

export default async function PageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "admin" || slug === "api") notFound();
  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();
  const pages = await loadPublishedPages();
  const allPages = pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    showInNav: shouldShowInNav(p),
  }));

  return <EditableSitePage initialPage={page} allPages={allPages} currentSlug={slug} />;
}

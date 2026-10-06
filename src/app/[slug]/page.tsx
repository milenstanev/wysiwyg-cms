import { getPageBySlug, loadPages } from "@/lib/cms/store-db";
import { EditableSitePage } from "@/components/EditableSitePage";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "admin" || slug === "api") notFound();
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  const pages = await loadPages();
  const allPages = pages.map((p) => ({ id: p.id, slug: p.slug, title: p.title }));

  return <EditableSitePage initialPage={page} allPages={allPages} currentSlug={slug} />;
}

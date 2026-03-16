import { getPageBySlug, loadPages } from "@/lib/cms/store-db";
import { EditableSitePage } from "@/components/EditableSitePage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [page, pages] = await Promise.all([getPageBySlug("home"), loadPages()]);
  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">No content found.</p>
      </div>
    );
  }

  const allPages = pages.map((p) => ({ id: p.id, slug: p.slug, title: p.title }));
  return <EditableSitePage initialPage={page} allPages={allPages} currentSlug="home" />;
}

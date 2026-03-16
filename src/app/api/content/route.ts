import { NextResponse } from "next/server";
import { loadPages } from "@/lib/cms/store-db";

export async function GET() {
  const pages = await loadPages();
  return NextResponse.json(
    pages.map((p) => ({ id: p.id, slug: p.slug, title: p.title }))
  );
}

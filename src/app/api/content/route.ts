import { NextResponse } from "next/server";
import { loadPages } from "@/lib/cms/store-db";

export async function GET() {
  try {
    const pages = await loadPages();
    return NextResponse.json(pages.map((p) => ({ id: p.id, slug: p.slug, title: p.title })));
  } catch (err) {
    console.error("loadPages failed", err);
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}

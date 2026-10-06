import { NextResponse } from "next/server";
import { getPageBySlug, updatePage } from "@/lib/cms/store-db";
import { normalizePage } from "@/lib/cms/normalize-page";
import { Page } from "@/lib/cms/types";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trimmed = typeof slug === "string" ? slug.trim() : "";
  if (!trimmed) return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  const page = await getPageBySlug(trimmed);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let body: Partial<Page> & { id?: string; slug?: string; title?: string };
  try {
    body = (await req.json()) as Partial<Page> & { id: string; slug: string; title: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const slugTrim = typeof slug === "string" ? slug.trim() : "";
  if (!slugTrim) return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  if (!body.id || typeof body.id !== "string" || body.id.trim() === "" || body.slug !== slugTrim) {
    return NextResponse.json({ error: "Slug mismatch or missing id" }, { status: 400 });
  }
  const id = body.id;
  const page = normalizePage({
    ...body,
    id,
    slug: slugTrim,
    title: body.title ?? "",
    updatedAt: (body as Page).updatedAt ?? new Date().toISOString(),
  });
  try {
    const updated = await updatePage(page);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("updatePage failed", err);
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createPage, loadPages } from "@/lib/cms/store-db";
import type { PageLayout, PageStatus } from "@/lib/cms/types";
import { LAYOUT_OPTIONS, PAGE_STATUSES } from "@/lib/cms/types";
import { isValidSlug, RESERVED_SLUGS } from "@/lib/cms/slug";

export async function GET() {
  try {
    const pages = await loadPages();
    return NextResponse.json(
      pages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        status: p.status ?? "published",
      }))
    );
  } catch (err) {
    console.error("loadPages failed", err);
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: { title?: string; slug?: string; layout?: PageLayout; status?: PageStatus };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (body.slug != null) {
    const slug = String(body.slug).trim().toLowerCase();
    if (!isValidSlug(slug) || RESERVED_SLUGS.has(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
  }
  if (body.layout != null && !LAYOUT_OPTIONS.includes(body.layout)) {
    return NextResponse.json({ error: "Invalid layout" }, { status: 400 });
  }
  if (body.status != null && !PAGE_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  try {
    const page = await createPage({
      title,
      slug: body.slug,
      layout: body.layout,
      status: body.status,
    });
    return NextResponse.json(page, { status: 201 });
  } catch (err) {
    console.error("createPage failed", err);
    const message = err instanceof Error ? err.message : "Failed to create page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

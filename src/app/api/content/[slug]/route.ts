import { NextResponse } from "next/server";
import {
  deletePage,
  getPageBySlug,
  renamePageSlug,
  updatePage,
} from "@/lib/cms/store-db";
import { normalizePage } from "@/lib/cms/normalize-page";
import { Page } from "@/lib/cms/types";
import { isValidSlug, RESERVED_SLUGS } from "@/lib/cms/slug";

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
  if (!body.id || typeof body.id !== "string" || body.id.trim() === "") {
    return NextResponse.json({ error: "Slug mismatch or missing id" }, { status: 400 });
  }

  const bodySlug =
    typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const existing = await getPageBySlug(slugTrim);
  const isRename = bodySlug !== "" && bodySlug !== slugTrim;

  if (isRename) {
    if (!existing || existing.id !== body.id) {
      return NextResponse.json({ error: "Slug mismatch or missing id" }, { status: 400 });
    }
    if (!isValidSlug(bodySlug) || RESERVED_SLUGS.has(bodySlug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    try {
      await renamePageSlug(slugTrim, bodySlug);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to rename";
      const status = message === "Slug already exists" ? 409 : 400;
      return NextResponse.json({ error: message }, { status });
    }
  } else if (body.slug !== slugTrim) {
    return NextResponse.json({ error: "Slug mismatch or missing id" }, { status: 400 });
  }

  const targetSlug = isRename ? bodySlug : slugTrim;
  const page = normalizePage({
    ...body,
    id: body.id,
    slug: targetSlug,
    title: body.title ?? existing?.title ?? "",
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

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trimmed = typeof slug === "string" ? slug.trim() : "";
  if (!trimmed) return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  try {
    const deleted = await deletePage(trimmed);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("deletePage failed", err);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}

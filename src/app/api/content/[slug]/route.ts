import { NextResponse } from "next/server";
import { getPageBySlug, updatePage } from "@/lib/cms/store-db";
import { Page } from "@/lib/cms/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = (await req.json()) as Page;
  if (body.slug !== slug) {
    return NextResponse.json({ error: "Slug mismatch" }, { status: 400 });
  }
  const updated = await updatePage(body);
  return NextResponse.json(updated);
}

import { NextResponse } from "next/server";
import { duplicatePage } from "@/lib/cms/store-db";

export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trimmed = typeof slug === "string" ? slug.trim() : "";
  if (!trimmed) return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  try {
    const page = await duplicatePage(trimmed);
    return NextResponse.json(page, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to duplicate";
    const status = message === "Not found" ? 404 : 500;
    if (status === 500) console.error("duplicatePage failed", err);
    return NextResponse.json({ error: message }, { status });
  }
}

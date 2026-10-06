import { NextResponse } from "next/server";
import { loadSiteSettings, saveSiteSettings, type SiteSettings } from "@/lib/cms/site-settings";

export async function GET() {
  const settings = await loadSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  let body: Partial<SiteSettings>;
  try {
    body = (await req.json()) as Partial<SiteSettings>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const current = await loadSiteSettings();
  const next: SiteSettings = {
    siteName:
      typeof body.siteName === "string" && body.siteName.trim()
        ? body.siteName.trim()
        : current.siteName,
    description:
      typeof body.description === "string" ? body.description.trim() : current.description,
    defaultOgImage:
      typeof body.defaultOgImage === "string"
        ? body.defaultOgImage.trim() || undefined
        : current.defaultOgImage,
  };
  const saved = await saveSiteSettings(next);
  return NextResponse.json(saved);
}

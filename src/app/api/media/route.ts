import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export async function GET() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const files = await fs.readdir(UPLOAD_DIR);
    const images = files
      .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
      .map((f) => ({ url: `/uploads/${f}`, name: f }));
    return NextResponse.json(images);
  } catch (err) {
    console.error("list media failed", err);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }
    const ext =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
          ? "png"
          : file.type === "image/gif"
            ? "gif"
            : "webp";
    const name = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.${ext}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
    return NextResponse.json({ url: `/uploads/${name}`, name }, { status: 201 });
  } catch (err) {
    console.error("upload failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

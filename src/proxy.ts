import { NextResponse, type NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cms_admin";
const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function sessionToken(password: string): string {
  return createHash("sha256").update(`cms-admin:${password}`).digest("hex");
}

function equals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function hasValidBasicAuth(req: NextRequest, password: string): boolean {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
  } catch {
    return false;
  }
  const separator = decoded.indexOf(":");
  if (separator < 0) return false;
  return equals(decoded.slice(separator + 1), password);
}

function isProtectedApi(pathname: string): boolean {
  return (
    pathname.startsWith("/api/content") ||
    pathname.startsWith("/api/media") ||
    pathname.startsWith("/api/settings")
  );
}

export function proxy(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  // Unset means the gate is off, which keeps local dev and CI unauthenticated.
  if (!password) return NextResponse.next();

  const pathname = req.nextUrl.pathname;
  const isApi = isProtectedApi(pathname);
  // Content reads stay public; writes require admin cookie / Basic (same as media/settings).
  if (pathname.startsWith("/api/content") && READ_METHODS.has(req.method)) {
    return NextResponse.next();
  }

  const token = sessionToken(password);
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (cookie && equals(cookie, token)) return NextResponse.next();

  if (hasValidBasicAuth(req, password)) {
    const res = NextResponse.next();
    // Lets the editor on public pages reach the write API after signing in at /admin.
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return res;
  }

  if (isApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="CMS Admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/content/:path*", "/api/media/:path*", "/api/settings/:path*"],
};

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

const PASSWORD = "s3cret";

function request(path: string, init: { method?: string; headers?: HeadersInit } = {}) {
  return new NextRequest(`http://localhost${path}`, {
    method: init.method ?? "GET",
    headers: init.headers,
  });
}

function basic(password: string): HeadersInit {
  return { authorization: `Basic ${Buffer.from(`admin:${password}`).toString("base64")}` };
}

afterEach(() => {
  delete process.env.ADMIN_PASSWORD;
});

describe("proxy auth gate", () => {
  it("is disabled when ADMIN_PASSWORD is unset", () => {
    expect(proxy(request("/admin")).status).toBe(200);
    expect(proxy(request("/api/content/home", { method: "PUT" })).status).toBe(200);
  });

  describe("with ADMIN_PASSWORD set", () => {
    beforeEach(() => {
      process.env.ADMIN_PASSWORD = PASSWORD;
    });

    it("challenges unauthenticated admin requests", () => {
      const res = proxy(request("/admin"));
      expect(res.status).toBe(401);
      expect(res.headers.get("www-authenticate")).toContain("Basic");
    });

    it("rejects a wrong password", () => {
      expect(proxy(request("/admin", { headers: basic("nope") })).status).toBe(401);
    });

    it("accepts the right password and issues a session cookie", () => {
      const res = proxy(request("/admin", { headers: basic(PASSWORD) }));
      expect(res.status).toBe(200);
      expect(res.cookies.get("cms_admin")?.value).toBeTruthy();
    });

    it("lets the session cookie authorize a content write", () => {
      const token = proxy(request("/admin", { headers: basic(PASSWORD) })).cookies.get(
        "cms_admin"
      )!.value;
      const res = proxy(
        request("/api/content/home", { method: "PUT", headers: { cookie: `cms_admin=${token}` } })
      );
      expect(res.status).toBe(200);
    });

    it("blocks unauthenticated content writes", () => {
      expect(proxy(request("/api/content/home", { method: "PUT" })).status).toBe(401);
    });

    it("leaves content reads public", () => {
      expect(proxy(request("/api/content")).status).toBe(200);
    });
  });
});

import { describe, expect, it } from "vitest";
import { z } from "zod";
import { GET } from "@/app/api/health+api";
import { json, setSessionResolver, withSession } from "./http";

const req = (init?: RequestInit, url = "http://x/api/t") => new Request(url, init);

describe("json", () => {
  it("define content-type", async () => {
    const res = json({ a: 1 }, { status: 201 });
    expect(res.status).toBe(201);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual({ a: 1 });
  });
});

describe("withSession", () => {
  it("responde 401 sem sessão", async () => {
    setSessionResolver(async () => null);
    const res = await withSession(() => json({}))(req());
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("UNAUTHORIZED");
  });

  it("usa o userId da sessão e valida body", async () => {
    setSessionResolver(async () => ({ userId: "u1" }));
    const handler = withSession(async ({ userId, body }) => {
      const input = await body(z.object({ name: z.string().min(2) }));
      return json({ userId, ...input });
    });
    const ok = await handler(req({ method: "POST", body: JSON.stringify({ name: "Ana" }) }));
    expect(await ok.json()).toEqual({ userId: "u1", name: "Ana" });

    const bad = await handler(req({ method: "POST", body: JSON.stringify({ name: "A" }) }));
    expect(bad.status).toBe(400);
    const payload = await bad.json();
    expect(payload.error.code).toBe("VALIDATION_ERROR");
    expect(payload.error.fields.name).toBeDefined();
  });

  it("valida query", async () => {
    setSessionResolver(async () => ({ userId: "u1" }));
    const handler = withSession(({ query }) =>
      json(query(z.object({ from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))),
    );
    expect((await handler(req(undefined, "http://x/a?from=2026-01-01"))).status).toBe(200);
    expect((await handler(req(undefined, "http://x/a?from=oi"))).status).toBe(400);
  });

  it("responde 500 sem vazar detalhes", async () => {
    setSessionResolver(async () => ({ userId: "u1" }));
    const res = await withSession(() => {
      throw new Error("segredo");
    })(req());
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("segredo");
  });
});

describe("GET /api/health", () => {
  it("responde ok", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
});

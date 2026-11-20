import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health+api";

describe("GET /api/health", () => {
  it("é público e responde ok com a hora do servidor", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; time: string };
    expect(body.ok).toBe(true);
    expect(new Date(body.time).toISOString()).toBe(body.time);
  });
});

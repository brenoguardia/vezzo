import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/v1/catalog+api";
import { db, installFakeSession, req, USER_A } from "@/server/testing/harness";
import { catalogDto } from "@/shared/schemas";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});

describe("GET /v1/catalog", () => {
  it("exige sessão", async () => {
    expect((await GET(req("/api/v1/catalog"))).status).toBe(401);
  });

  it("devolve categorias ordenadas com seus templates", async () => {
    const saude = await db.category.create({ data: { slug: "saude", namePt: "Saúde", nameEn: "Health", order: 1 } });
    const mente = await db.category.create({ data: { slug: "mente", namePt: "Mente", nameEn: "Mind", order: 2 } });
    const base = { namePt: "x", nameEn: "x", emoji: "💧", defaultGoalValue: 1, goalUnit: "BOOLEAN", defaultDays: [0] };
    await db.habitTemplate.create({ data: { ...base, slug: "b", categoryId: saude.id, order: 2 } });
    await db.habitTemplate.create({ data: { ...base, slug: "a", categoryId: saude.id, order: 1 } });
    await db.habitTemplate.create({ data: { ...base, slug: "c", categoryId: mente.id, order: 1 } });

    const res = await GET(req("/api/v1/catalog", { user: USER_A }));
    expect(res.status).toBe(200);
    const body = catalogDto.parse(await res.json());
    expect(body.categories.map((c) => c.slug)).toEqual(["saude", "mente"]);
    expect(body.categories[0].templates.map((t) => t.slug)).toEqual(["a", "b"]);
    expect(body.categories[1].templates.map((t) => t.slug)).toEqual(["c"]);
  });
});

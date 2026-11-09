import { beforeEach, describe, expect, it, vi } from "vitest";
import { db, installFakeSession, req, seedHabit, seedProfile, USER_A, USER_B } from "@/server/testing/harness";
import { POST } from "@/app/api/v1/onboarding/complete+api";
import { onboardingResult } from "@/shared/schemas";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});

const water = {
  templateSlug: "beber-agua",
  name: "Beber água",
  emoji: "💧",
  goalValue: 2.5,
  goalUnit: "LITERS",
  days: [0, 1, 2, 3, 4, 5, 6],
};
const read = { ...water, templateSlug: "ler", name: "Ler", emoji: "📚", goalValue: 15, goalUnit: "PAGES" };

async function seedTemplates() {
  const cat = await db.category.create({ data: { slug: "saude", namePt: "Saúde", nameEn: "Health", order: 1 } });
  for (const slug of ["beber-agua", "ler"]) {
    await db.habitTemplate.create({ data: { slug, categoryId: cat.id } });
  }
}

const post = (user: string | undefined, body: unknown) =>
  POST(req("/api/v1/onboarding/complete", { user, method: "POST", body }));

describe("POST /v1/onboarding/complete", () => {
  it("exige sessão", async () => {
    expect((await post(undefined, { displayName: "Ana", habits: [water] })).status).toBe(401);
  });

  it("grava nome, hábitos em ordem e marca onboardingDone", async () => {
    await seedTemplates();
    await seedProfile(USER_A);
    const res = await post(USER_A, { displayName: "  Ana  ", habits: [water, read] });
    expect(res.status).toBe(200);
    const result = onboardingResult.parse(await res.json());
    expect(result.profile).toMatchObject({ displayName: "Ana", onboardingDone: true });
    expect(result.habits.map((h) => [h.name, h.order])).toEqual([["Beber água", 0], ["Ler", 1]]);
    expect(result.habits.every((h) => h.templateId !== null)).toBe(true);
    expect(await db.habit.count({ where: { userId: USER_A } })).toBe(2);
  });

  it("é idempotente: repetir não duplica hábitos", async () => {
    await seedTemplates();
    await seedProfile(USER_A);
    await post(USER_A, { displayName: "Ana", habits: [water] });
    const again = await post(USER_A, { displayName: "Ana", habits: [water] });
    expect(again.status).toBe(200);
    expect(await db.habit.count({ where: { userId: USER_A } })).toBe(1);
  });

  it("é transacional: atividade desconhecida não grava nada", async () => {
    await seedTemplates();
    await seedProfile(USER_A, { displayName: "Antigo" });
    const res = await post(USER_A, { displayName: "Ana", habits: [water, { ...read, templateSlug: "nao-existe" }] });
    expect(res.status).toBe(400);
    expect((await res.json()).error.fields["habits.1.templateSlug"]).toBeDefined();
    expect(await db.habit.count({ where: { userId: USER_A } })).toBe(0);
    const profile = await db.profile.findUnique({ where: { userId: USER_A } });
    expect(profile).toMatchObject({ displayName: "Antigo", onboardingDone: false });
  });

  it("valida o corpo (nome vazio, sem hábitos)", async () => {
    await seedProfile(USER_A);
    expect((await post(USER_A, { displayName: " ", habits: [water] })).status).toBe(400);
    expect((await post(USER_A, { displayName: "Ana", habits: [] })).status).toBe(400);
  });

  it("usa só o userId da sessão: B não altera dados de A", async () => {
    await seedTemplates();
    await seedProfile(USER_A, { displayName: "A" });
    await seedProfile(USER_B, { displayName: "B" });
    await seedHabit(USER_A);
    await post(USER_B, { displayName: "Bia", habits: [water], userId: USER_A });
    expect(await db.habit.count({ where: { userId: USER_A } })).toBe(1);
    expect(await db.profile.findUnique({ where: { userId: USER_A } })).toMatchObject({ displayName: "A", onboardingDone: false });
    expect(await db.habit.count({ where: { userId: USER_B } })).toBe(1);
  });

  it("responde 404 sem perfil", async () => {
    await seedTemplates();
    expect((await post(USER_A, { displayName: "Ana", habits: [water] })).status).toBe(404);
  });
});

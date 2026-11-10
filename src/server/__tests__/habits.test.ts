import { beforeEach, describe, expect, it, vi } from "vitest";
import { db, installFakeSession, req, seedHabit, USER_A, USER_B } from "@/server/testing/harness";
import { GET, POST } from "@/app/api/v1/habits/index+api";
import { DELETE, PATCH } from "@/app/api/v1/habits/[id]+api";
import { habitDto, habitList } from "@/shared/schemas";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});


const valid = { name: "Ler", emoji: "📚", goalValue: 15, goalUnit: "PAGES", days: [0, 2, 4] };

describe("GET /v1/habits · documentos sem archivedAt", () => {
  // Regressão: no Mongo, `archivedAt: null` não casa com hábitos gravados sem o campo (onboarding antigo).
  it("lista hábitos que não têm o campo archivedAt e esconde os arquivados", async () => {
    const base = { userId: USER_A, emoji: "💧", goalValue: 1, goalUnit: "BOOLEAN", days: [0], name: "Água" };
    await db.habit.create({ data: { ...base, name: "Sem campo" } });
    await db.habit.create({ data: { ...base, name: "Nulo", archivedAt: null } });
    await db.habit.create({ data: { ...base, name: "Arquivado", archivedAt: new Date() } });
    const { habits } = habitList.parse(await (await GET(req("/api/v1/habits", { user: USER_A }))).json());
    expect(habits.map((h) => h.name).sort()).toEqual(["Nulo", "Sem campo"]);
  });

  it("a ordem do novo hábito conta os existentes sem o campo", async () => {
    await db.habit.create({ data: { userId: USER_A, name: "Antigo", emoji: "💧", goalValue: 1, goalUnit: "BOOLEAN", days: [0] } });
    const dto = habitDto.parse(await (await POST(req("/api/v1/habits", { user: USER_A, method: "POST", body: valid }))).json());
    expect(dto.order).toBe(1);
  });
});

describe("arquivados", () => {
  const base = { emoji: "💧", goalValue: 1, goalUnit: "BOOLEAN", days: [0] };

  it("includeArchived=true devolve ativos e arquivados só do próprio usuário", async () => {
    await db.habit.create({ data: { ...base, userId: USER_A, name: "Ativo", archivedAt: null } });
    await db.habit.create({ data: { ...base, userId: USER_A, name: "Arquivado", archivedAt: new Date() } });
    await db.habit.create({ data: { ...base, userId: USER_B, name: "Do B", archivedAt: new Date() } });
    const get = async (qs: string) =>
      habitList.parse(await (await GET(req(`/api/v1/habits${qs}`, { user: USER_A }))).json()).habits.map((h) => h.name).sort();
    expect(await get("")).toEqual(["Ativo"]);
    expect(await get("?includeArchived=true")).toEqual(["Arquivado", "Ativo"]);
    expect((await GET(req("/api/v1/habits?includeArchived=talvez", { user: USER_A }))).status).toBe(400);
  });

  it("PATCH archived:false desarquiva e põe no fim dos ativos; archived:true arquiva", async () => {
    await db.habit.create({ data: { ...base, userId: USER_A, name: "Ativo", order: 0, archivedAt: null } });
    const old = await db.habit.create({ data: { ...base, userId: USER_A, name: "Velho", order: 0, archivedAt: new Date() } });
    const patch = (id: string, user: string, body: unknown) =>
      PATCH(req(`/api/v1/habits/${id}`, { user, method: "PATCH", body }), { id });
    const res = await patch(String(old.id), USER_A, { archived: false });
    expect(res.status).toBe(200);
    expect(habitDto.parse(await res.json())).toMatchObject({ name: "Velho", archivedAt: null, order: 1 });
    const again = await patch(String(old.id), USER_A, { archived: true });
    expect(habitDto.parse(await again.json()).archivedAt).not.toBeNull();
  });

  it("B não desarquiva o hábito de A", async () => {
    const mine = await db.habit.create({ data: { ...base, userId: USER_A, name: "Meu", archivedAt: new Date() } });
    const id = String(mine.id);
    const res = await PATCH(req(`/api/v1/habits/${id}`, { user: USER_B, method: "PATCH", body: { archived: false } }), { id });
    expect(res.status).toBe(404);
  });
});

describe("POST /v1/habits", () => {
  it("cria com userId da sessão, defaults e ordem sequencial", async () => {
    const first = await POST(req("/api/v1/habits", { user: USER_A, method: "POST", body: { ...valid, userId: USER_B } }));
    expect(first.status).toBe(201);
    const dto = habitDto.parse(await first.json());
    expect(dto).toMatchObject({ name: "Ler", reminders: [], quickActions: true, order: 0, archivedAt: null });
    const second = habitDto.parse(
      await (await POST(req("/api/v1/habits", { user: USER_A, method: "POST", body: valid }))).json(),
    );
    expect(second.order).toBe(1);
    expect((await db.habit.findMany({ where: { userId: USER_A } })).length).toBe(2);
    expect((await db.habit.findMany({ where: { userId: USER_B } })).length).toBe(0);
  });
  it("vincula o template pelo slug", async () => {
    const cat = await db.category.create({ data: { slug: "mente", namePt: "Mente", nameEn: "Mind", order: 1 } });
    const tpl = await db.habitTemplate.create({
      data: { slug: "ler", categoryId: cat.id, namePt: "Ler", nameEn: "Read", emoji: "📚", defaultGoalValue: 15, goalUnit: "PAGES", defaultDays: [0], order: 1 },
    });
    const res = await POST(req("/api/v1/habits", { user: USER_A, method: "POST", body: { ...valid, templateSlug: "ler" } }));
    expect(habitDto.parse(await res.json()).templateId).toBe(tpl.id);
  });
  it("rejeita template inexistente", async () => {
    const res = await POST(req("/api/v1/habits", { user: USER_A, method: "POST", body: { ...valid, templateSlug: "nao-existe" } }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.fields.templateSlug).toBeDefined();
  });
  it("valida emoji, dias e meta", async () => {
    const res = await POST(
      req("/api/v1/habits", { user: USER_A, method: "POST", body: { ...valid, emoji: "oi", days: [], goalValue: 0 } }),
    );
    expect(res.status).toBe(400);
    expect(Object.keys((await res.json()).error.fields).sort()).toEqual(["days", "emoji", "goalValue"]);
  });
  it("exige sessão", async () => {
    expect((await POST(req("/api/v1/habits", { method: "POST", body: valid }))).status).toBe(401);
  });
});

describe("GET /v1/habits", () => {
  it("lista só os ativos do usuário, por ordem", async () => {
    await seedHabit(USER_A, { name: "B", order: 1 });
    await seedHabit(USER_A, { name: "A", order: 0 });
    await seedHabit(USER_A, { name: "Arquivado", archivedAt: new Date() });
    await seedHabit(USER_B, { name: "Alheio" });
    const res = await GET(req("/api/v1/habits", { user: USER_A }));
    expect(habitList.parse(await res.json()).habits.map((h) => h.name)).toEqual(["A", "B"]);
  });
});

describe("PATCH /v1/habits/:id", () => {
  it("edita sem apagar campos ausentes", async () => {
    const habit = await seedHabit(USER_A, { reminders: ["08:00"], quickActions: false });
    const res = await PATCH(
      req(`/api/v1/habits/${habit.id}`, { user: USER_A, method: "PATCH", body: { name: "Hidratar" } }),
      { id: habit.id as string },
    );
    expect(habitDto.parse(await res.json())).toMatchObject({ name: "Hidratar", reminders: ["08:00"], quickActions: false });
  });
  it("rejeita corpo vazio e id malformado", async () => {
    const habit = await seedHabit(USER_A);
    const empty = await PATCH(req("/x", { user: USER_A, method: "PATCH", body: {} }), { id: habit.id as string });
    expect(empty.status).toBe(400);
    const bad = await PATCH(req("/x", { user: USER_A, method: "PATCH", body: { name: "x" } }), { id: "abc" });
    expect(bad.status).toBe(404);
  });
});

describe("DELETE /v1/habits/:id", () => {
  it("arquiva preservando o histórico", async () => {
    const habit = await seedHabit(USER_A);
    await db.habitLog.create({ data: { habitId: habit.id, userId: USER_A, date: "2026-11-01" } });
    const res = await DELETE(req("/x", { user: USER_A, method: "DELETE" }), { id: habit.id as string });
    expect(res.status).toBe(200);
    expect((await db.habit.findUnique({ where: { id: habit.id } }))?.archivedAt).toBeInstanceOf(Date);
    expect(await db.habitLog.count()).toBe(1);
  });
  it("com ?hard=true exclui hábito e logs", async () => {
    const habit = await seedHabit(USER_A);
    await db.habitLog.create({ data: { habitId: habit.id, userId: USER_A, date: "2026-11-01" } });
    const res = await DELETE(req("/x?hard=true", { user: USER_A, method: "DELETE" }), { id: habit.id as string });
    expect(res.status).toBe(200);
    expect(await db.habit.count()).toBe(0);
    expect(await db.habitLog.count()).toBe(0);
  });
});

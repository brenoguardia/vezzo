import { beforeEach, describe, expect, it, vi } from "vitest";
import { db, installFakeSession, req, seedHabit, USER_A, USER_B } from "@/server/testing/harness";
import { GET, PUT } from "@/app/api/v1/logs/index+api";
import { POST as BATCH } from "@/app/api/v1/logs/batch+api";
import { logBatchResult, logDto, logList } from "@/shared/schemas";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});


const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const put = (user: string | undefined, body: unknown) => PUT(req("/api/v1/logs", { user, method: "PUT", body }));

describe("PUT /v1/logs", () => {
  it("conclui o dia quando value atinge a meta", async () => {
    const habit = await seedHabit(USER_A);
    const res = await put(USER_A, { clientId: uuid(1), habitId: habit.id, date: "2026-11-09", value: 2.5 });
    expect(res.status).toBe(200);
    const dto = logDto.parse(await res.json());
    expect(dto).toMatchObject({ value: 2.5, status: "DONE", source: "APP", clientId: uuid(1) });
    expect(dto.completedAt).not.toBeNull();
  });
  it("é upsert por (hábito, data)", async () => {
    const habit = await seedHabit(USER_A);
    await put(USER_A, { clientId: uuid(1), habitId: habit.id, date: "2026-11-09", value: 1 });
    await put(USER_A, { clientId: uuid(2), habitId: habit.id, date: "2026-11-09", value: 2 });
    const rows = await db.habitLog.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ value: 2, status: "PENDING", clientId: uuid(2) });
  });
  it("é idempotente por clientId (reenvio da mesma requisição)", async () => {
    const habit = await seedHabit(USER_A);
    await put(USER_A, { clientId: uuid(1), habitId: habit.id, date: "2026-11-09", value: 1 });
    // Mesmo clientId com outro valor: é um reenvio, nada muda.
    const replay = await put(USER_A, { clientId: uuid(1), habitId: habit.id, date: "2026-11-09", value: 2 });
    expect(logDto.parse(await replay.json()).value).toBe(1);
    expect(await db.habitLog.count()).toBe(1);
  });
  it("ignora reenvio de clientId antigo depois de um mais novo", async () => {
    const habit = await seedHabit(USER_A);
    await put(USER_A, { clientId: uuid(1), habitId: habit.id, date: "2026-11-09", value: 1 });
    await put(USER_A, { clientId: uuid(2), habitId: habit.id, date: "2026-11-09", value: 2 });
    const replay = await put(USER_A, { clientId: uuid(1), habitId: habit.id, date: "2026-11-09", value: 1 });
    expect(logDto.parse(await replay.json()).value).toBe(2);
  });
  it("guarda só os 50 clientIds mais recentes por log", async () => {
    const habit = await seedHabit(USER_A);
    for (let i = 1; i <= 60; i++) {
      await put(USER_A, { clientId: uuid(i), habitId: habit.id, date: "2026-11-09", value: i });
    }
    const [row] = await db.habitLog.findMany();
    expect(row.appliedClientIds).toHaveLength(50);
    expect(row.appliedClientIds).toContain(uuid(60));
    expect(row.appliedClientIds).not.toContain(uuid(1));
  });
  it("registra SKIPPED e origem da notificação", async () => {
    const habit = await seedHabit(USER_A);
    const res = await put(USER_A, { clientId: uuid(1), habitId: habit.id, date: "2026-11-09", status: "SKIPPED", source: "NOTIFICATION" });
    expect(logDto.parse(await res.json())).toMatchObject({ status: "SKIPPED", source: "NOTIFICATION" });
  });
  it("valida o corpo", async () => {
    const res = await put(USER_A, { clientId: "x", habitId: "y", date: "09/11/2026" });
    expect(res.status).toBe(400);
    expect(Object.keys((await res.json()).error.fields).sort()).toEqual(["clientId", "date", "habitId"]);
  });
});

describe("POST /v1/logs/batch", () => {
  const batch = (user: string, items: unknown[]) => BATCH(req("/api/v1/logs/batch", { user, method: "POST", body: { items } }));
  it("aplica a fila e separa itens rejeitados", async () => {
    const mine = await seedHabit(USER_A);
    const theirs = await seedHabit(USER_B);
    const res = await batch(USER_A, [
      { clientId: uuid(1), habitId: mine.id, date: "2026-11-08", status: "DONE" },
      { clientId: uuid(2), habitId: theirs.id, date: "2026-11-08", status: "DONE" },
    ]);
    const body = logBatchResult.parse(await res.json());
    expect(body.applied).toHaveLength(1);
    expect(body.rejected).toEqual([{ clientId: uuid(2), code: "NOT_FOUND" }]);
  });
  it("limita a 200 itens", async () => {
    const habit = await seedHabit(USER_A);
    const items = Array.from({ length: 201 }, (_, i) => ({ clientId: uuid(i), habitId: habit.id, date: "2026-11-08" }));
    expect((await batch(USER_A, items)).status).toBe(400);
  });
});

describe("GET /v1/logs", () => {
  it("devolve os logs do período do usuário", async () => {
    const habit = await seedHabit(USER_A);
    for (const date of ["2026-11-01", "2026-11-05", "2026-11-20"]) {
      await db.habitLog.create({ data: { habitId: habit.id, userId: USER_A, date } });
    }
    const res = await GET(req("/api/v1/logs?from=2026-11-02&to=2026-11-10", { user: USER_A }));
    expect(logList.parse(await res.json()).logs.map((l) => l.date)).toEqual(["2026-11-05"]);
  });
  it("valida o período", async () => {
    expect((await GET(req("/api/v1/logs", { user: USER_A }))).status).toBe(400);
    expect((await GET(req("/api/v1/logs?from=2026-11-10&to=2026-11-01", { user: USER_A }))).status).toBe(400);
    expect((await GET(req("/api/v1/logs?from=2020-01-01&to=2026-11-01", { user: USER_A }))).status).toBe(400);
  });
});

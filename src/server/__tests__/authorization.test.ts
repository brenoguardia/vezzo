import { beforeEach, describe, expect, it, vi } from "vitest";
import { db, installFakeSession, req, seedHabit, seedProfile, USER_A, USER_B } from "@/server/testing/harness";
import { GET as listHabits, POST as createHabit } from "@/app/api/v1/habits/index+api";
import { DELETE as removeHabit, PATCH as editHabit } from "@/app/api/v1/habits/[id]+api";
import { GET as listLogs, PUT as putLog } from "@/app/api/v1/logs/index+api";
import { POST as batchLogs } from "@/app/api/v1/logs/batch+api";
import { GET as getCatalog } from "@/app/api/v1/catalog+api";
import { GET as getProfile, PUT as putProfile } from "@/app/api/v1/profile+api";
import { DELETE as deleteAccount } from "@/app/api/v1/account+api";
import { GET as getStats } from "@/app/api/v1/stats+api";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});


const id = "0000000000000000000000aa";
const uuid = "00000000-0000-4000-8000-000000000001";

describe("sem sessão, toda rota /v1 responde 401", () => {
  const cases: [string, (r: Request, p?: Record<string, string>) => Promise<Response>, string, string][] = [
    ["GET catalog", getCatalog, "GET", "/api/v1/catalog"],
    ["GET profile", getProfile, "GET", "/api/v1/profile"],
    ["PUT profile", putProfile, "PUT", "/api/v1/profile"],
    ["GET habits", listHabits, "GET", "/api/v1/habits"],
    ["POST habits", createHabit, "POST", "/api/v1/habits"],
    ["PATCH habit", editHabit, "PATCH", `/api/v1/habits/${id}`],
    ["DELETE habit", removeHabit, "DELETE", `/api/v1/habits/${id}`],
    ["GET logs", listLogs, "GET", "/api/v1/logs?from=2026-11-01&to=2026-11-02"],
    ["PUT logs", putLog, "PUT", "/api/v1/logs"],
    ["POST logs/batch", batchLogs, "POST", "/api/v1/logs/batch"],
    ["DELETE account", deleteAccount, "DELETE", "/api/v1/account"],
    ["GET stats", getStats, "GET", "/api/v1/stats?from=2026-11-01&to=2026-11-02"],
  ];
  it.each(cases)("%s", async (_name, handler, method, url) => {
    const res = await handler(req(url, { method, body: method === "GET" ? undefined : {} }), { id });
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("UNAUTHORIZED");
  });
});

describe("isolamento entre usuários", () => {
  it("B não vê hábitos nem logs de A", async () => {
    const habit = await seedHabit(USER_A);
    await db.habitLog.create({ data: { habitId: habit.id, userId: USER_A, date: "2026-11-05" } });
    const habits = await (await listHabits(req("/api/v1/habits", { user: USER_B }))).json();
    expect(habits.habits).toEqual([]);
    const logs = await (await listLogs(req("/api/v1/logs?from=2026-11-01&to=2026-11-30", { user: USER_B }))).json();
    expect(logs.logs).toEqual([]);
  });
  it("B não edita o hábito de A", async () => {
    const habit = await seedHabit(USER_A, { name: "Original" });
    const res = await editHabit(req("/x", { user: USER_B, method: "PATCH", body: { name: "Invadido" } }), { id: habit.id as string });
    expect(res.status).toBe(404);
    expect((await db.habit.findUnique({ where: { id: habit.id } }))?.name).toBe("Original");
  });
  it("B não arquiva nem exclui o hábito de A", async () => {
    const habit = await seedHabit(USER_A);
    await db.habitLog.create({ data: { habitId: habit.id, userId: USER_A, date: "2026-11-05" } });
    for (const url of ["/x", "/x?hard=true"]) {
      const res = await removeHabit(req(url, { user: USER_B, method: "DELETE" }), { id: habit.id as string });
      expect(res.status).toBe(404);
    }
    expect((await db.habit.findUnique({ where: { id: habit.id } }))?.archivedAt).toBeNull();
    expect(await db.habitLog.count()).toBe(1);
  });
  it("B não registra progresso no hábito de A", async () => {
    const habit = await seedHabit(USER_A);
    const body = { clientId: uuid, habitId: habit.id, date: "2026-11-09", status: "DONE" };
    expect((await putLog(req("/x", { user: USER_B, method: "PUT", body }))).status).toBe(404);
    const batch = await batchLogs(req("/x", { user: USER_B, method: "POST", body: { items: [body] } }));
    expect((await batch.json()).rejected).toHaveLength(1);
    expect(await db.habitLog.count()).toBe(0);
  });
  it("B não altera o perfil de A", async () => {
    await seedProfile(USER_A, { displayName: "Ana" });
    await seedProfile(USER_B, { displayName: "Bia" });
    await putProfile(req("/x", { user: USER_B, method: "PUT", body: { displayName: "Hack" } }));
    expect((await db.profile.findMany({ where: { userId: USER_A } }))[0]).toMatchObject({ displayName: "Ana" });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db, installFakeSession, req, seedHabit, seedProfile, USER_A, USER_B } from "@/server/testing/harness";
import { GET } from "@/app/api/v1/stats+api";
import { statsDto } from "@/shared/schemas";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});


afterEach(() => vi.useRealTimers());

const log = (habitId: unknown, userId: string, date: string, status = "DONE") =>
  db.habitLog.create({ data: { habitId, userId, date, status } });

describe("GET /v1/stats", () => {
  it("calcula sequência, semana e dias com o fuso do perfil", async () => {
    // 01:30 UTC de 10/11 ainda é 09/11 (segunda) em São Paulo.
    vi.useFakeTimers({ now: new Date("2026-11-10T01:30:00Z") });
    await seedProfile(USER_A, { timezone: "America/Sao_Paulo" });
    const habit = await seedHabit(USER_A, { createdAt: new Date("2026-11-01T15:00:00Z") });
    await log(habit.id, USER_A, "2026-11-07");
    await log(habit.id, USER_A, "2026-11-08");

    const res = await GET(req("/api/v1/stats?from=2026-11-07&to=2026-11-09", { user: USER_A }));
    expect(res.status).toBe(200);
    const stats = statsDto.parse(await res.json());
    expect(stats.today).toBe("2026-11-09");
    expect(stats.days.map((d) => d.state)).toEqual(["fulfilled", "fulfilled", "missed"]);
    expect(stats.currentStreak).toBe(2);
    expect(stats.bestStreak).toBe(2);
    expect(stats.week.current).toMatchObject({ start: "2026-11-09", end: "2026-11-15" });
    expect(stats.habits).toEqual([{ habitId: habit.id, done: 0, scheduled: 7 }]);
    expect(stats.milestones.map((m) => m.reached)).toEqual([false, false, false]);
  });
  it("não considera dados de outros usuários", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-09T15:00:00Z") });
    await seedProfile(USER_A);
    const theirs = await seedHabit(USER_B, { createdAt: new Date("2026-11-01T15:00:00Z") });
    await log(theirs.id, USER_B, "2026-11-08");
    const res = await GET(req("/api/v1/stats?from=2026-11-08&to=2026-11-09", { user: USER_A }));
    const stats = statsDto.parse(await res.json());
    expect(stats.currentStreak).toBe(0);
    expect(stats.habits).toEqual([]);
    expect(stats.days.every((d) => d.scheduled === 0)).toBe(true);
  });
  it("valida o período e exige sessão", async () => {
    expect((await GET(req("/api/v1/stats", { user: USER_A }))).status).toBe(400);
    expect((await GET(req("/api/v1/stats?from=2026-11-01&to=2026-11-02"))).status).toBe(401);
  });
});

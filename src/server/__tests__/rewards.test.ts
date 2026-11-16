import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as claimReward } from "@/app/api/v1/habits/[id]/reward/claim+api";
import { GET as getReward } from "@/app/api/v1/habits/[id]/reward+api";
import { PATCH as editHabit } from "@/app/api/v1/habits/[id]+api";
import { POST as createHabit } from "@/app/api/v1/habits/index+api";
import { db, installFakeSession, req, seedHabit, seedProfile, USER_A, USER_B } from "@/server/testing/harness";

vi.mock("@/server/db", async () => {
  const { createFakeDb } = await import("@/server/testing/fake-db");
  return { prisma: createFakeDb() };
});

beforeEach(() => {
  db.$reset();
  installFakeSession();
});

const habitBody = {
  name: "Meditar",
  emoji: "🧘",
  goalValue: 10,
  goalUnit: "MINUTES",
  days: [0, 1, 2, 3, 4, 5, 6],
};
const reward = { title: "iPhone", emoji: "📱", days: 180 };

describe("presente no hábito", () => {
  it("cria o hábito com presente e define o início como a data local de hoje", async () => {
    await seedProfile(USER_A, { timezone: "America/Sao_Paulo" });
    const res = await createHabit(req("/x", { user: USER_A, method: "POST", body: { ...habitBody, reward } }));
    expect(res.status).toBe(201);
    const dto = await res.json();
    expect(dto.reward).toMatchObject({ title: "iPhone", emoji: "📱", days: 180, claimedAt: null });
    expect(dto.reward.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("sem presente, reward é nulo", async () => {
    await seedProfile(USER_A);
    const dto = await (await createHabit(req("/x", { user: USER_A, method: "POST", body: habitBody }))).json();
    expect(dto.reward).toBeNull();
  });

  it("rejeita duração fora de 1–730 e título vazio", async () => {
    await seedProfile(USER_A);
    for (const bad of [
      { ...reward, days: 0 },
      { ...reward, days: 731 },
      { ...reward, title: "  " },
    ]) {
      const res = await createHabit(req("/x", { user: USER_A, method: "POST", body: { ...habitBody, reward: bad } }));
      expect(res.status).toBe(400);
    }
  });

  it("editar preserva o início; remover e recolocar começa de novo", async () => {
    await seedProfile(USER_A);
    const habit = await seedHabit(USER_A, { rewardTitle: "Viagem", rewardDays: 30, rewardStartDate: "2026-01-10" });
    const id = habit.id as string;
    const edited = await (
      await editHabit(req("/x", { user: USER_A, method: "PATCH", body: { reward: { ...reward, days: 60 } } }), { id })
    ).json();
    expect(edited.reward).toMatchObject({ title: "iPhone", days: 60, startDate: "2026-01-10" });

    const removed = await (
      await editHabit(req("/x", { user: USER_A, method: "PATCH", body: { reward: null } }), { id })
    ).json();
    expect(removed.reward).toBeNull();

    const again = await (
      await editHabit(req("/x", { user: USER_A, method: "PATCH", body: { reward } }), { id })
    ).json();
    expect(again.reward.startDate).not.toBe("2026-01-10");
  });
});

describe("progresso e resgate", () => {
  const seedReward = (userId: string, extra: Record<string, unknown> = {}) =>
    seedHabit(userId, {
      rewardTitle: "Viagem",
      rewardEmoji: "✈️",
      rewardDays: 3,
      rewardStartDate: "2020-01-01",
      createdAt: new Date("2020-01-01T12:00:00Z"),
      ...extra,
    });

  it("devolve o progresso derivado dos logs", async () => {
    await seedProfile(USER_A);
    const habit = await seedReward(USER_A);
    const res = await getReward(req("/x", { user: USER_A }), { id: habit.id as string });
    expect(res.status).toBe(200);
    // Início em 2020 sem nenhum log: o desafio já recomeçou várias vezes e continua ativo.
    expect(await res.json()).toMatchObject({ state: "ACTIVE", currentRun: 0 });
  });

  it("hábito sem presente responde 404", async () => {
    await seedProfile(USER_A);
    const habit = await seedHabit(USER_A);
    expect((await getReward(req("/x", { user: USER_A }), { id: habit.id as string })).status).toBe(404);
  });

  it("não resgata enquanto a meta não foi concluída (409)", async () => {
    await seedProfile(USER_A);
    const habit = await seedReward(USER_A);
    const res = await claimReward(req("/x", { user: USER_A, method: "POST", body: {} }), { id: habit.id as string });
    expect(res.status).toBe(409);
    expect((await db.habit.findUnique({ where: { id: habit.id } }))?.rewardClaimedAt ?? null).toBeNull();
  });

  it("resgata uma vez e repetir é idempotente", async () => {
    await seedProfile(USER_A);
    // Início há muito tempo, com 3 dias consecutivos concluídos: conquista permanente.
    const habit = await seedReward(USER_A);
    for (const date of ["2020-01-01", "2020-01-02", "2020-01-03"]) {
      await db.habitLog.create({ data: { habitId: habit.id, userId: USER_A, date, status: "DONE" } });
    }
    const first = await claimReward(req("/x", { user: USER_A, method: "POST", body: {} }), { id: habit.id as string });
    expect(first.status).toBe(200);
    expect((await first.json()).state).toBe("CLAIMED");
    const stored = (await db.habit.findUnique({ where: { id: habit.id } }))?.rewardClaimedAt;
    expect(stored).toBeTruthy();
    const second = await claimReward(req("/x", { user: USER_A, method: "POST", body: {} }), { id: habit.id as string });
    expect((await second.json()).state).toBe("CLAIMED");
    expect((await db.habit.findUnique({ where: { id: habit.id } }))?.rewardClaimedAt).toEqual(stored);
  });

  it("B não vê nem resgata o presente de A (404)", async () => {
    await seedProfile(USER_A);
    await seedProfile(USER_B);
    const habit = await seedReward(USER_A);
    const id = habit.id as string;
    expect((await getReward(req("/x", { user: USER_B }), { id })).status).toBe(404);
    expect((await claimReward(req("/x", { user: USER_B, method: "POST", body: {} }), { id })).status).toBe(404);
  });

  it("sem sessão responde 401", async () => {
    const id = "0000000000000000000000aa";
    expect((await getReward(req("/x"), { id })).status).toBe(401);
    expect((await claimReward(req("/x", { method: "POST", body: {} }), { id })).status).toBe(401);
  });
});

import { describe, expect, it } from "vitest";
import { type RewardHabit, rewardProgress } from "./reward";
import type { StatLog } from "./stats";

// 2026-11-01 é domingo.
const base: RewardHabit = {
  id: "h1",
  days: [0, 1, 2, 3, 4, 5, 6],
  createdAt: "2026-11-01",
  rewardDays: 5,
  rewardStartDate: "2026-11-01",
  rewardClaimedAt: null,
};
const done = (date: string, status: StatLog["status"] = "DONE"): StatLog => ({ habitId: "h1", date, status });
const doneRange = (...dates: string[]) => dates.map((d) => done(d));

describe("rewardProgress", () => {
  it("sem sequência sem falhas, conta os dias concluídos", () => {
    const p = rewardProgress(base, doneRange("2026-11-01", "2026-11-02", "2026-11-03"), "2026-11-03");
    expect(p).toMatchObject({ state: "ACTIVE", currentRun: 3, daysLeft: 2, attempts: 1, achievedDate: null });
    expect(p.percent).toBeCloseTo(0.6);
  });

  it("hoje ainda aberto não conta nem quebra", () => {
    const p = rewardProgress(base, doneRange("2026-11-01", "2026-11-02"), "2026-11-03");
    expect(p).toMatchObject({ currentRun: 2, attempts: 1 });
  });

  it("falha reinicia a contagem no dia seguinte e guarda o recorde", () => {
    const logs = doneRange("2026-11-01", "2026-11-02", "2026-11-03", "2026-11-05");
    const p = rewardProgress(base, logs, "2026-11-05");
    expect(p).toMatchObject({ currentRun: 1, best: 3, attempts: 2, runStart: "2026-11-05", state: "ACTIVE" });
  });

  it("dia pulado e dia não agendado não quebram a sequência", () => {
    const weekdays: RewardHabit = { ...base, days: [0, 1, 2, 3, 4] }; // segunda a sexta
    const logs = [
      done("2026-11-02"),
      done("2026-11-03", "SKIPPED"),
      done("2026-11-04"),
      done("2026-11-05"),
      done("2026-11-06"),
    ];
    // Sábado e domingo não são agendados: o tempo corre sem falha.
    const p = rewardProgress({ ...weekdays, rewardStartDate: "2026-11-02", rewardDays: 30 }, logs, "2026-11-08");
    expect(p).toMatchObject({ attempts: 1, currentRun: 7 });
  });

  it("conquista na data em que a sequência atinge a duração", () => {
    const logs = doneRange("2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05");
    const p = rewardProgress(base, logs, "2026-11-05");
    expect(p).toMatchObject({ state: "ACHIEVED", achievedDate: "2026-11-05", daysLeft: 0, percent: 1 });
  });

  it("conquista é permanente mesmo com falha depois", () => {
    const logs = doneRange("2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05");
    const p = rewardProgress(base, logs, "2026-11-08");
    expect(p).toMatchObject({ state: "ACHIEVED", achievedDate: "2026-11-05" });
  });

  it("presente resgatado vira CLAIMED", () => {
    const logs = doneRange("2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05");
    const p = rewardProgress({ ...base, rewardClaimedAt: "2026-11-06T10:00:00.000Z" }, logs, "2026-11-06");
    expect(p.state).toBe("CLAIMED");
  });

  it("duração de 1 dia conquista no próprio dia concluído", () => {
    const p = rewardProgress({ ...base, rewardDays: 1 }, doneRange("2026-11-01"), "2026-11-01");
    expect(p.state).toBe("ACHIEVED");
  });

  it("início no futuro ainda não tem progresso", () => {
    const p = rewardProgress({ ...base, rewardStartDate: "2026-11-10" }, [], "2026-11-03");
    expect(p).toMatchObject({ state: "ACTIVE", currentRun: 0, attempts: 1, daysLeft: 5 });
  });
});

import { describe, expect, it } from "vitest";
import {
  bestDay,
  bestStreak,
  currentStreak,
  dailyStats,
  dayStats,
  habitWeekProgress,
  milestones,
  type StatHabit,
  type StatLog,
  scheduled,
  weekComparison,
  weekCompletion,
} from "./stats";

// 2026-11-01 é domingo; 2026-11-09 é segunda.
const daily: StatHabit = { id: "h1", days: [0, 1, 2, 3, 4, 5, 6], createdAt: "2026-11-01" };
const mwf: StatHabit = { id: "h2", days: [0, 2, 4], createdAt: "2026-11-01" };
const log = (habitId: string, date: string, status: StatLog["status"] = "DONE"): StatLog => ({
  habitId,
  date,
  status,
});

describe("scheduled", () => {
  it("exige o dia da semana agendado", () => {
    expect(scheduled(mwf, "2026-11-02")).toBe(true);
    expect(scheduled(mwf, "2026-11-03")).toBe(false);
  });
  it("não agenda antes da criação", () => {
    expect(scheduled(mwf, "2026-10-30")).toBe(false);
  });
  it("não agenda a partir do arquivamento", () => {
    const archived = { ...daily, archivedOn: "2026-11-05" };
    expect(scheduled(archived, "2026-11-04")).toBe(true);
    expect(scheduled(archived, "2026-11-05")).toBe(false);
  });
});

describe("dayStats", () => {
  it("calcula feitos/agendados", () => {
    const s = dayStats([daily, mwf], [log("h1", "2026-11-02")], "2026-11-02");
    expect(s).toMatchObject({ scheduled: 2, done: 1, counted: 2, completion: 0.5, state: "missed" });
  });
  it("ignora SKIPPED no denominador", () => {
    const s = dayStats([daily, mwf], [log("h1", "2026-11-02"), log("h2", "2026-11-02", "SKIPPED")], "2026-11-02");
    expect(s).toMatchObject({ counted: 1, skipped: 1, completion: 1, state: "fulfilled" });
  });
  it("dia sem hábitos agendados é neutro", () => {
    expect(dayStats([mwf], [], "2026-11-03")).toMatchObject({ scheduled: 0, completion: 0, state: "neutral" });
  });
  it("dia com tudo pulado é neutro", () => {
    expect(dayStats([mwf], [log("h2", "2026-11-02", "SKIPPED")], "2026-11-02").state).toBe("neutral");
  });
  it("ignora logs de hábito não agendado no dia", () => {
    expect(dayStats([mwf], [log("h2", "2026-11-03")], "2026-11-03").done).toBe(0);
  });
});

describe("dailyStats", () => {
  it("devolve um item por dia do intervalo", () => {
    const days = dailyStats([daily], [], "2026-11-02", "2026-11-04");
    expect(days.map((d) => d.date)).toEqual(["2026-11-02", "2026-11-03", "2026-11-04"]);
  });
});

describe("currentStreak", () => {
  it("é 0 sem hábitos", () => {
    expect(currentStreak([], [], "2026-11-09")).toBe(0);
  });
  it("não zera durante o dia quando hoje ainda está pendente", () => {
    const logs = ["05", "06", "07", "08"].map((d) => log("h1", `2026-11-${d}`));
    expect(currentStreak([daily], logs, "2026-11-09")).toBe(4);
  });
  it("soma hoje quando cumprido", () => {
    const logs = ["05", "06", "07", "08", "09"].map((d) => log("h1", `2026-11-${d}`));
    expect(currentStreak([daily], logs, "2026-11-09")).toBe(5);
  });
  it("um dia perdido quebra a sequência", () => {
    const logs = [log("h1", "2026-11-08"), log("h1", "2026-11-09")];
    expect(currentStreak([daily], logs, "2026-11-09")).toBe(2);
  });
  it("dias sem hábitos agendados não quebram nem somam", () => {
    const logs = ["02", "04", "06", "09"].map((d) => log("h2", `2026-11-${d}`));
    expect(currentStreak([mwf], logs, "2026-11-09")).toBe(4);
  });
  it("SKIPPED não quebra a sequência", () => {
    const logs = [log("h1", "2026-11-06"), log("h1", "2026-11-07", "SKIPPED"), log("h1", "2026-11-08")];
    expect(currentStreak([daily], logs, "2026-11-08")).toBe(2);
  });
});

describe("bestStreak", () => {
  it("guarda o recorde mesmo após quebra", () => {
    const logs = ["02", "03", "04", "06", "07"].map((d) => log("h1", `2026-11-${d}`));
    expect(bestStreak([daily], logs, "2026-11-07")).toBe(3);
    expect(currentStreak([daily], logs, "2026-11-07")).toBe(2);
  });
});

describe("weekCompletion", () => {
  const logs = [
    ...["02", "03", "04", "05", "06"].map((d) => log("h1", `2026-11-${d}`)),
    log("h2", "2026-11-02"),
    log("h2", "2026-11-04"),
  ];
  it("pondera por hábitos agendados nos 7 dias (segunda a domingo)", () => {
    const week = weekCompletion([daily, mwf], logs, "2026-11-05");
    expect(week).toMatchObject({ start: "2026-11-02", end: "2026-11-08", done: 7, counted: 10 });
    expect(week.completion).toBeCloseTo(0.7);
  });
  it("compara com a semana anterior", () => {
    const cmp = weekComparison([daily, mwf], logs, "2026-11-05");
    expect(cmp.current.completion).toBeCloseTo(0.7);
    expect(cmp.previous?.completion).toBe(0);
    expect(cmp.delta).toBeCloseTo(0.7);
  });
  it("sem semana anterior comparável, delta é null", () => {
    const novo = { ...daily, createdAt: "2026-11-02" };
    const cmp = weekComparison([novo], [], "2026-11-05");
    expect(cmp.previous).toBeNull();
    expect(cmp.delta).toBeNull();
  });
});

describe("habitWeekProgress", () => {
  it("conta concluídos/agendados por hábito", () => {
    const logs = [
      ...["02", "03", "04", "05", "06"].map((d) => log("h1", `2026-11-${d}`)),
      log("h2", "2026-11-02"),
      log("h2", "2026-11-04"),
    ];
    expect(habitWeekProgress([daily, mwf], logs, "2026-11-05")).toEqual([
      { habitId: "h1", done: 5, scheduled: 7 },
      { habitId: "h2", done: 2, scheduled: 3 },
    ]);
  });
});

describe("bestDay", () => {
  it("é o dia da semana com maior média", () => {
    const logs = [log("h1", "2026-11-02"), log("h1", "2026-11-09")];
    expect(bestDay([daily], logs, "2026-11-09")).toBe(0);
  });
  it("é null sem histórico", () => {
    expect(bestDay([], [], "2026-11-09")).toBeNull();
  });
});

describe("milestones", () => {
  it("marca 15, 30 e 100 dias", () => {
    expect(milestones(20)).toEqual([
      { days: 15, reached: true },
      { days: 30, reached: false },
      { days: 100, reached: false },
    ]);
  });
});

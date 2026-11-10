import { describe, expect, it } from "@jest/globals";
import type { HabitDto } from "@/shared/schemas";
import {
  canSnooze,
  MAX_PER_DAY,
  minutesUntil,
  planReminders,
  pruneSnoozes,
  registerSnooze,
  toExpoWeekday,
} from "./schedule";

const habit = (id: string, over: Partial<HabitDto> = {}): HabitDto => ({
  id,
  templateId: null,
  name: id,
  emoji: "💧",
  goalValue: 1,
  goalUnit: "BOOLEAN",
  days: [0, 1, 2, 3, 4, 5, 6],
  reminders: ["08:00"],
  quickActions: true,
  order: 0,
  archivedAt: null,
  createdAt: "2026-10-01T00:00:00.000Z",
  ...over,
});
const NOW = { today: "2026-11-11", minute: 12 * 60 }; // quarta, 12:00

describe("toExpoWeekday", () => {
  it("converte 0=segunda…6=domingo para 1=domingo…7=sábado", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(toExpoWeekday)).toEqual([2, 3, 4, 5, 6, 7, 1]);
  });
});

describe("planReminders", () => {
  it("um gatilho por horário × dia, com hora e minuto", () => {
    const plans = planReminders([habit("a", { days: [0, 6], reminders: ["07:30", "21:05"] })], NOW);
    expect(plans).toHaveLength(4);
    expect(plans.filter((p) => p.day === 6).map((p) => [p.weekday, p.hour, p.minute])).toEqual([
      [1, 7, 30],
      [1, 21, 5],
    ]);
  });

  it("ignora arquivados, sem lembrete e duplicados", () => {
    const plans = planReminders(
      [
        habit("arq", { archivedAt: "2026-11-01T00:00:00.000Z" }),
        habit("sem", { reminders: [] }),
        habit("dup", { reminders: ["08:00", "08:00"], days: [1, 1] }),
      ],
      NOW,
    );
    expect(plans).toHaveLength(1);
  });

  it("respeita o teto de 8 por dia, mantendo os mais cedo", () => {
    const many = Array.from({ length: 10 }, (_, i) => habit(`h${i}`, { days: [2], reminders: [`${String(8 + i).padStart(2, "0")}:00`] }));
    const plans = planReminders(many, NOW);
    expect(plans).toHaveLength(MAX_PER_DAY);
    expect(Math.max(...plans.map((p) => p.hour))).toBe(15);
  });

  it("acima do limite do iOS, prioriza os próximos horários", () => {
    const plans = planReminders(
      [habit("a", { reminders: ["13:00", "07:00"] })], // 14 gatilhos
      NOW,
      3,
    );
    expect(plans).toHaveLength(3);
    // quarta 13:00 (1h), quinta 07:00 (19h), quinta 13:00 (25h)
    expect(plans.map((p) => `${p.day}-${p.time}`).sort()).toEqual(["2-13:00", "3-07:00", "3-13:00"]);
  });

  it("propaga quickActions", () => {
    expect(planReminders([habit("a", { quickActions: false })], NOW)[0]?.quickActions).toBe(false);
  });
});

describe("minutesUntil", () => {
  it("mesmo dia, mais tarde", () => {
    expect(minutesUntil({ day: 2, hour: 13, minute: 0 }, NOW.today, NOW.minute)).toBe(60);
  });
  it("mesmo dia, já passou: próxima semana", () => {
    expect(minutesUntil({ day: 2, hour: 8, minute: 0 }, NOW.today, NOW.minute)).toBe(7 * 1440 - 240);
  });
  it("virada de semana", () => {
    expect(minutesUntil({ day: 0, hour: 0, minute: 0 }, NOW.today, NOW.minute)).toBe(5 * 1440 - 720);
  });
});

describe("adiamentos", () => {
  const D = "2026-11-10";
  it("limita a 3 por dia por hábito", () => {
    let counts = {};
    for (let i = 0; i < 3; i++) {
      expect(canSnooze(counts, "a", D)).toBe(true);
      counts = registerSnooze(counts, "a", D);
    }
    expect(canSnooze(counts, "a", D)).toBe(false);
    expect(canSnooze(counts, "b", D)).toBe(true);
  });
  it("recomeça no dia seguinte", () => {
    let counts = {};
    for (let i = 0; i < 3; i++) counts = registerSnooze(counts, "a", D);
    expect(canSnooze(counts, "a", "2026-11-11")).toBe(true);
    expect(registerSnooze(counts, "a", "2026-11-11")).toEqual({ a: { date: "2026-11-11", count: 1 } });
  });
  it("pruneSnoozes descarta dias antigos", () => {
    expect(pruneSnoozes({ a: { date: "2026-11-01", count: 3 }, b: { date: "2026-11-10", count: 1 } }, "2026-11-10")).toEqual({
      b: { date: "2026-11-10", count: 1 },
    });
  });
});

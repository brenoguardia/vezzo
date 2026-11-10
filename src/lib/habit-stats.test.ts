import { describe, expect, it } from "@jest/globals";
import type { HabitDto } from "@/shared/schemas";
import { dayOfYear, toStatHabit, toStatLogs } from "./habit-stats";

const habit: HabitDto = {
  id: "507f1f77bcf86cd799439011",
  templateId: null,
  name: "Ler",
  emoji: "📖",
  goalValue: 15,
  goalUnit: "PAGES",
  days: [0, 2],
  reminders: [],
  quickActions: true,
  order: 0,
  archivedAt: null,
  createdAt: "2026-11-10T01:30:00.000Z",
};

describe("toStatHabit", () => {
  it("usa a data local do fuso do usuário (não UTC)", () => {
    expect(toStatHabit(habit, "America/Sao_Paulo").createdAt).toBe("2026-11-09");
    expect(toStatHabit(habit, "UTC").createdAt).toBe("2026-11-10");
  });
  it("converte archivedAt", () => {
    const h = toStatHabit({ ...habit, archivedAt: "2026-11-12T12:00:00.000Z" }, "UTC");
    expect(h.archivedOn).toBe("2026-11-12");
  });
});

describe("toStatLogs", () => {
  it("separa hábito e data da chave", () => {
    expect(toStatLogs({ "abc:2026-11-10": { value: 1, status: "DONE" } })).toEqual([
      { habitId: "abc", date: "2026-11-10", status: "DONE" },
    ]);
  });
});

describe("dayOfYear", () => {
  it("conta a partir de 1", () => {
    expect(dayOfYear("2026-01-01")).toBe(1);
    expect(dayOfYear("2026-12-31")).toBe(365);
  });
});

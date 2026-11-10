import { describe, expect, it } from "@jest/globals";
import type { HabitDto } from "@/shared/schemas";
import { activeHabits, todayItems, todaySummary } from "./selectors";

const mk = (id: string, over: Partial<HabitDto> = {}): HabitDto => ({
  id,
  templateId: null,
  name: id,
  emoji: "💧",
  goalValue: 1,
  goalUnit: "BOOLEAN",
  days: [0, 1, 2, 3, 4, 5, 6],
  reminders: [],
  quickActions: true,
  order: 0,
  archivedAt: null,
  createdAt: "2026-10-01T12:00:00.000Z",
  ...over,
});
const D = "2026-11-10"; // terça (índice 1)

describe("todayItems", () => {
  it("filtra por dia agendado, arquivados e ordena", () => {
    const habits = [
      mk("b", { order: 2 }),
      mk("a", { order: 1 }),
      mk("seg", { days: [0] }),
      mk("arq", { archivedAt: "2026-11-01T00:00:00.000Z" }),
    ];
    expect(todayItems(habits, {}, D, "UTC").map((i) => i.habit.id)).toEqual(["a", "b"]);
  });
  it("anexa o log do dia", () => {
    const items = todayItems([mk("a")], { [`a:${D}`]: { value: 1, status: "DONE" } }, D, "UTC");
    expect(items[0]?.log?.status).toBe("DONE");
  });
});

describe("todaySummary", () => {
  it("conta feitos e agendados ignorando arquivados", () => {
    const habits = [mk("a"), mk("b"), mk("arq", { archivedAt: "2026-11-01T00:00:00.000Z" })];
    const s = todaySummary(habits, { [`a:${D}`]: { value: 1, status: "DONE" } }, D, "UTC");
    expect(s).toMatchObject({ done: 1, counted: 2 });
  });
});

describe("activeHabits", () => {
  it("remove arquivados", () => {
    expect(activeHabits([mk("a"), mk("b", { archivedAt: "x" })]).map((h) => h.id)).toEqual(["a"]);
  });
});

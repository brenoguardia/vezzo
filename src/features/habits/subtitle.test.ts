import { beforeEach, describe, expect, it } from "@jest/globals";
import { setLocale } from "@/i18n";
import type { HabitDto } from "@/shared/schemas";
import { habitSubtitle } from "./subtitle";

const habit = (over: Partial<HabitDto>): HabitDto => ({
  id: "a",
  templateId: null,
  name: "x",
  emoji: "💧",
  goalValue: 2.5,
  goalUnit: "LITERS",
  days: [0],
  reminders: [],
  quickActions: true,
  order: 0,
  archivedAt: null,
  createdAt: "2026-11-01T00:00:00.000Z",
  ...over,
});

beforeEach(() => setLocale("pt-BR"));

describe("habitSubtitle", () => {
  it("progresso numérico", () => {
    expect(habitSubtitle(habit({}), { value: 1.8, status: "PENDING" }, "pt-BR", "UTC")).toBe("1,8 / 2,5 L");
    expect(habitSubtitle(habit({}), undefined, "pt-BR", "UTC")).toBe("0 / 2,5 L");
  });
  it("concluído com hora no fuso do usuário", () => {
    const log = { value: 2.5, status: "DONE" as const, completedAt: "2026-11-10T10:30:00.000Z" };
    expect(habitSubtitle(habit({}), log, "pt-BR", "America/Sao_Paulo")).toBe("2,5 L · concluído 07:30");
  });
  it("sim/não", () => {
    const b = habit({ goalValue: 1, goalUnit: "BOOLEAN" });
    expect(habitSubtitle(b, undefined, "pt-BR", "UTC")).toBe("Sim ou não");
    const log = { value: 1, status: "DONE" as const, completedAt: "2026-11-10T12:05:00.000Z" };
    expect(habitSubtitle(b, log, "pt-BR", "UTC")).toBe("Concluído 12:05");
  });
  it("pulado", () => {
    expect(habitSubtitle(habit({}), { value: 0, status: "SKIPPED" }, "pt-BR", "UTC")).toBe("Pulado");
  });
});

import type { Habit, HabitLog, HabitNote, Profile } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { toHabitDto, toLogDto, toNoteDto, toProfileDto } from "@/server/mappers";
import { DEFAULT_REWARD_EMOJI } from "@/shared/schemas";

const at = new Date("2026-11-10T12:00:00.000Z");

const habit = (overrides: Partial<Habit> = {}): Habit =>
  ({
    id: "h1",
    userId: "u1",
    templateId: null,
    name: "Beber água",
    emoji: "💧",
    goalValue: 2.5,
    goalUnit: "LITERS",
    days: [0, 1, 2],
    reminders: ["08:00"],
    quickActions: true,
    order: 0,
    archivedAt: null,
    createdAt: at,
    rewardTitle: null,
    rewardEmoji: null,
    rewardDays: null,
    rewardStartDate: null,
    rewardClaimedAt: null,
    ...overrides,
  }) as Habit;

describe("toProfileDto", () => {
  const profile = (language: string) =>
    ({
      displayName: "Ana",
      accent: "#b9d94c",
      themeMode: "DARK",
      language,
      timezone: "America/Sao_Paulo",
      onboardingDone: true,
      createdAt: at,
    }) as Profile;

  it("serializa a data e preserva en", () => {
    expect(toProfileDto(profile("en"))).toMatchObject({ language: "en", createdAt: at.toISOString() });
  });
  it("qualquer outro idioma cai em pt-BR", () => {
    expect(toProfileDto(profile("fr")).language).toBe("pt-BR");
  });
});

describe("toHabitDto", () => {
  it("sem presente: reward null e arquivamento null", () => {
    expect(toHabitDto(habit())).toMatchObject({ reward: null, archivedAt: null, createdAt: at.toISOString() });
  });

  it("com presente completo: monta o objeto e usa o emoji padrão quando falta", () => {
    const dto = toHabitDto(
      habit({ rewardTitle: "Controle PS5", rewardDays: 90, rewardStartDate: "2026-11-01", rewardEmoji: null }),
    );
    expect(dto.reward).toEqual({
      title: "Controle PS5",
      emoji: DEFAULT_REWARD_EMOJI,
      days: 90,
      startDate: "2026-11-01",
      claimedAt: null,
    });
  });

  it("presente incompleto (sem dias ou início) não vaza para o cliente", () => {
    expect(
      toHabitDto(habit({ rewardTitle: "Algo", rewardDays: null, rewardStartDate: "2026-11-01" })).reward,
    ).toBeNull();
    expect(toHabitDto(habit({ rewardTitle: "Algo", rewardDays: 30, rewardStartDate: null })).reward).toBeNull();
  });

  it("resgate e arquivamento viram ISO", () => {
    const dto = toHabitDto(
      habit({ archivedAt: at, rewardTitle: "x", rewardDays: 30, rewardStartDate: "2026-11-01", rewardClaimedAt: at }),
    );
    expect(dto.archivedAt).toBe(at.toISOString());
    expect(dto.reward?.claimedAt).toBe(at.toISOString());
  });
});

describe("toLogDto e toNoteDto", () => {
  it("log sem conclusão mantém completedAt null", () => {
    const log: HabitLog = {
      id: "l1",
      userId: "u1",
      habitId: "h1",
      date: "2026-11-10",
      value: 1,
      status: "DONE",
      source: "APP",
      completedAt: null,
      clientId: "c1",
      appliedClientIds: [],
      updatedAt: at,
    };
    expect(toLogDto(log)).toMatchObject({ completedAt: null, clientId: "c1" });
    expect(toLogDto({ ...log, completedAt: at }).completedAt).toBe(at.toISOString());
  });

  it("anotação serializa as duas datas", () => {
    const n = { id: "n1", habitId: "h1", date: "2026-11-10", text: "oi", createdAt: at, updatedAt: at } as HabitNote;
    expect(toNoteDto(n)).toEqual({
      id: "n1",
      habitId: "h1",
      date: "2026-11-10",
      text: "oi",
      createdAt: at.toISOString(),
      updatedAt: at.toISOString(),
    });
  });
});

import { afterEach, describe, expect, it } from "@jest/globals";
import { i18n } from "@/i18n";

const original = i18n.locale;

describe("plural de dias", () => {
  afterEach(() => {
    i18n.locale = original;
  });

  it.each([
    ["pt-BR", "progress.streakDays", 0, "0 dias"],
    ["pt-BR", "progress.streakDays", 1, "1 dia"],
    ["pt-BR", "progress.streakDays", 2, "2 dias"],
    ["pt-BR", "home.streakDays", 1, "Sequência de 1 dia"],
    ["pt-BR", "habit.reward.best", 1, "Melhor sequência: 1 dia"],
    ["pt-BR", "streakScreen.record", 1, "Recorde: 1 dia"],
    ["en", "progress.streakDays", 0, "0 days"],
    ["en", "progress.streakDays", 1, "1 day"],
    ["en", "progress.streakDays", 5, "5 days"],
    ["en", "habit.reward.best", 1, "Best streak: 1 day"],
    ["en", "streakScreen.record", 1, "Best: 1 day"],
  ])("%s %s com %i", (locale, key, count, expected) => {
    i18n.locale = locale;
    expect(i18n.t(key, { count })).toBe(expected);
  });
});

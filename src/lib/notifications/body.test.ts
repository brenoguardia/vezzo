import { beforeEach, describe, expect, it } from "@jest/globals";
import { setLocale } from "@/i18n";
import { motivationalBody, reminderTitle } from "./body";

beforeEach(() => setLocale("pt-BR"));

describe("reminderTitle", () => {
  it("usa o nome em minúscula", () => {
    expect(reminderTitle({ name: "Ler" })).toBe("Hora de ler");
    expect(reminderTitle({ name: "Beber água" })).toBe("Hora de beber água");
  });
});

describe("motivationalBody", () => {
  const pages = { goalValue: 15, goalUnit: "PAGES" as const };
  it("meta numérica com sequência", () => {
    expect(motivationalBody(pages, "Ana", 12, "pt-BR")).toBe("Ana, 15 pág. hoje mantêm sua sequência de 12 dias.");
  });
  it("sem sequência", () => {
    expect(motivationalBody(pages, "Ana", 0, "pt-BR")).toBe("Ana, 15 pág. hoje começam sua sequência.");
  });
  it("sim/não", () => {
    expect(motivationalBody({ goalValue: 1, goalUnit: "BOOLEAN" as const }, "Ana", 3, "pt-BR")).toBe(
      "Ana, conclua hoje para manter sua sequência de 3 dias.",
    );
  });
  it("inglês", () => {
    setLocale("en");
    expect(motivationalBody(pages, "Ana", 12, "en")).toBe("Ana, 15 pg. today keeps your 12-day streak going.");
  });
});

import { describe, expect, it } from "vitest";
import { onboardingComplete } from "./schemas";
import {
  DEFAULT_SELECTION,
  buildOnboardingHabits,
  findTemplate,
  formatGoal,
  stepGoal,
  stepSize,
} from "./onboarding";

describe("stepSize (docs/05: água 0,25 L; minutos 5; páginas 5; contagem 1)", () => {
  it.each([
    ["LITERS", 0.25],
    ["MINUTES", 5],
    ["PAGES", 5],
    ["COUNT", 1],
    ["MILLILITERS", 250],
    ["CURRENCY", 1],
  ] as const)("%s → %d", (unit, step) => expect(stepSize(unit)).toBe(step));
  it("BOOLEAN não tem stepper", () => expect(stepSize("BOOLEAN")).toBeNull());
});

describe("stepGoal", () => {
  it("soma e subtrai o passo da unidade", () => {
    expect(stepGoal(2.5, "LITERS", 1)).toBe(2.75);
    expect(stepGoal(2.5, "LITERS", -1)).toBe(2.25);
    expect(stepGoal(30, "MINUTES", 1)).toBe(35);
  });
  it("não passa de zero: o mínimo é um passo", () => {
    expect(stepGoal(0.25, "LITERS", -1)).toBe(0.25);
    expect(stepGoal(5, "PAGES", -1)).toBe(5);
    expect(stepGoal(1, "COUNT", -1)).toBe(1);
  });
  it("evita erro de ponto flutuante", () => {
    let v = 0.25;
    for (let i = 0; i < 10; i++) v = stepGoal(v, "LITERS", 1);
    expect(v).toBe(2.75);
  });
  it("BOOLEAN permanece 1", () => expect(stepGoal(1, "BOOLEAN", 1)).toBe(1));
});

describe("formatGoal", () => {
  it("formata por unidade e idioma", () => {
    expect(formatGoal(2.5, "LITERS", "pt-BR")).toBe("2,5 L");
    expect(formatGoal(2.5, "LITERS", "en")).toBe("2.5 L");
    expect(formatGoal(30, "MINUTES", "pt-BR")).toBe("30 min");
    expect(formatGoal(15, "PAGES", "pt-BR")).toBe("15 pág.");
    expect(formatGoal(15, "PAGES", "en")).toBe("15 pg.");
    expect(formatGoal(3, "COUNT", "pt-BR")).toBe("3×");
    expect(formatGoal(500, "MILLILITERS", "pt-BR")).toBe("500 ml");
  });

  it("Valor mostra a moeda do idioma em vez de um número solto", () => {
    // O espaço entre o símbolo e o número é um NBSP no Intl.
    expect(formatGoal(7, "CURRENCY", "pt-BR").replace(/\s/g, " ")).toBe("R$ 7");
    expect(formatGoal(12.5, "CURRENCY", "pt-BR").replace(/\s/g, " ")).toBe("R$ 12,50");
    expect(formatGoal(7, "CURRENCY", "en")).toBe("$7");
  });
});

describe("seleção inicial", () => {
  it("pré-seleciona água, meditar, ler e treinar com os padrões do catálogo", () => {
    expect(Object.keys(DEFAULT_SELECTION).sort()).toEqual(["beber-agua", "ler", "meditar", "treinar"]);
    expect(DEFAULT_SELECTION["beber-agua"]).toEqual({ goalValue: 2.5, days: [0, 1, 2, 3, 4, 5, 6] });
    expect(DEFAULT_SELECTION.treinar).toEqual({ goalValue: 30, days: [0, 2, 4] });
  });
  it("findTemplate acha pelo slug", () => {
    expect(findTemplate("ler")?.emoji).toBe("📚");
    expect(findTemplate("x")).toBeUndefined();
  });
});

describe("buildOnboardingHabits", () => {
  const selected = {
    ler: { goalValue: 20, days: [4, 0] },
    "beber-agua": { goalValue: 3, days: [0, 1, 2, 3, 4, 5, 6] },
  };
  it("segue a ordem do catálogo, usa o nome do idioma e ordena os dias", () => {
    const habits = buildOnboardingHabits(selected, "pt-BR");
    expect(habits.map((h) => h.templateSlug)).toEqual(["beber-agua", "ler"]);
    expect(habits[1]).toMatchObject({ name: "Ler", emoji: "📚", goalValue: 20, goalUnit: "PAGES", days: [0, 4] });
    expect(buildOnboardingHabits(selected, "en")[0]?.name).toBe("Drink water");
  });
  it("ignora slugs fora do catálogo", () => {
    expect(buildOnboardingHabits({ fantasma: { goalValue: 1, days: [0] } }, "pt-BR")).toEqual([]);
  });
  it("gera algo aceito pelo schema do servidor", () => {
    const habits = buildOnboardingHabits(DEFAULT_SELECTION, "pt-BR");
    expect(onboardingComplete.safeParse({ displayName: "Ana", habits }).success).toBe(true);
  });
});

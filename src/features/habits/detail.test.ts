import { describe, expect, it } from "@jest/globals";
import { setLocale } from "@/i18n";
import { cellOpacity, lastFourWeeks, quickAmounts } from "./detail";

describe("quickAmounts", () => {
  it("água em litros mostra ml", () => {
    setLocale("pt-BR");
    const amounts = quickAmounts("LITERS", "pt-BR");
    expect(amounts.map((a) => a.delta)).toEqual([0.25, 0.5]);
    expect(amounts.map((a) => a.label)).toEqual(["+ 250 ml", "+ 500 ml"]);
  });
  it("sim/não não tem adição rápida", () => {
    expect(quickAmounts("BOOLEAN", "pt-BR")).toEqual([]);
  });
  it("páginas usam o passo da unidade", () => {
    expect(quickAmounts("PAGES", "pt-BR").map((a) => a.delta)).toEqual([5, 10]);
  });
});

describe("cellOpacity", () => {
  it("escala por progresso", () => {
    expect(cellOpacity(10, "MINUTES", { value: 10, status: "DONE" })).toBe(1);
    expect(cellOpacity(10, "MINUTES", { value: 6, status: "PENDING" })).toBe(0.6);
    expect(cellOpacity(10, "MINUTES", { value: 2, status: "PENDING" })).toBe(0.3);
    expect(cellOpacity(10, "MINUTES", { value: 0, status: "PENDING" })).toBe(0.15);
    expect(cellOpacity(10, "MINUTES")).toBe(0.15);
    expect(cellOpacity(10, "MINUTES", { value: 5, status: "SKIPPED" })).toBe(0.15);
  });
});

describe("lastFourWeeks", () => {
  it("4 linhas de 7 dias, segunda a domingo, terminando na semana atual", () => {
    const weeks = lastFourWeeks("2026-11-11"); // quarta
    expect(weeks).toHaveLength(4);
    expect(weeks[3]?.[0]).toBe("2026-11-09");
    expect(weeks[3]?.[6]).toBe("2026-11-15");
    expect(weeks[0]?.[0]).toBe("2026-10-19");
  });
});

import { describe, expect, it } from "@jest/globals";
import type { DayStats } from "@/shared/stats";
import { byMonth, completionOf, periodRange } from "./aggregate";

const day = (date: string, done: number, counted: number): DayStats => ({
  date,
  scheduled: counted,
  done,
  skipped: 0,
  counted,
  completion: counted ? done / counted : 0,
  state: counted === 0 ? "neutral" : done === counted ? "fulfilled" : "missed",
});

describe("periodRange", () => {
  it("semana de segunda a domingo", () => {
    expect(periodRange("week", "2026-11-11")).toEqual({ from: "2026-11-09", to: "2026-11-15" });
  });
  it("mês do calendário, inclusive fevereiro bissexto", () => {
    expect(periodRange("month", "2026-11-11")).toEqual({ from: "2026-11-01", to: "2026-11-30" });
    expect(periodRange("month", "2028-02-10")).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  });
  it("ano: 12 meses fechando no atual", () => {
    expect(periodRange("year", "2026-11-11")).toEqual({ from: "2025-12-01", to: "2026-11-30" });
    expect(periodRange("year", "2026-01-05")).toEqual({ from: "2025-02-01", to: "2026-01-31" });
  });
});

describe("completionOf", () => {
  it("pondera por hábitos contáveis e ignora dias vazios", () => {
    expect(completionOf([day("2026-11-01", 1, 2), day("2026-11-02", 3, 3), day("2026-11-03", 0, 0)])).toBeCloseTo(0.8);
    expect(completionOf([])).toBe(0);
  });
});

describe("byMonth", () => {
  it("agrupa e ordena por mês", () => {
    const bars = byMonth([day("2026-11-02", 2, 2), day("2026-10-30", 1, 2), day("2026-10-31", 1, 2)]);
    expect(bars.map((b) => b.month)).toEqual(["2026-10", "2026-11"]);
    expect(bars[0]?.completion).toBeCloseTo(0.5);
    expect(bars[1]?.completion).toBe(1);
  });
});

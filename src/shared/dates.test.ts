import { describe, expect, it } from "vitest";
import { addDays, diffDays, eachDay, localDate, startOfWeek, weekdayIndex } from "./dates";

describe("weekdayIndex", () => {
  it("usa 0=segunda ... 6=domingo", () => {
    expect(weekdayIndex("2026-11-09")).toBe(0);
    expect(weekdayIndex("2026-11-15")).toBe(6);
  });
});

describe("addDays", () => {
  it("atravessa meses e anos", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("startOfWeek", () => {
  it("devolve a segunda-feira da semana", () => {
    expect(startOfWeek("2026-11-12")).toBe("2026-11-09");
    expect(startOfWeek("2026-11-15")).toBe("2026-11-09");
    expect(startOfWeek("2026-11-09")).toBe("2026-11-09");
  });
});

describe("eachDay / diffDays", () => {
  it("lista o intervalo inclusivo", () => {
    expect(eachDay("2026-11-08", "2026-11-10")).toEqual(["2026-11-08", "2026-11-09", "2026-11-10"]);
    expect(eachDay("2026-11-10", "2026-11-08")).toEqual([]);
  });
  it("calcula a diferença em dias", () => {
    expect(diffDays("2026-11-01", "2026-11-09")).toBe(8);
  });
});

describe("localDate", () => {
  it("converte o instante para a data local no fuso (nunca UTC)", () => {
    const instant = new Date("2026-11-10T01:30:00Z");
    expect(localDate(instant, "America/Sao_Paulo")).toBe("2026-11-09");
    expect(localDate(instant, "UTC")).toBe("2026-11-10");
  });
});

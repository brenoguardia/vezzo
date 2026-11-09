import { describe, expect, it } from "vitest";
import { deriveLog } from "./logs";

const water = { goalValue: 2.5, goalUnit: "LITERS" as const };
const check = { goalValue: 1, goalUnit: "BOOLEAN" as const };

describe("deriveLog", () => {
  it("marca DONE quando value >= meta", () => {
    expect(deriveLog(water, { value: 2.5 })).toEqual({ value: 2.5, status: "DONE" });
    expect(deriveLog(water, { value: 3 })).toEqual({ value: 3, status: "DONE" });
  });
  it("mantém PENDING abaixo da meta", () => {
    expect(deriveLog(water, { value: 1 })).toEqual({ value: 1, status: "PENDING" });
  });
  it("DONE sem valor assume a meta", () => {
    expect(deriveLog(water, { status: "DONE" })).toEqual({ value: 2.5, status: "DONE" });
  });
  it("BOOLEAN conclui com value 1, independentemente do goalValue", () => {
    expect(deriveLog({ goalValue: 5, goalUnit: "BOOLEAN" }, { value: 1 }).status).toBe("DONE");
    expect(deriveLog(check, { value: 0 }).status).toBe("PENDING");
  });
  it("SKIPPED preserva o valor atual", () => {
    expect(deriveLog(water, { status: "SKIPPED" }, { value: 1 })).toEqual({ value: 1, status: "SKIPPED" });
    expect(deriveLog(water, { status: "SKIPPED" })).toEqual({ value: 0, status: "SKIPPED" });
  });
  it("PENDING sem valor zera o progresso", () => {
    expect(deriveLog(water, { status: "PENDING" }, { value: 2.5 })).toEqual({ value: 0, status: "PENDING" });
  });
  it("sem valor nem status mantém o valor existente", () => {
    expect(deriveLog(water, {}, { value: 1 })).toEqual({ value: 1, status: "PENDING" });
  });
});

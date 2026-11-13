import { describe, expect, it } from "@jest/globals";
import { getLandingCopy } from "./index";

const pt = getLandingCopy("pt-BR");
const en = getLandingCopy("en");

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("textos da landing", () => {
  it("pt-BR e en têm as mesmas listas (funções, passos, pontos, hábitos da demo)", () => {
    expect(en.rows.map((r) => r.id)).toEqual(pt.rows.map((r) => r.id));
    expect(en.steps.items).toHaveLength(pt.steps.items.length);
    expect(en.also.items).toHaveLength(pt.also.items.length);
    expect(en.privacy.points).toHaveLength(pt.privacy.points.length);
    expect(en.demo.habits).toHaveLength(pt.demo.habits.length);
    expect(en.create.presets).toHaveLength(pt.create.presets.length);
    expect(en.days.full).toHaveLength(7);
    expect(pt.days.full).toHaveLength(7);
  });

  it.each([
    ["pt-BR", pt],
    ["en", en],
  ] as const)("%s: nenhum texto vazio", (_locale, copy) => {
    for (const text of strings(copy)) expect(text.trim()).not.toBe("");
  });

  it("os idiomas não repetem o mesmo texto (traduzido de verdade)", () => {
    expect(en.hero.subtitle).not.toBe(pt.hero.subtitle);
    expect(en.cta.title).not.toBe(pt.cta.title);
  });

  it("os modelos com {count}, {done}, {total} e {n} estão nos dois idiomas", () => {
    for (const copy of [pt, en]) {
      expect(copy.demo.streak).toContain("{count}");
      expect(copy.demo.progress).toContain("{done}");
      expect(copy.demo.progress).toContain("{total}");
      expect(copy.themeDemo.accentLabel).toContain("{n}");
      expect(copy.streakDemo.milestone).toContain("{target}");
      expect(copy.streakDemo.progress).toContain("{n}");
    }
  });
});

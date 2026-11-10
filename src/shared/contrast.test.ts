import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { ACCENTS, buildTheme, palettes } from "./tokens";

describe("contrastRatio", () => {
  it("preto sobre branco é 21:1 e iguais são 1:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
  });
});

describe("contraste das 7 cores de destaque (docs/06)", () => {
  it.each(ACCENTS)("texto accInk sobre %s tem pelo menos 4,5:1", (acc) => {
    expect(contrastRatio(palettes.light.accInk, acc)).toBeGreaterThanOrEqual(4.5);
  });

  // Texto de destaque (links, “Editar”) usa `acc` sobre o fundo: 3:1 é o piso para texto grande/componentes.
  it.each(["dark", "light"] as const)("%s: texto e tons de apoio legíveis sobre o fundo", (scheme) => {
    const p = palettes[scheme];
    expect(contrastRatio(p.ink, p.bg)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.mute, p.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.mute, p.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.danger, p.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.danger, p.card)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(ACCENTS)("%s como texto de destaque: ≥ 4,5:1 no claro e no escuro", (acc) => {
    for (const scheme of ["light", "dark"] as const) {
      const theme = buildTheme(scheme, acc);
      expect(contrastRatio(theme.accText, theme.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(theme.accText, theme.card)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(ACCENTS)("%s sobre o fundo escuro: ≥ 3:1", (acc) => {
    expect(contrastRatio(acc, palettes.dark.bg)).toBeGreaterThanOrEqual(3);
  });
});

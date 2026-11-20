import { describe, expect, it } from "vitest";
import { ACCENTS, buildTheme, contrastRatio, palettes } from "./tokens";

describe("tokens", () => {
  it("texto accInk sobre cada cor de destaque tem contraste mínimo de 4,5:1", () => {
    for (const acc of ACCENTS) {
      expect(contrastRatio(acc, palettes.dark.accInk), acc).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("tint usa alfa 30 no escuro e 40 no claro", () => {
    expect(buildTheme("dark", "#b9d94c").tint).toBe("#b9d94c30");
    expect(buildTheme("light", "#4f9cf0").tint).toBe("#4f9cf040");
  });

  it("contrastRatio de preto sobre branco é 21", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });

  describe("contraste de texto (WCAG AA, 4,5:1) nos dois temas e em todas as cores de destaque", () => {
    const themes = (["dark", "light"] as const).flatMap((scheme) =>
      ACCENTS.map((acc) => ({ name: `${scheme} ${acc}`, t: buildTheme(scheme, acc) })),
    );
    const pairs = [
      ["ink", "bg"],
      ["ink", "card"],
      ["mute", "bg"],
      ["mute", "card"],
      ["accText", "bg"],
      ["accText", "card"],
      ["danger", "bg"],
      ["danger", "card"],
      ["accInk", "acc"],
      ["dangerInk", "danger"],
    ] as const;

    it.each(pairs)("%s sobre %s", (fg, bg) => {
      for (const { name, t } of themes) {
        expect(contrastRatio(t[fg], t[bg]), `${name}: ${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
});

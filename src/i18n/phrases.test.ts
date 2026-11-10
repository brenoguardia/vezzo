import { describe, expect, it } from "@jest/globals";
import { dailyPhrase, phraseBand, phraseBank } from "./phrases";

describe("phraseBand", () => {
  it("classifica o progresso do dia", () => {
    expect(phraseBand(0, 5)).toBe("none");
    expect(phraseBand(0, 0)).toBe("none");
    expect(phraseBand(2, 5)).toBe("low");
    expect(phraseBand(3, 5)).toBe("high");
    expect(phraseBand(5, 5)).toBe("full");
  });
});

describe("dailyPhrase", () => {
  it("varia por dia e é estável no mesmo dia", () => {
    expect(dailyPhrase("pt-BR", "high", 10)).toBe(dailyPhrase("pt-BR", "high", 10));
    expect(dailyPhrase("pt-BR", "high", 10)).not.toBe(dailyPhrase("pt-BR", "high", 11));
  });
  it("banco tem o mesmo tamanho nos dois idiomas", () => {
    for (const band of ["none", "low", "high", "full"] as const) {
      expect(phraseBank.en[band]).toHaveLength(phraseBank["pt-BR"][band].length);
    }
  });
});

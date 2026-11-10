import { describe, expect, it } from "@jest/globals";
import { layoutInfo, layoutMode } from "./layout-mode";

describe("layoutMode", () => {
  it.each([
    [320, "single"],
    [390, "single"],
    [599, "single"],
    [600, "dual"],
    [932, "dual"],
    [1080, "dual"],
  ])("largura %i → %s", (width, mode) => {
    expect(layoutMode(width)).toBe(mode);
  });
});

describe("layoutInfo", () => {
  it("single usa a largura inteira", () => {
    expect(layoutInfo(390)).toEqual({
      mode: "single",
      dual: false,
      width: 390,
      usableWidth: 390,
      sides: { left: 0, right: 0 },
      columnWidth: 390,
    });
  });
  it("dobrável de 540+540 com dobradiça de 28 (1108): colunas de 540", () => {
    expect(layoutInfo(1108).columnWidth).toBe(540);
  });
  it("limita a coluna a 640 em telas largas (iPad)", () => {
    expect(layoutInfo(1366).columnWidth).toBe(640);
  });
  it("o rail do dobrável (inset lateral) reduz a largura utilizável, não o modo", () => {
    // iPhone Duo fechado: janela de 466 pt com 84 pt de rail à direita.
    expect(layoutInfo(466, undefined, { left: 0, right: 84 })).toMatchObject({
      mode: "single",
      width: 466,
      usableWidth: 382,
      columnWidth: 382,
      sides: { left: 0, right: 84 },
    });
  });
  it("no modo dual as colunas dividem só a largura utilizável", () => {
    // (1000 - 84 - 28) / 2 = 444
    expect(layoutInfo(1000, 28, { left: 0, right: 84 }).columnWidth).toBe(444);
  });
  it("aceita outro gap", () => {
    expect(layoutInfo(700, 20).columnWidth).toBe(340);
  });
});

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
    expect(layoutInfo(390)).toEqual({ mode: "single", dual: false, width: 390, columnWidth: 390 });
  });
  it("dobrável de 540+540 com dobradiça de 28 (1108): colunas de 540", () => {
    expect(layoutInfo(1108).columnWidth).toBe(540);
  });
  it("limita a coluna a 640 em telas largas (iPad)", () => {
    expect(layoutInfo(1366).columnWidth).toBe(640);
  });
  it("aceita outro gap", () => {
    expect(layoutInfo(700, 20).columnWidth).toBe(340);
  });
});

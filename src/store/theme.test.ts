import { describe, expect, it } from "@jest/globals";
import { ACCENTS } from "@/shared/tokens";
import { useThemeStore } from "./theme";

describe("useThemeStore", () => {
  it("começa com a primeira cor e modo do sistema", () => {
    const { accent, mode } = useThemeStore.getState();
    expect(accent).toBe(ACCENTS[0]);
    expect(mode).toBe("system");
  });

  it("atualiza cor e modo", () => {
    useThemeStore.getState().setAccent(ACCENTS[3]);
    useThemeStore.getState().setMode("light");
    expect(useThemeStore.getState()).toMatchObject({ accent: ACCENTS[3], mode: "light" });
  });
});

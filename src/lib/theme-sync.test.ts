import { beforeEach, describe, expect, it } from "@jest/globals";
import { i18n } from "@/i18n";
import { useThemeStore } from "@/store/theme";
import { applyPreferences, isAccent, modeFromApi, modeToApi } from "./theme-sync";

const base = { accent: "#4f9cf0", themeMode: "LIGHT", language: "en", onboardingDone: true } as const;

beforeEach(() => {
  i18n.locale = "pt-BR";
  useThemeStore.setState({ accent: "#b9d94c", mode: "system" });
});

describe("theme-sync", () => {
  it("converte modo da API e do store nos dois sentidos", () => {
    expect(modeFromApi("DARK")).toBe("dark");
    expect(modeFromApi("SYSTEM")).toBe("system");
    expect(modeToApi("light")).toBe("LIGHT");
    expect(modeToApi("system")).toBe("SYSTEM");
  });

  it("só aceita cores da paleta", () => {
    expect(isAccent("#3fbf9f")).toBe(true);
    expect(isAccent("#000000")).toBe(false);
  });

  it("aplica cor, modo e idioma do perfil", () => {
    applyPreferences(base);
    expect(useThemeStore.getState()).toMatchObject({ accent: "#4f9cf0", mode: "light" });
    expect(i18n.locale).toBe("en");
  });

  it("ignora cor desconhecida e não troca o idioma antes do onboarding", () => {
    applyPreferences({ ...base, accent: "#123456", onboardingDone: false });
    expect(useThemeStore.getState().accent).toBe("#b9d94c");
    expect(i18n.locale).toBe("pt-BR");
  });
});

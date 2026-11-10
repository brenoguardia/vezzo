import { describe, expect, it } from "@jest/globals";
import { en } from "./en";
import { detectLocale, i18n, setLocale, t, translateMessage } from "./index";
import { ptBR } from "./pt-BR";

function keys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "string" ? [`${prefix}${k}`] : keys(v as object, `${prefix}${k}.`),
  );
}

describe("i18n", () => {
  it("en tem exatamente as mesmas chaves de pt-BR", () => {
    expect(keys(en).sort()).toEqual(keys(ptBR).sort());
  });
  it("detecta o idioma do aparelho", () => {
    expect(detectLocale("pt")).toBe("pt-BR");
    expect(detectLocale("fr")).toBe("en");
    expect(detectLocale(null)).toBe("en");
  });
  it("traduz e interpola", () => {
    setLocale("pt-BR");
    expect(t("auth.resendIn", { seconds: 42 })).toBe("Reenviar link em 42 s");
    setLocale("en");
    expect(t("auth.resendIn", { seconds: 42 })).toBe("Resend link in 42 s");
    setLocale("pt-BR");
  });
  it("traduz chaves de erro do Zod e preserva texto livre", () => {
    i18n.locale = "pt-BR";
    expect(translateMessage("auth.errors.email")).toBe("Informe um e-mail válido.");
    expect(translateMessage("texto solto")).toBe("texto solto");
    expect(translateMessage(undefined)).toBeUndefined();
  });
});

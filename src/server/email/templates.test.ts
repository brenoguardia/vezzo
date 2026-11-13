import { describe, expect, it } from "vitest";
import { renderEmail, resolveLocale } from "./templates";

describe("resolveLocale", () => {
  it("prioriza Profile.language quando existe", () => {
    expect(resolveLocale({ profileLanguage: "en", acceptLanguage: "pt-BR" })).toBe("en");
  });
  it("usa Accept-Language quando não há perfil", () => {
    expect(resolveLocale({ acceptLanguage: "en-US,en;q=0.9,pt;q=0.5" })).toBe("en");
    expect(resolveLocale({ acceptLanguage: "pt-BR,pt;q=0.9" })).toBe("pt-BR");
  });
  it("cai em pt-BR por padrão", () => {
    expect(resolveLocale({})).toBe("pt-BR");
    expect(resolveLocale({ acceptLanguage: "fr-FR" })).toBe("pt-BR");
  });
});

describe("renderEmail", () => {
  const url = "https://app.vezzo.cloud/api/auth/reset-password/tok?callbackURL=vezzo%3A%2F%2Freset-password";

  it.each(["verify-email", "reset-password"] as const)(
    "%s inclui o link em html e texto, nos dois idiomas",
    (template) => {
      for (const locale of ["pt-BR", "en"] as const) {
        const out = renderEmail(template, locale, { url });
        expect(out.subject.length).toBeGreaterThan(0);
        expect(out.html).toContain(url.replaceAll("&", "&amp;"));
        expect(out.text).toContain(url);
      }
    },
  );

  it("password-changed não precisa de link", () => {
    const out = renderEmail("password-changed", "en", {});
    expect(out.subject).toMatch(/password/i);
    expect(out.html).not.toContain('href="undefined"');
  });

  it("traduz o assunto", () => {
    expect(renderEmail("reset-password", "pt-BR", { url }).subject).toMatch(/senha/i);
    expect(renderEmail("reset-password", "en", { url }).subject).toMatch(/password/i);
  });

  it("usa a identidade visual do doc 04", () => {
    const { html } = renderEmail("verify-email", "pt-BR", { url });
    expect(html).toContain("#f6f4ee");
    expect(html).toContain("#b9d94c");
    expect(html).toContain("#14170c");
    expect(html).toContain("Vezzo");
  });

  it("escapa HTML em valores dinâmicos", () => {
    const out = renderEmail("verify-email", "en", { url: 'https://x.test/?a="><script>' });
    expect(out.html).not.toContain("<script>");
  });
});

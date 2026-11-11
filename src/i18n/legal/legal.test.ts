import { describe, expect, it } from "@jest/globals";
import { LEGAL_CONFIG, type LegalConfig, pendingLegalFields } from "@/shared/legal/config";
import { getLegalDocument, type LegalKind } from "./index";

const FILLED: LegalConfig = {
  ...LEGAL_CONFIG,
  controllerName: "Vezzo Tecnologia Ltda.",
  controllerDocument: "00.000.000/0001-00",
  contactEmail: "privacidade@vezzo.example",
  forumCity: "São Paulo/SP",
};
const kinds: LegalKind[] = ["terms", "privacy"];
const locales = ["pt-BR", "en"] as const;
const combos = kinds.flatMap((kind) => locales.map((locale) => [kind, locale] as const));

function flatten(kind: LegalKind, locale: (typeof locales)[number], config: LegalConfig = FILLED): string {
  const doc = getLegalDocument(kind, locale, config);
  return [
    doc.title,
    doc.intro,
    ...doc.sections.flatMap((s) => [s.heading, ...(s.paragraphs ?? []), ...(s.items ?? []), ...(s.outro ?? [])]),
  ].join("\n");
}

describe("textos legais", () => {
  it.each(kinds)("%s: pt-BR e en têm as mesmas seções, na mesma ordem", (kind) => {
    const pt = getLegalDocument(kind, "pt-BR", FILLED).sections;
    const en = getLegalDocument(kind, "en", FILLED).sections;
    expect(en.length).toBe(pt.length);
    pt.forEach((section, i) => {
      expect(en[i]?.items?.length).toBe(section.items?.length);
      expect(en[i]?.paragraphs?.length).toBe(section.paragraphs?.length);
      expect(en[i]?.outro?.length).toBe(section.outro?.length);
    });
  });

  it.each(combos)("%s (%s): sem seção vazia, sem colchetes e com o e-mail de contato", (kind, locale) => {
    const doc = getLegalDocument(kind, locale, FILLED);
    for (const section of doc.sections) {
      expect(section.heading.length).toBeGreaterThan(0);
      expect(
        (section.paragraphs?.length ?? 0) + (section.items?.length ?? 0) + (section.outro?.length ?? 0),
      ).toBeGreaterThan(0);
    }
    const text = flatten(kind, locale);
    expect(text).not.toMatch(/[[\]]/);
    expect(text).toContain(FILLED.contactEmail as string);
  });

  it("interpola idade mínima e prazos do config", () => {
    expect(flatten("privacy", "pt-BR")).toContain(`${FILLED.minAge} anos`);
    expect(flatten("privacy", "pt-BR")).toContain(`${FILLED.deletionDays} dias`);
    expect(flatten("privacy", "en")).toContain(`within ${FILLED.deletionDays} days`);
  });

  it("mostra marcador entre colchetes enquanto o dado está pendente", () => {
    expect(flatten("terms", "pt-BR", { ...FILLED, forumCity: null })).toContain("[comarca]");
  });

  it("lista os campos obrigatórios ainda sem valor", () => {
    expect(pendingLegalFields(FILLED)).toEqual([]);
    expect(pendingLegalFields({ ...FILLED, contactEmail: null, forumCity: null })).toEqual([
      "contactEmail",
      "forumCity",
    ]);
  });
});

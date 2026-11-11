import { LEGAL_CONFIG, type LegalConfig } from "@/shared/legal/config";
import type { Locale } from "../index";
import { legalEn } from "./en";
import { legalPtBR } from "./pt-BR";
import type { LegalDocument, LegalKind } from "./types";

export type { LegalDocument, LegalKind, LegalSection } from "./types";

const builders = { "pt-BR": legalPtBR, en: legalEn } as const;

/** Documento legal no idioma pedido, com os dados do controlador interpolados. */
export function getLegalDocument(kind: LegalKind, locale: Locale, config: LegalConfig = LEGAL_CONFIG): LegalDocument {
  return builders[locale](config)[kind];
}

import type { LegalConfig } from "@/shared/legal/config";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  /** Parágrafos depois da lista (ressalvas e fechamento). */
  outro?: string[];
}

export interface LegalDocument {
  title: string;
  intro?: string;
  sections: LegalSection[];
}

export type LegalKind = "terms" | "privacy" | "account-deletion";

export type LegalBuilder = (config: LegalConfig) => Record<LegalKind, LegalDocument>;

/** Valor do config ou marcador visível `[rótulo]` enquanto o dado não foi informado. */
export function field(value: string | null, label: string): string {
  return value ?? `[${label}]`;
}

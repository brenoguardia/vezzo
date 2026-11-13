/**
 * Dados do controlador usados nos Termos de Uso e na Política de Privacidade (client e server).
 * Campos `null` ainda precisam ser informados antes de publicar: o texto mostra um marcador entre
 * colchetes e `bun scripts/check-legal.ts` falha enquanto houver pendência.
 */
export interface LegalConfig {
  /** Razão social da empresa controladora. */
  controllerName: string | null;
  /** CNPJ da empresa. */
  controllerDocument: string | null;
  /** E-mail de contato e do encarregado (LGPD). */
  contactEmail: string | null;
  /** Comarca do foro (cidade/UF). */
  forumCity: string | null;
  /** Provedor que hospeda o servidor. */
  hostingProvider: string;
  /** Idade mínima para usar o app. */
  minAge: number;
  /** Prazo máximo, em dias, para apagar os dados depois da exclusão da conta. */
  deletionDays: number;
  /** Prazo, em dias, para responder a pedidos de titulares. */
  responseDays: number;
  /** Data (YYYY-MM-DD) da última atualização dos textos. */
  updatedAt: string;
}

export const LEGAL_CONFIG: LegalConfig = {
  controllerName: "IT Builder",
  controllerDocument: "48.256.389/0001-67",
  contactEmail: "itbuilders.dev@gmail.com",
  forumCity: "São Paulo/SP",
  hostingProvider: "Hostinger",
  minAge: 13,
  deletionDays: 30,
  responseDays: 15,
  updatedAt: "2026-11-13",
};

/** Campos obrigatórios ainda sem valor. */
export function pendingLegalFields(config: LegalConfig = LEGAL_CONFIG): string[] {
  const required = ["controllerName", "controllerDocument", "contactEmail", "forumCity"] as const;
  return required.filter((key) => config[key] === null);
}

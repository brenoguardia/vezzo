import { LEGAL_CONFIG, pendingLegalFields } from "../src/shared/legal/config";

/** Falha enquanto faltar dado do controlador nos textos legais (rodar antes de publicar nas lojas). */
const pending = pendingLegalFields(LEGAL_CONFIG);
if (pending.length > 0) {
  console.error(`Preencha em src/shared/legal/config.ts: ${pending.join(", ")}`);
  process.exit(1);
}
console.log("Textos legais completos.");

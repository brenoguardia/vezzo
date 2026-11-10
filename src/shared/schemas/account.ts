import { z } from "zod";

/** Resposta de `DELETE /v1/account`. */
export const accountDeleted = z.object({ deleted: z.literal(true) });
export type AccountDeleted = z.infer<typeof accountDeleted>;

/** Janela de "login recente" exigida para excluir a conta (docs/04). */
export const REAUTH_WINDOW_MINUTES = 10;

/** Confirmação de senha na tela de excluir conta (reautenticação, docs/04). */
export const deleteAccountInput = z.object({
  password: z.string().min(1, "auth.errors.passwordRequired"),
});
export type DeleteAccountInput = z.infer<typeof deleteAccountInput>;

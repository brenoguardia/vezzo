import type { Db } from "@/server/db";
import { ApiError } from "@/server/http";
import { REAUTH_WINDOW_MINUTES } from "@/shared/schemas";

/**
 * Exclui a conta e todos os dados do usuário (exigência das lojas, docs/04).
 * Exige login recente: sessões mais antigas que a janela recebem 403 `REAUTH_REQUIRED`.
 */
export async function deleteAccount(
  db: Db,
  userId: string,
  authenticatedAt: Date | undefined,
  now = new Date(),
): Promise<void> {
  const ageMs = authenticatedAt ? now.getTime() - authenticatedAt.getTime() : Number.POSITIVE_INFINITY;
  if (ageMs > REAUTH_WINDOW_MINUTES * 60_000) {
    throw new ApiError("REAUTH_REQUIRED", "Entre novamente para excluir a conta.");
  }
  await db.$transaction(async (tx) => {
    await tx.habitLog.deleteMany({ where: { userId } });
    await tx.habit.deleteMany({ where: { userId } });
    await tx.pushToken.deleteMany({ where: { userId } });
    await tx.profile.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.user.deleteMany({ where: { id: userId } });
  });
}

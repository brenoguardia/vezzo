import type { Db } from "@/server/db";
import type { PushRegister } from "@/shared/schemas";

/** Associa o token ao usuário. Se o aparelho trocou de conta, o token passa para quem está logado agora. */
export async function registerPushToken(db: Db, userId: string, input: PushRegister): Promise<void> {
  await db.pushToken.upsert({
    where: { token: input.token },
    create: { userId, token: input.token, platform: input.platform },
    update: { userId, platform: input.platform },
  });
}

/** Remove só o token do próprio usuário: o de outro usuário nunca é tocado. */
export async function removePushToken(db: Db, userId: string, token: string): Promise<void> {
  await db.pushToken.deleteMany({ where: { userId, token } });
}

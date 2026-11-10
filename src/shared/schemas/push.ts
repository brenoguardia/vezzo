import { z } from "zod";

/** Token Expo: `ExponentPushToken[...]` (ou `ExpoPushToken[...]`). */
export const expoPushToken = z.string().regex(/^Expo(nent)?PushToken\[[^\]\s]+\]$/);

export const pushRegister = z.object({
  token: expoPushToken,
  platform: z.enum(["ios", "android"]),
});
export type PushRegister = z.infer<typeof pushRegister>;

/** `DELETE /v1/push/register`: o token vai no corpo (um usuário pode ter vários aparelhos). */
export const pushUnregister = z.object({ token: expoPushToken });
export type PushUnregister = z.infer<typeof pushUnregister>;

export const pushOk = z.object({ ok: z.literal(true) });

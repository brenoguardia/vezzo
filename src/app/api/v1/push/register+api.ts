import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { registerPushToken, removePushToken } from "@/server/services/push";
import { pushRegister, pushUnregister } from "@/shared/schemas";

export const POST = withSession(async ({ userId, body }) => {
  await registerPushToken(prisma, userId, await body(pushRegister));
  return json({ ok: true });
});

export const DELETE = withSession(async ({ userId, body }) => {
  await removePushToken(prisma, userId, (await body(pushUnregister)).token);
  return json({ ok: true });
});

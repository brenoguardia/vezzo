import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { deleteAccount } from "@/server/services/account";

export const DELETE = withSession(async ({ userId, authenticatedAt }) => {
  await deleteAccount(prisma, userId, authenticatedAt);
  return json({ deleted: true });
});

import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { removeHabit, updateHabit } from "@/server/services/habits";
import { habitDeleteQuery, habitPatch } from "@/shared/schemas";

export const PATCH = withSession(async ({ userId, params, body }) =>
  json(await updateHabit(prisma, userId, params.id, await body(habitPatch))),
);

export const DELETE = withSession(async ({ userId, params, query }) => {
  await removeHabit(prisma, userId, params.id, query(habitDeleteQuery).hard);
  return json({ ok: true });
});

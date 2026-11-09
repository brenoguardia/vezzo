import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { createHabit, listHabits } from "@/server/services/habits";
import { habitInput } from "@/shared/schemas";

export const GET = withSession(async ({ userId }) => json({ habits: await listHabits(prisma, userId) }));

export const POST = withSession(async ({ userId, body }) =>
  json(await createHabit(prisma, userId, await body(habitInput)), { status: 201 }),
);

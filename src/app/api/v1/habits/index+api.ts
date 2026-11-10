import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { createHabit, listHabits } from "@/server/services/habits";
import { habitInput, habitListQuery } from "@/shared/schemas";

export const GET = withSession(async ({ userId, query }) =>
  json({ habits: await listHabits(prisma, userId, query(habitListQuery).includeArchived) }),
);

export const POST = withSession(async ({ userId, body }) =>
  json(await createHabit(prisma, userId, await body(habitInput)), { status: 201 }),
);

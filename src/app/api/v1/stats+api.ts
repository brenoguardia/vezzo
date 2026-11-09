import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { getStats } from "@/server/services/stats";
import { rangeQuery } from "@/shared/schemas";

export const GET = withSession(async ({ userId, query }) => {
  const { from, to } = query(rangeQuery);
  return json(await getStats(prisma, userId, from, to));
});

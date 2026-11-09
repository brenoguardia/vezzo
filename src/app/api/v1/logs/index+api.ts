import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { listLogs, upsertLog } from "@/server/services/logs";
import { logUpsert, rangeQuery } from "@/shared/schemas";

export const GET = withSession(async ({ userId, query }) => {
  const { from, to } = query(rangeQuery);
  return json({ logs: await listLogs(prisma, userId, from, to) });
});

export const PUT = withSession(async ({ userId, body }) =>
  json(await upsertLog(prisma, userId, await body(logUpsert))),
);

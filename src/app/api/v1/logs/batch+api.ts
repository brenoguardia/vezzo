import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { upsertLogs } from "@/server/services/logs";
import { logBatch } from "@/shared/schemas";

export const POST = withSession(async ({ userId, body }) =>
  json(await upsertLogs(prisma, userId, (await body(logBatch)).items)),
);

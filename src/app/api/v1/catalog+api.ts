import { prisma } from "@/server/db";
import { json, withSession } from "@/server/http";
import { getCatalog } from "@/server/services/catalog";

export const GET = withSession(async () => json(await getCatalog(prisma)));

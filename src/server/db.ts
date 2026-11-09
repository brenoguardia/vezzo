import { PrismaClient } from "@prisma/client";

// Instância única: em dev o hot reload reavalia o módulo, então guardamos no globalThis.
const globalForPrisma = globalThis as unknown as { __vezzoPrisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.__vezzoPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.__vezzoPrisma = prisma;

export type Db = PrismaClient;

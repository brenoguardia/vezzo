import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const hs = await p.habit.findMany({ where: { archivedAt: null }, orderBy: { order: "asc" }, take: 1 });
const h = hs[0]!;
const logs = await p.habitLog.findMany({
  where: { habitId: h.id },
  orderBy: { updatedAt: "desc" },
  take: 3,
  select: { date: true, status: true, source: true, updatedAt: true },
});
console.log(h.name, h.id, JSON.stringify(logs));
await p.$disconnect();

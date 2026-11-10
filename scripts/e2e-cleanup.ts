// Remove da conta de desenvolvimento os hábitos criados pelos fluxos E2E (nome começando com "E2E").
// Uso: bun --env-file=.env scripts/e2e-cleanup.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const habits = await prisma.habit.findMany({ where: { name: { startsWith: "E2E" } }, select: { id: true } });
const ids = habits.map((h) => h.id);
const logs = await prisma.habitLog.deleteMany({ where: { habitId: { in: ids } } });
const removed = await prisma.habit.deleteMany({ where: { id: { in: ids } } });
console.log(`Hábitos removidos: ${removed.count} (logs: ${logs.count})`);
await prisma.$disconnect();

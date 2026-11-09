import type { Db } from "@/server/db";
import { ApiError } from "@/server/http";
import { toLogDto } from "@/server/mappers";
import { findOwnedHabit } from "@/server/services/habits";
import { deriveLog } from "@/shared/logs";
import type { LogDto, LogUpsert } from "@/shared/schemas";

export async function listLogs(db: Db, userId: string, from: string, to: string): Promise<LogDto[]> {
  const logs = await db.habitLog.findMany({
    where: { userId, date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
  });
  return logs.map(toLogDto);
}

export const MAX_APPLIED_CLIENT_IDS = 50;

/**
 * Upsert por (hábito, data). Um `clientId` já aplicado a este log (o último ou um
 * dos 50 anteriores) é reenvio da fila offline e não altera nada.
 */
export async function upsertLog(db: Db, userId: string, input: LogUpsert): Promise<LogDto> {
  const habit = await findOwnedHabit(db, userId, input.habitId);
  const existing = await db.habitLog.findFirst({
    where: { habitId: habit.id, userId, date: input.date },
  });
  const applied = existing?.appliedClientIds ?? [];
  if (existing && (existing.clientId === input.clientId || applied.includes(input.clientId))) {
    return toLogDto(existing);
  }

  const { value, status } = deriveLog(habit, { value: input.value, status: input.status }, existing ?? undefined);
  const completedAt = status === "DONE" ? (existing?.completedAt ?? new Date()) : null;
  const appliedClientIds = [...applied, input.clientId].slice(-MAX_APPLIED_CLIENT_IDS);
  const fields = { value, status, source: input.source, completedAt, clientId: input.clientId, appliedClientIds };
  const log = await db.habitLog.upsert({
    where: { habitId_date: { habitId: habit.id, date: input.date } },
    create: { ...fields, habitId: habit.id, userId, date: input.date },
    update: fields,
  });
  return toLogDto(log);
}

export async function upsertLogs(db: Db, userId: string, items: LogUpsert[]) {
  const applied: LogDto[] = [];
  const rejected: { clientId: string; code: "NOT_FOUND" }[] = [];
  for (const item of items) {
    try {
      applied.push(await upsertLog(db, userId, item));
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        rejected.push({ clientId: item.clientId, code: "NOT_FOUND" });
      } else {
        throw error;
      }
    }
  }
  return { applied, rejected };
}

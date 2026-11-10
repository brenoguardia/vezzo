import { z } from "zod";
import { diffDays } from "../dates";
import { logSource, logStatus, MAX_RANGE_DAYS, objectId, ymd } from "./common";

export const logUpsert = z.object({
  clientId: z.string().uuid(),
  habitId: objectId,
  date: ymd,
  value: z.number().min(0).optional(),
  status: logStatus.optional(),
  source: logSource.default("APP"),
});
export type LogUpsert = z.infer<typeof logUpsert>;
export const logBatch = z.object({ items: z.array(logUpsert).max(200) });

export const rangeQuery = z
  .object({ from: ymd, to: ymd })
  .refine((v) => v.from <= v.to, { path: ["to"], message: "`to` deve ser >= `from`" })
  .refine((v) => diffDays(v.from, v.to) <= MAX_RANGE_DAYS, {
    path: ["to"],
    message: `Intervalo máximo de ${MAX_RANGE_DAYS} dias`,
  });

export const logDto = z.object({
  id: objectId,
  habitId: objectId,
  date: z.string(),
  value: z.number(),
  status: logStatus,
  source: logSource,
  completedAt: z.string().nullable(),
  clientId: z.string().nullable(),
});
export type LogDto = z.infer<typeof logDto>;
export const logList = z.object({ logs: z.array(logDto) });
export const logBatchResult = z.object({
  applied: z.array(logDto),
  rejected: z.array(z.object({ clientId: z.string(), code: z.literal("NOT_FOUND") })),
});

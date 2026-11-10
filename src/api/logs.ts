import { apiFetch } from "@/api/client";
import { type LogDto, type LogUpsert, logBatchResult, logList } from "@/shared/schemas";

export async function fetchLogs(from: string, to: string): Promise<LogDto[]> {
  return (await apiFetch(`/v1/logs?from=${from}&to=${to}`, logList)).logs;
}

/** `POST /v1/logs/batch` (até 200 itens, idempotente por `clientId`). */
export function postLogBatch(items: LogUpsert[]) {
  return apiFetch("/v1/logs/batch", logBatchResult, { method: "POST", body: JSON.stringify({ items }) });
}

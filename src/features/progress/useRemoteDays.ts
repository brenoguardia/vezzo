import { useEffect, useState } from "react";
import { fetchStats } from "@/api/summary";
import type { DayStats } from "@/shared/stats";
import { type Period, periodRange } from "./aggregate";

export type RemoteDays = {
  status: "loading" | "ready" | "error";
  days: DayStats[];
  /** Tenta de novo depois de um erro. */
  retry: () => void;
};

type Result = { key: string; status: "ready" | "error"; days: DayStats[] };

/** Mês e ano vêm de `GET /v1/stats` (o cliente só guarda 90 dias de logs). */
export function useRemoteDays(period: Period, today: string, enabled: boolean): RemoteDays {
  const [attempt, setAttempt] = useState(0);
  const key = `${period}|${today}|${attempt}`;
  const [result, setResult] = useState<Result | null>(null);
  const retry = () => setAttempt((n) => n + 1);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const { from, to } = periodRange(period, today);
    fetchStats(from, to)
      .then((s) => !cancelled && setResult({ key, status: "ready", days: s.days }))
      .catch(() => !cancelled && setResult({ key, status: "error", days: [] }));
    return () => {
      cancelled = true;
    };
  }, [period, today, enabled, key]);

  // Resultado de outro período conta como "carregando": evita mostrar dados velhos sem setState no effect.
  if (!result || result.key !== key) return { status: "loading", days: [], retry };
  return { status: result.status, days: result.days, retry };
}

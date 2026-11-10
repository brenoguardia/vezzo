export type LogStatus = "PENDING" | "DONE" | "SKIPPED";

/** Chave de um log por hábito+data nos stores do cliente. */
export const logKey = (habitId: string, date: string) => `${habitId}:${date}`;

type Goal = { goalValue: number; goalUnit: string };
type LogChange = { value?: number; status?: LogStatus };

function target({ goalValue, goalUnit }: Goal): number {
  return goalUnit === "BOOLEAN" ? 1 : goalValue;
}

/**
 * Regra do dia (docs/02): DONE quando value >= meta; SKIPPED é explícito e
 * preserva o progresso; PENDING explícito sem valor zera.
 */
export function deriveLog(
  goal: Goal,
  change: LogChange,
  existing?: { value: number },
): { value: number; status: LogStatus } {
  const goalTarget = target(goal);
  let value = change.value;
  if (value === undefined) {
    if (change.status === "DONE") value = goalTarget;
    else if (change.status === "PENDING") value = 0;
    else value = existing?.value ?? 0;
  }
  if (change.status === "SKIPPED") return { value, status: "SKIPPED" };
  return { value, status: value >= goalTarget ? "DONE" : "PENDING" };
}

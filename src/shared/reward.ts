// Progresso do presente por meta (sequência sem falhas). Puro: sem banco nem relógio.
import { addDays, eachDay, type Ymd } from "./dates";
import { dayStats, type StatHabit, type StatLog } from "./stats";

export const REWARD_MIN_DAYS = 1;
export const REWARD_MAX_DAYS = 730;
export const REWARD_PRESETS = [30, 90, 180, 365] as const;

export type RewardHabit = StatHabit & {
  rewardDays: number;
  /** Data local (YYYY-MM-DD) em que o desafio começou. */
  rewardStartDate: Ymd;
  /** Instante ISO do resgate; null enquanto não resgatado. */
  rewardClaimedAt: string | null;
};

export type RewardState = "ACTIVE" | "ACHIEVED" | "CLAIMED";

export type RewardProgress = {
  state: RewardState;
  /** Dias da sequência atual sem falhas. */
  currentRun: number;
  daysLeft: number;
  /** 0 a 1. */
  percent: number;
  /** Maior sequência já feita no desafio. */
  best: number;
  /** 1 + número de falhas (recomeços). */
  attempts: number;
  /** Primeiro dia da sequência atual. */
  runStart: Ymd;
  /** Dia em que a duração foi atingida pela primeira vez; permanente. */
  achievedDate: Ymd | null;
};

/**
 * Percorre do início do desafio até hoje. Dia cumprido ou neutro (não agendado ou pulado) soma na sequência;
 * dia agendado encerrado sem DONE a zera e conta uma nova tentativa. Hoje pendente não quebra nem soma.
 * Atingir `rewardDays` é permanente: falhas posteriores não desfazem a conquista.
 */
export function rewardProgress(habit: RewardHabit, logs: readonly StatLog[], today: Ymd): RewardProgress {
  const { rewardDays: target, rewardStartDate: start } = habit;
  let run = 0;
  let best = 0;
  let attempts = 1;
  let runStart: Ymd = start;
  let achievedDate: Ymd | null = null;

  if (start <= today) {
    for (const date of eachDay(start, today)) {
      const { state } = dayStats([habit], logs, date);
      if (state === "missed" && date !== today) {
        run = 0;
        attempts += 1;
        runStart = addDays(date, 1);
        continue;
      }
      if (state === "missed") continue; // hoje pendente
      run += 1;
      best = Math.max(best, run);
      if (achievedDate === null && run >= target) achievedDate = date;
    }
  }

  const state: RewardState = habit.rewardClaimedAt ? "CLAIMED" : achievedDate ? "ACHIEVED" : "ACTIVE";
  const shown = achievedDate ? target : Math.min(run, target);
  return {
    state,
    currentRun: run,
    daysLeft: Math.max(0, target - shown),
    percent: Math.min(1, shown / target),
    best,
    attempts,
    runStart,
    achievedDate,
  };
}

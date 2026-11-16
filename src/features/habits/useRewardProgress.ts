import { useCallback, useEffect, useState } from "react";
import { claimReward, fetchRewardProgress } from "@/api/rewards";
import { logKey } from "@/shared/logs";
import type { HabitDto, RewardProgressDto } from "@/shared/schemas";
import { useHabitsStore } from "@/store/habits";
import { useRewardsStore } from "@/store/rewards";
import { useSyncStore } from "@/store/sync";

/**
 * Progresso do presente de um hábito. O servidor calcula (o cliente só guarda 90 dias de logs);
 * recarrega ao abrir e quando o dia de hoje muda de situação, depois que a fila sincronizou.
 */
export function useRewardProgress(habit: HabitDto | undefined, today: string) {
  const id = habit?.id;
  const reward = habit?.reward ?? null;
  const cached = useRewardsStore((s) => (id ? s.progress[id] : undefined));
  const todayStatus = useHabitsStore((s) => (id ? s.logs[logKey(id, today)]?.status : undefined));
  const pending = useSyncStore((s) => s.queue.length);
  const [error, setError] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!id || !reward || pending > 0) return;
    let live = true;
    void fetchRewardProgress(id).then(
      (progress) => {
        if (!live) return;
        useRewardsStore.getState().setProgress(id, progress);
        setError(false);
      },
      () => live && setError(true),
    );
    return () => {
      live = false;
    };
    // `todayStatus` e `today` refletem o progresso do dia; `reward` muda ao editar ou resgatar.
  }, [id, reward, today, todayStatus, pending]);

  const claim = useCallback(async (): Promise<RewardProgressDto | null> => {
    if (!id) return null;
    setClaiming(true);
    try {
      const progress = await claimReward(id);
      useRewardsStore.getState().setProgress(id, progress);
      setError(false);
      return progress;
    } catch {
      setError(true);
      return null;
    } finally {
      setClaiming(false);
    }
  }, [id]);

  return { progress: reward ? cached : undefined, error, claiming, claim };
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cancelScheduledNotificationAsync,
  DEFAULT_ACTION_IDENTIFIER,
  getAllScheduledNotificationsAsync,
  type NotificationResponse,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
} from "expo-notifications";
import { DEFAULT_TIMEZONE } from "@/lib/habit-stats";
import { localDate } from "@/shared/dates";
import { useHabitsStore } from "@/store/habits";
import { useProfileStore } from "@/store/profile";
import { useSnoozeStore } from "@/store/snooze";
import { useSyncStore } from "@/store/sync";
import { HABITS_CHANNEL } from "./permission";
import { KIND_SNOOZE } from "./reschedule";
import { canSnooze, SNOOZE_SECONDS } from "./schedule";
import { ACTION_COMPLETE, ACTION_SKIP, ACTION_SNOOZE, HABIT_REMINDER } from "./setup";

export type ActionOutcome = "completed" | "skipped" | "snoozed" | "snooze-limit" | "open" | "ignored";

const LAST_HANDLED_KEY = "vezzo-last-notification-response";

type PersistApi = { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void };

/** Em segundo plano os stores persistidos podem ainda não ter lido o AsyncStorage. */
async function ensureHydrated(): Promise<void> {
  const stores = [useHabitsStore.persist, useSnoozeStore.persist, useSyncStore.persist] as PersistApi[];
  await Promise.all(
    stores.map(
      (p) =>
        new Promise<void>((resolve) => {
          if (p.hasHydrated()) return resolve();
          const off = p.onFinishHydration(() => {
            off();
            resolve();
          });
        }),
    ),
  );
}

const deviceZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
};

/** O mesmo toque pode chegar pelo listener, pela task e por `getLastNotificationResponse`: processa uma vez. */
async function alreadyHandled(response: NotificationResponse): Promise<boolean> {
  const key = `${response.notification.request.identifier}|${response.actionIdentifier}|${response.notification.date}`;
  try {
    if ((await AsyncStorage.getItem(LAST_HANDLED_KEY)) === key) return true;
    await AsyncStorage.setItem(LAST_HANDLED_KEY, key);
  } catch {
    // Sem armazenamento: melhor processar duas vezes (idempotente por hábito+data) do que perder a ação.
  }
  return false;
}

/** Cancela os adiamentos pendentes do hábito (o "segundo lembrete" do dia). */
async function cancelSnoozes(habitId: string): Promise<void> {
  const pending = await getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => n.content.data?.kind === KIND_SNOOZE && n.content.data?.habitId === habitId)
      .map((n) => cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * Ação sobre um lembrete (docs/07): concluir, pular, adiar 1 h (máx. 3 por dia por hábito) ou abrir o hábito.
 * `open` recebe a navegação; fica de fora no segundo plano, onde não há tela para abrir.
 */
export async function handleNotificationResponse(
  response: NotificationResponse,
  open?: (habitId: string) => void,
  now: Date = new Date(),
): Promise<ActionOutcome> {
  const data = response.notification.request.content.data as { habitId?: unknown } | undefined;
  const habitId = typeof data?.habitId === "string" ? data.habitId : null;
  if (!habitId) return "ignored";
  if (await alreadyHandled(response)) return "ignored";
  await ensureHydrated();

  const action = response.actionIdentifier;
  if (action === DEFAULT_ACTION_IDENTIFIER) {
    open?.(habitId);
    return "open";
  }

  const habits = useHabitsStore.getState();
  if (!habits.habits.some((h) => h.id === habitId)) return "ignored";
  const today = localDate(now, useProfileStore.getState().profile?.timezone ?? deviceZone());

  if (action === ACTION_COMPLETE || action === ACTION_SKIP) {
    if (action === ACTION_COMPLETE) habits.applyLog(habitId, today, { status: "DONE" }, "NOTIFICATION");
    else habits.skip(habitId, today);
    await cancelSnoozes(habitId);
    void useSyncStore.getState().flush();
    return action === ACTION_COMPLETE ? "completed" : "skipped";
  }

  if (action === ACTION_SNOOZE) {
    if (!canSnooze(useSnoozeStore.getState().counts, habitId, today)) return "snooze-limit";
    const { title, body } = response.notification.request.content;
    await scheduleNotificationAsync({
      content: {
        title: title ?? undefined,
        body: body ?? undefined,
        sound: "default",
        categoryIdentifier: HABIT_REMINDER,
        data: { kind: KIND_SNOOZE, habitId },
      },
      trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: SNOOZE_SECONDS, channelId: HABITS_CHANNEL },
    });
    useSnoozeStore.getState().register(habitId, today);
    return "snoozed";
  }
  return "ignored";
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cancelScheduledNotificationAsync,
  DEFAULT_ACTION_IDENTIFIER,
  dismissNotificationAsync,
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
import { showActionFeedback } from "./feedback";
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

const responseKey = (response: NotificationResponse) =>
  `${response.notification.request.identifier}|${response.actionIdentifier}|${response.notification.date}`;

/** Chaves já vistas neste processo. A checagem é síncrona: duas entregas simultâneas não passam juntas. */
const seenInProcess = new Set<string>();
const SEEN_LIMIT = 50;

function seenBefore(key: string): boolean {
  if (seenInProcess.has(key)) return true;
  seenInProcess.add(key);
  if (seenInProcess.size > SEEN_LIMIT) {
    const oldest = seenInProcess.values().next().value;
    if (oldest !== undefined) seenInProcess.delete(oldest);
  }
  return false;
}

/** No Android os botões de ação não fecham a notificação sozinhos: fecha logo, antes de qualquer espera. */
function dismiss(response: NotificationResponse): void {
  void dismissNotificationAsync(response.notification.request.identifier).catch(() => {});
}

/** Entre processos (task e listener): o mesmo toque pode chegar mais de uma vez; processa uma só. */
async function alreadyHandled(response: NotificationResponse): Promise<boolean> {
  const key = responseKey(response);
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
  const action = response.actionIdentifier;
  if (seenBefore(responseKey(response))) return "ignored";
  // Ação rápida (não o toque no corpo): a notificação some na hora, sem esperar storage nem rede.
  if (action !== DEFAULT_ACTION_IDENTIFIER) dismiss(response);
  if (await alreadyHandled(response)) return "ignored";
  await ensureHydrated();

  if (action === DEFAULT_ACTION_IDENTIFIER) {
    open?.(habitId);
    return "open";
  }

  const habits = useHabitsStore.getState();
  const habitName = habits.habits.find((h) => h.id === habitId)?.name;
  if (habitName === undefined) return "ignored";
  const today = localDate(now, useProfileStore.getState().profile?.timezone ?? deviceZone());

  if (action === ACTION_COMPLETE || action === ACTION_SKIP) {
    // As duas ações vêm da notificação: `source` registra isso (docs/07).
    habits.applyLog(habitId, today, { status: action === ACTION_COMPLETE ? "DONE" : "SKIPPED" }, "NOTIFICATION");
    const outcome = action === ACTION_COMPLETE ? "completed" : "skipped";
    // Confirma antes das esperas restantes (cancelar adiamentos e enviar ao servidor).
    void showActionFeedback(outcome, habitName);
    await cancelSnoozes(habitId);
    void useSyncStore.getState().flush();
    return outcome;
  }

  if (action === ACTION_SNOOZE) {
    if (!canSnooze(useSnoozeStore.getState().counts, habitId, today)) {
      void showActionFeedback("snooze-limit", habitName);
      return "snooze-limit";
    }
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
    void showActionFeedback("snoozed", habitName);
    return "snoozed";
  }
  return "ignored";
}

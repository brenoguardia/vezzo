import {
  cancelAllScheduledNotificationsAsync,
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  getPermissionsAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
} from "expo-notifications";
import { i18n } from "@/i18n";
import { currentStreak } from "@/shared/stats";
import { DEFAULT_TIMEZONE, toStatHabit, toStatLogs } from "@/lib/habit-stats";
import { localDate } from "@/shared/dates";
import { useHabitsStore } from "@/store/habits";
import { useProfileStore } from "@/store/profile";
import { useSnoozeStore } from "@/store/snooze";
import { motivationalBody, reminderTitle } from "./body";
import { ensureChannel, HABITS_CHANNEL } from "./permission";
import { planReminders } from "./schedule";
import { HABIT_REMINDER, registerCategory } from "./setup";

export const KIND_REMINDER = "reminder";
export const KIND_SNOOZE = "snooze";

let chain: Promise<void> = Promise.resolve();

/** Minuto do dia (0–1439) de um instante no fuso informado. */
function minuteOfDay(now: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(now);
  const [h = 0, m = 0] = parts.split(":").map(Number);
  return (h % 24) * 60 + m;
}

async function run(): Promise<void> {
  const profile = useProfileStore.getState().profile;
  const { habits, logs } = useHabitsStore.getState();
  const store = useHabitsStore.getState();

  const scheduled = await getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind === KIND_REMINDER)
      .map((n) => cancelScheduledNotificationAsync(n.identifier)),
  );
  habits.forEach((h) => store.setScheduledIds(h.id, []));

  const permission = await getPermissionsAsync();
  if (!permission.granted) return;

  await ensureChannel();
  await registerCategory();

  const timeZone = profile?.timezone ?? DEFAULT_TIMEZONE;
  const now = new Date();
  const plans = planReminders(habits, { today: localDate(now, timeZone), minute: minuteOfDay(now, timeZone) });
  const locale = i18n.locale === "en" ? "en" : "pt-BR";
  const statLogs = toStatLogs(logs);
  const today = localDate(now, timeZone);
  const byHabit = new Map(habits.map((h) => [h.id, h]));
  const ids = new Map<string, string[]>();

  for (const plan of plans) {
    const habit = byHabit.get(plan.habitId);
    if (!habit) continue;
    const streak = currentStreak([toStatHabit(habit, timeZone)], statLogs.filter((l) => l.habitId === habit.id), today);
    const id = await scheduleNotificationAsync({
      content: {
        title: reminderTitle(habit),
        body: motivationalBody(habit, profile?.displayName ?? "", streak, locale),
        sound: "default",
        categoryIdentifier: plan.quickActions ? HABIT_REMINDER : undefined,
        data: { kind: KIND_REMINDER, habitId: habit.id },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.WEEKLY,
        weekday: plan.weekday,
        hour: plan.hour,
        minute: plan.minute,
        channelId: HABITS_CHANNEL,
      },
    });
    ids.set(habit.id, [...(ids.get(habit.id) ?? []), id]);
  }
  ids.forEach((list, habitId) => store.setScheduledIds(habitId, list));
}

/**
 * Recria todos os lembretes semanais (docs/07). Roda após login, ao editar hábitos, ao mudar fuso/idioma
 * e ao abrir o app. Chamadas concorrentes são serializadas; adiamentos pendentes não são tocados.
 */
export function rescheduleAll(): Promise<void> {
  chain = chain.then(run, run).catch(() => {});
  return chain;
}

/** Logout: cancela tudo (inclui adiamentos) e zera a contagem. */
export async function cancelAllReminders(): Promise<void> {
  chain = chain.then(async () => {
    try {
      await cancelAllScheduledNotificationsAsync();
    } catch {
      // Sem módulo nativo (web): nada agendado.
    }
    useSnoozeStore.getState().clear();
  });
  return chain;
}

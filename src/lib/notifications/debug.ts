import {
  getAllScheduledNotificationsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
} from "expo-notifications";
import { t } from "@/i18n";
import { useHabitsStore } from "@/store/habits";
import { ensureChannel, HABITS_CHANNEL } from "./permission";
import { KIND_REMINDER } from "./reschedule";
import { HABIT_REMINDER } from "./setup";

/** Ferramenta de dev (docs/07): dispara um lembrete real, com os botões, em `seconds` segundos. */
export async function scheduleTestReminder(seconds = 5): Promise<string> {
  await ensureChannel();
  const habit = useHabitsStore.getState().habits.find((h) => !h.archivedAt);
  return scheduleNotificationAsync({
    content: {
      title: habit ? t("notif.title", { habit: habit.name }) : t("notif.debugTitle"),
      body: t("notif.debugBody"),
      sound: "default",
      categoryIdentifier: HABIT_REMINDER,
      data: { kind: KIND_REMINDER, habitId: habit?.id, test: true },
    },
    trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: HABITS_CHANNEL },
  });
}

export async function pendingCount(): Promise<number> {
  return (await getAllScheduledNotificationsAsync()).length;
}

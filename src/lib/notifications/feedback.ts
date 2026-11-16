import * as Haptics from "expo-haptics";
import {
  dismissNotificationAsync,
  getPresentedNotificationsAsync,
  scheduleNotificationAsync,
} from "expo-notifications";
import { AppState, Platform } from "react-native";
import { t } from "@/i18n";
import { useToastStore } from "@/store/toast";
import { ensureFeedbackChannel, FEEDBACK_CHANNEL } from "./permission";

export const KIND_FEEDBACK = "feedback";
/** Quanto tempo a confirmação fica na bandeja (em segundo plano o JS pode congelar antes; ver `dismissStaleFeedback`). */
export const FEEDBACK_VISIBLE_MS = 4000;

export type FeedbackOutcome = "completed" | "skipped" | "snoozed" | "snooze-limit";

const KEY: Record<FeedbackOutcome, string> = {
  completed: "notif.feedback.completed",
  skipped: "notif.feedback.skipped",
  snoozed: "notif.feedback.snoozed",
  "snooze-limit": "notif.feedback.snoozeLimit",
};

export const feedbackMessage = (outcome: FeedbackOutcome, habit: string) => t(KEY[outcome], { habit });

/**
 * Confirma uma ação rápida da notificação: haptic leve e, conforme o app, toast (em primeiro plano) ou uma
 * notificação curta sem botões (segundo plano ou encerrado). Nunca lança: o feedback não pode quebrar a ação.
 */
export async function showActionFeedback(outcome: FeedbackOutcome, habitName: string): Promise<void> {
  const message = feedbackMessage(outcome, habitName);
  try {
    void Haptics.notificationAsync(
      outcome === "snooze-limit" ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
  } catch {
    // Sem haptics (simulador, headless): segue sem vibrar.
  }
  try {
    if (AppState.currentState === "active") {
      useToastStore.getState().show(message);
      return;
    }
    await ensureFeedbackChannel();
    const id = await scheduleNotificationAsync({
      content: { title: message, sound: false, data: { kind: KIND_FEEDBACK } },
      trigger: Platform.OS === "android" ? { channelId: FEEDBACK_CHANNEL } : null,
    });
    setTimeout(() => void dismissNotificationAsync(id).catch(() => {}), FEEDBACK_VISIBLE_MS);
  } catch {
    // Sem permissão ou sem módulo: a ação já foi gravada, só falta o aviso.
  }
}

/** Remove confirmações que ficaram na bandeja (o processo foi congelado antes do tempo). */
export async function dismissStaleFeedback(): Promise<void> {
  try {
    const shown = await getPresentedNotificationsAsync();
    await Promise.all(
      shown
        .filter((n) => n.request.content.data?.kind === KIND_FEEDBACK)
        .map((n) => dismissNotificationAsync(n.request.identifier)),
    );
  } catch {
    // Melhor esforço.
  }
}

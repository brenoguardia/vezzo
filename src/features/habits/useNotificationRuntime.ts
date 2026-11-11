import { useEffect } from "react";
import { AppState } from "react-native";
import { useLocale } from "@/i18n/useLocale";
import { registerBackgroundActions } from "@/lib/notifications/background";
import { registerForPush } from "@/lib/notifications/push";
import { rescheduleAll } from "@/lib/notifications/reschedule";
import { configureNotificationHandler, registerCategory } from "@/lib/notifications/setup";
import { useHabitsStore } from "@/store/habits";
import { useProfileStore } from "@/store/profile";

configureNotificationHandler();

/** Só o que muda lembretes: nome, meta, dias, horários, ações rápidas e arquivamento. */
const scheduleFingerprint = (habits: ReturnType<typeof useHabitsStore.getState>["habits"]) =>
  JSON.stringify(
    habits.map((h) => [h.id, h.name, h.goalValue, h.goalUnit, h.days, h.reminders, h.quickActions, h.archivedAt]),
  );

/**
 * Liga as notificações (docs/07) enquanto há sessão e onboarding concluído: categoria, ações em primeiro e
 * segundo plano, token de push e reagendamento ao abrir, editar hábitos ou mudar idioma/fuso.
 */
export function useNotificationRuntime(enabled: boolean) {
  const locale = useLocale();
  const timeZone = useProfileStore((s) => s.profile?.timezone);
  const fingerprint = useHabitsStore((s) => scheduleFingerprint(s.habits));

  useEffect(() => {
    if (!enabled) return;
    void registerBackgroundActions();
    void registerForPush();
    const app = AppState.addEventListener("change", (s) => {
      if (s !== "active") return;
      void rescheduleAll();
      void registerForPush(); // permissão pode ter sido concedida nos Ajustes
    });
    return () => {
      app.remove();
    };
  }, [enabled]);

  // Categoria (rótulos) e textos dependem do idioma; agenda depende de hábitos e fuso.
  useEffect(() => {
    if (!enabled) return;
    void registerCategory().then(rescheduleAll);
  }, [enabled, locale, timeZone, fingerprint]);
}

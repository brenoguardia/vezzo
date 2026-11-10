import {
  setNotificationCategoryAsync,
  setNotificationHandler,
} from "expo-notifications";
import { t } from "@/i18n";

export const HABIT_REMINDER = "HABIT_REMINDER";
export const ACTION_COMPLETE = "COMPLETE";
export const ACTION_SNOOZE = "SNOOZE_1H";
export const ACTION_SKIP = "SKIP";

/** Em primeiro plano o lembrete também aparece (banner + lista + som). */
export function configureNotificationHandler(): void {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Registra a categoria com rótulos no idioma atual; chamar de novo quando o idioma mudar. */
export async function registerCategory(): Promise<void> {
  try {
    await setNotificationCategoryAsync(HABIT_REMINDER, [
      { identifier: ACTION_COMPLETE, buttonTitle: t("notif.complete"), options: { opensAppToForeground: false } },
      { identifier: ACTION_SNOOZE, buttonTitle: t("notif.snooze"), options: { opensAppToForeground: false } },
      {
        identifier: ACTION_SKIP,
        buttonTitle: t("notif.skip"),
        options: { opensAppToForeground: false, isDestructive: false },
      },
    ]);
  } catch {
    // Sem suporte (web/simulador antigo): os lembretes seguem, só sem botões.
  }
}

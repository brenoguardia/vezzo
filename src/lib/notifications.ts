import {
  AndroidImportance,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
} from "expo-notifications";
import { Platform } from "react-native";

export type ReminderPermission = "granted" | "denied";

/**
 * Pede permissão de notificação (docs/07). Android 13+: cria o canal `habits` antes de pedir.
 * Nunca lança: falha do módulo conta como negada para não bloquear o fim do onboarding.
 */
export async function requestReminderPermission(): Promise<ReminderPermission> {
  try {
    if (Platform.OS === "android") {
      await setNotificationChannelAsync("habits", {
        name: "habits",
        importance: AndroidImportance.DEFAULT,
      });
    }
    const current = await getPermissionsAsync();
    if (current.granted) return "granted";
    if (!current.canAskAgain) return "denied";
    const result = await requestPermissionsAsync();
    return result.granted ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

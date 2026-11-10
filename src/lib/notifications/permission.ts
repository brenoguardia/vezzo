import {
  AndroidImportance,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
} from "expo-notifications";
import { Platform } from "react-native";

export const HABITS_CHANNEL = "habits";

/** Android: o canal precisa existir antes de pedir permissão (13+) e antes de agendar. */
export async function ensureChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await setNotificationChannelAsync(HABITS_CHANNEL, { name: HABITS_CHANNEL, importance: AndroidImportance.DEFAULT });
}

export type ReminderPermission = "granted" | "denied";

/**
 * Pede permissão de notificação (docs/07). Android 13+: cria o canal `habits` antes de pedir.
 * Nunca lança: falha do módulo conta como negada para não bloquear o fim do onboarding.
 */
export async function requestReminderPermission(): Promise<ReminderPermission> {
  try {
    await ensureChannel();
    const current = await getPermissionsAsync();
    if (current.granted) return "granted";
    if (!current.canAskAgain) return "denied";
    const result = await requestPermissionsAsync();
    return result.granted ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

/** Estado atual da permissão sem perguntar nada (Perfil → Lembretes). */
export async function getReminderPermission(): Promise<ReminderPermission> {
  try {
    return (await getPermissionsAsync()).granted ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

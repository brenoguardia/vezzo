import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { getExpoPushTokenAsync } from "expo-notifications";
import { Platform } from "react-native";
import { registerPushToken, unregisterPushToken } from "@/api/push";
import { getReminderPermission } from "./permission";

const TOKEN_KEY = "vezzo-push-token";

function projectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

/** Registra o token Expo no servidor. Só em aparelho físico, com permissão e projectId; nunca lança. */
export async function registerForPush(): Promise<string | null> {
  try {
    if (!Device.isDevice || (Platform.OS !== "ios" && Platform.OS !== "android")) return null;
    if ((await getReminderPermission()) !== "granted") return null;
    const id = projectId();
    if (!id) return null;
    const { data: token } = await getExpoPushTokenAsync({ projectId: id });
    await registerPushToken({ token, platform: Platform.OS });
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
}

/** Logout: remove o token do servidor (precisa rodar com a sessão ainda válida). Melhor esforço. */
export async function unregisterPush(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return;
    await unregisterPushToken(token);
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // Sem rede: o servidor reatribui o token no próximo login nesse aparelho.
  }
}

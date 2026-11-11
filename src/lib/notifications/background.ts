import {
  addNotificationResponseReceivedListener,
  getLastNotificationResponse,
  type NotificationResponse,
  registerTaskAsync,
} from "expo-notifications";
import { router } from "expo-router";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import { useSyncStore } from "@/store/sync";
import { handleNotificationResponse } from "./actions";

export const NOTIFICATION_ACTION_TASK = "VEZZO-NOTIFICATION-ACTION";

const isResponse = (data: unknown): data is NotificationResponse =>
  typeof data === "object" && data !== null && "actionIdentifier" in data;

// Escopo de módulo (importado cedo no layout raiz): o gerenciador carrega o bundle em segundo plano.
// No Android a task roda para toques em ações com o app em segundo plano ou fechado; no iOS esses toques
// chegam por `getLastNotificationResponse()` na abertura (ver `useNotificationRuntime`).
TaskManager.defineTask<unknown>(NOTIFICATION_ACTION_TASK, async ({ data }) => {
  if (!isResponse(data)) return;
  await handleNotificationResponse(data);
  // O envio normal espera um debounce de 1 s; a task termina logo depois do handler e o Android
  // congela o processo, deixando a ação só na fila local. Envia agora, enquanto o app está vivo.
  await useSyncStore.getState().flush();
});

export function registerBackgroundActions(): Promise<unknown> {
  return registerTaskAsync(NOTIFICATION_ACTION_TASK).catch(() => null);
}

const openHabit = (habitId: string) => router.push({ pathname: "/habit/[id]", params: { id: habitId } });

/**
 * Resposta a uma ação da notificação (Concluir/Adiar/Pular/toque). Registrada aqui, no ponto de entrada, e
 * não num hook: no Android o toque numa ação com o app encerrado inicia só o processo e entrega a resposta
 * ao listener que existir; sem tela renderizada nenhum hook rodou. Depois de gravar, envia a fila na hora
 * (o debounce normal de 1 s não cabe: o processo é congelado logo em seguida).
 */
const respond = (response: NotificationResponse) =>
  handleNotificationResponse(response, openHabit).then(() => useSyncStore.getState().flush());

// Só no app nativo: este módulo também é avaliado no servidor/web (`expo export`), sem `expo-notifications`.
if (Platform.OS !== "web") {
  addNotificationResponseReceivedListener((response) => void respond(response));
  const initialResponse = getLastNotificationResponse();
  if (initialResponse) void respond(initialResponse);
}

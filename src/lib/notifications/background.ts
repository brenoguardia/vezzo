import { type NotificationResponse, registerTaskAsync } from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { handleNotificationResponse } from "./actions";

export const NOTIFICATION_ACTION_TASK = "VEZZO-NOTIFICATION-ACTION";

const isResponse = (data: unknown): data is NotificationResponse =>
  typeof data === "object" && data !== null && "actionIdentifier" in data;

// Escopo de módulo (importado cedo no layout raiz): o gerenciador carrega o bundle em segundo plano.
// No Android a task roda para toques em ações com o app em segundo plano ou fechado; no iOS esses toques
// chegam por `getLastNotificationResponse()` na abertura (ver `useNotificationRuntime`).
TaskManager.defineTask<unknown>(NOTIFICATION_ACTION_TASK, async ({ data }) => {
  if (isResponse(data)) await handleNotificationResponse(data);
});

export function registerBackgroundActions(): Promise<unknown> {
  return registerTaskAsync(NOTIFICATION_ACTION_TASK).catch(() => null);
}

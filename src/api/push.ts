import { apiFetch } from "@/api/client";
import { type PushRegister, pushOk } from "@/shared/schemas";

export const registerPushToken = (input: PushRegister) =>
  apiFetch("/v1/push/register", pushOk, { method: "POST", body: JSON.stringify(input) });

export const unregisterPushToken = (token: string) =>
  apiFetch("/v1/push/register", pushOk, { method: "DELETE", body: JSON.stringify({ token }) });

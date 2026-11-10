import { apiFetch } from "@/api/client";
import { accountDeleted } from "@/shared/schemas";

/** `DELETE /v1/account`: exige login recente (403 `REAUTH_REQUIRED` caso contrário). */
export async function deleteAccount(): Promise<void> {
  await apiFetch("/v1/account", accountDeleted, { method: "DELETE" });
}

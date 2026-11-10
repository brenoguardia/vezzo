import { authClient } from "@/auth/client";
import { clearHabitData } from "@/features/habits/hydrate";
import { unregisterPush } from "@/lib/notifications/push";
import { cancelAllReminders } from "@/lib/notifications/reschedule";
import { useProfileStore } from "@/store/profile";

/** Encerra a sessão local e limpa o perfil; a guarda de rotas leva ao login. */
export async function signOutAndClear(): Promise<void> {
  await unregisterPush(); // precisa da sessão ainda válida
  await cancelAllReminders();
  try {
    await authClient.signOut();
  } catch {
    // Sem rede: o cookie local é descartado mesmo assim pelo cliente.
  }
  authClient.$store.notify("$sessionSignal");
  useProfileStore.getState().clear();
  clearHabitData();
}

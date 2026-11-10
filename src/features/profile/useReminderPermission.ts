import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { getReminderPermission, type ReminderPermission } from "@/lib/notifications/permission";

/** Permissão de notificação atual; revalida ao voltar dos Ajustes do sistema. `null` enquanto consulta. */
export function useReminderPermission(): ReminderPermission | null {
  const [permission, setPermission] = useState<ReminderPermission | null>(null);
  useEffect(() => {
    let alive = true;
    const refresh = () => void getReminderPermission().then((p) => alive && setPermission(p));
    refresh();
    const sub = AppState.addEventListener("change", (s) => s === "active" && refresh());
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return permission;
}

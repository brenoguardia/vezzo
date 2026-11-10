import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { DEFAULT_TIMEZONE } from "@/lib/habit-stats";
import { localDate, type Ymd } from "@/shared/dates";
import { useProfileStore } from "@/store/profile";

/** Data local de hoje no fuso do perfil; atualiza ao voltar ao primeiro plano e a cada minuto (virada do dia). */
export function useToday(): Ymd {
  const timeZone = useProfileStore((s) => s.profile?.timezone ?? DEFAULT_TIMEZONE);
  const [today, setToday] = useState(() => localDate(new Date(), timeZone));
  useEffect(() => {
    const refresh = () => setToday(localDate(new Date(), timeZone));
    refresh();
    const timer = setInterval(refresh, 60_000);
    const sub = AppState.addEventListener("change", (s) => s === "active" && refresh());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [timeZone]);
  return today;
}

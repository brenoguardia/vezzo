import { Pressable, StyleSheet, View } from "react-native";
import { Card, Text } from "@/components/ui";
import { useT } from "@/i18n/useT";
import { DEFAULT_TIMEZONE } from "@/lib/habit-stats";
import { useHabitsStore } from "@/store/habits";
import { useHydrationStore } from "@/store/hydration";
import { useProfileStore } from "@/store/profile";
import { useSyncStore } from "@/store/sync";
import { hydrateHabits } from "./hydrate";

/**
 * Primeira carga sem cache: a lista vazia seria enganosa, então mostramos um skeleton.
 * Com hábitos em cache (mesmo antigos) a tela já renderiza normalmente.
 */
export function useLoadingFirst(): boolean {
  const empty = useHabitsStore((s) => s.habits.length === 0);
  const status = useHydrationStore((s) => s.status);
  return empty && (status === "loading" || status === "idle");
}

/** A hidratação inicial ainda não terminou (nem deu erro): dados ausentes podem só não ter chegado. */
export function useHydrating(): boolean {
  const status = useHydrationStore((s) => s.status);
  return status === "loading" || status === "idle";
}

/**
 * Avisos de sincronização das abas: alterações em envio ("Sincronizando…", ou "Sem conexão" depois
 * de uma falha) e a faixa de erro da última hidratação, com "Tentar de novo".
 */
export function SyncStatus() {
  const t = useT();
  const timeZone = useProfileStore((s) => s.profile?.timezone ?? DEFAULT_TIMEZONE);
  const hydration = useHydrationStore((s) => s.status);
  const pendingSync = useSyncStore((s) => s.queue.length > 0);
  const syncFailed = useSyncStore((s) => s.failed);

  return (
    <>
      {pendingSync ? (
        <Text variant="caption" tone="mute" accessibilityLiveRegion="polite">
          {t(syncFailed ? "home.syncPending" : "home.syncing")}
        </Text>
      ) : null}
      {hydration === "error" ? (
        <View accessibilityLiveRegion="polite">
          <Card radius={16} padding={12} style={styles.banner}>
            <Text variant="caption" tone="mute" style={styles.flex}>
              {t("home.offline")}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => void hydrateHabits(timeZone)} style={styles.retry}>
              <Text variant="captionStrong" tone="acc">
                {t("common.retry")}
              </Text>
            </Pressable>
          </Card>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  banner: { flexDirection: "row", alignItems: "center", gap: 8 },
  retry: { minHeight: 44, minWidth: 44, justifyContent: "center", alignItems: "center" },
});

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

/** Blocos cinza no lugar do conteúdo enquanto a primeira carga não termina. */
export function ListSkeleton({ summary = false, rows = 3 }: { summary?: boolean; rows?: number }) {
  const t = useT();
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={t("home.loading")} style={styles.list}>
      {summary ? (
        <Card radius={28} padding={20} style={styles.skeletonSummary}>
          {null}
        </Card>
      ) : null}
      {Array.from({ length: rows }, (_, i) => (
        <Card key={i} radius={20} padding={0} style={styles.skeletonRow}>
          {null}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: 10 },
  banner: { flexDirection: "row", alignItems: "center", gap: 8 },
  retry: { minHeight: 44, minWidth: 44, justifyContent: "center", alignItems: "center" },
  skeletonSummary: { height: 152 },
  skeletonRow: { height: 64, opacity: 0.6 },
});

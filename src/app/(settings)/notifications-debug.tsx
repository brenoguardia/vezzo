import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Text } from "@/components/ui";
import { useReminderPermission } from "@/features/profile/useReminderPermission";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { useT } from "@/i18n/useT";
import { pendingCount, scheduleTestReminder } from "@/lib/notifications/debug";
import { rescheduleAll } from "@/lib/notifications/reschedule";
import { useToastStore } from "@/store/toast";

/** Somente dev (`__DEV__`): dispara um lembrete em 5 s e mostra o estado dos agendamentos. */
export default function NotificationsDebug() {
  const t = useT();
  const permission = useReminderPermission();
  const showToast = useToastStore((s) => s.show);
  const [pending, setPending] = useState<number | null>(null);

  const refresh = useCallback(() => void pendingCount().then(setPending).catch(() => setPending(null)), []);
  useEffect(refresh, [refresh]);

  if (!__DEV__) return null;

  return (
    <SettingsShell tabBar={false} back title={t("profile.debugReminder")}>
      <Card radius={20} padding={16} style={styles.card}>
        <Text variant="caption" tone="mute">
          {t("profile.reminders")}
        </Text>
        <Text variant="bodyStrong">{permission ?? "…"}</Text>
        <Text variant="caption" tone="mute">
          Agendadas
        </Text>
        <Text variant="bodyStrong">{pending ?? "…"}</Text>
      </Card>
      <Button
        label={t("profile.debugReminder")}
        onPress={async () => {
          await scheduleTestReminder(5);
          showToast(t("profile.debugReminderSent"));
          refresh();
        }}
      />
      <Button
        label="rescheduleAll()"
        variant="secondary"
        onPress={async () => {
          await rescheduleAll();
          refresh();
        }}
      />
    </SettingsShell>
  );
}

const styles = StyleSheet.create({ card: { gap: 4 } });

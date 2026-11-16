import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "@/components/ui";
import { useLocale } from "@/i18n/useLocale";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";
import type { HabitDto, RewardDto, RewardProgressDto } from "@/shared/schemas";
import { useToastStore } from "@/store/toast";

interface Props {
  habit: HabitDto;
  reward: RewardDto;
  progress: RewardProgressDto | undefined;
  error: boolean;
  claiming: boolean;
  onClaim: () => void;
}

const dayMonth = (ymd: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(
    new Date(`${ymd}T00:00:00Z`),
  );

/** Presente do hábito: progresso rumo à meta e, ao cumprir, o resgate. */
export function RewardCard({ reward, progress, error, claiming, onClaim }: Props) {
  const t = useT();
  const theme = useTheme();
  const locale = useLocale();
  const state = progress?.state ?? "ACTIVE";
  const lastState = useRef(state);

  // Avisa uma vez quando a meta passa de ativa para conquistada nesta sessão.
  useEffect(() => {
    if (lastState.current === "ACTIVE" && state === "ACHIEVED") {
      useToastStore.getState().show(t("habit.reward.achievedToast"));
    }
    lastState.current = state;
  }, [state, t]);

  const percent = progress?.percent ?? 0;
  const gift = `${reward.emoji} ${reward.title}`;
  const highlighted = state !== "ACTIVE";

  return (
    <Card radius={20} padding={16} style={[styles.card, highlighted && { borderWidth: 2, borderColor: theme.acc }]}>
      <Text variant="caption" tone="mute">
        {t("habit.reward.cardTitle")}
      </Text>
      <Text variant="sectionTitle">{gift}</Text>

      {state === "ACTIVE" ? (
        <>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(percent * 100) }}
            style={[styles.track, { backgroundColor: theme.line }]}
          >
            <View style={[styles.fill, { backgroundColor: theme.acc, width: `${percent * 100}%` }]} />
          </View>
          <Text variant="bodyMedium">
            {t("habit.reward.progress", { run: progress?.currentRun ?? 0, total: reward.days })}
          </Text>
          <Text variant="caption" tone="mute">
            {progress && progress.daysLeft === 1
              ? t("habit.reward.daysLeftOne")
              : t("habit.reward.daysLeft", { count: progress?.daysLeft ?? reward.days })}
          </Text>
          {progress && progress.attempts > 1 ? (
            <>
              <Text variant="caption" tone="mute">
                {t("habit.reward.restarted", { date: dayMonth(progress.runStart, locale), count: progress.attempts })}
              </Text>
              <Text variant="caption" tone="mute">
                {t("habit.reward.best", { count: progress.best })}
              </Text>
            </>
          ) : null}
        </>
      ) : null}

      {state === "ACHIEVED" ? (
        <>
          <Text variant="bodyStrong">{t("habit.reward.achievedTitle")}</Text>
          <Text variant="body">{t("habit.reward.achievedSub", { gift })}</Text>
          <Button label={t("habit.reward.claim")} onPress={onClaim} loading={claiming} />
        </>
      ) : null}

      {state === "CLAIMED" ? (
        <>
          <Text variant="bodyStrong">{t("habit.reward.claimed")}</Text>
          {progress?.achievedDate ? (
            <Text variant="caption" tone="mute">
              {t("habit.reward.claimedSub", { gift, date: dayMonth(progress.achievedDate, locale) })}
            </Text>
          ) : null}
        </>
      ) : null}

      {error ? (
        <Text variant="caption" tone="danger" accessibilityRole="alert">
          {state === "ACHIEVED" ? t("habit.reward.claimError") : t("habit.reward.loadError")}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  track: { height: 10, borderRadius: 5, overflow: "hidden" },
  fill: { height: 10, borderRadius: 5 },
});

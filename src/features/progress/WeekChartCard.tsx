import { View } from "react-native";
import { BarChart, Card, Text } from "@/components/ui";
import { useToday } from "@/features/habits/useToday";
import { useWeekStats } from "@/features/progress/useWeekStats";
import { t } from "@/i18n";
import { weekdayIndex } from "@/shared/dates";

/** Gráfico semanal: painel direito de Hoje no modo dual quando nenhum hábito está selecionado. */
export function WeekChartCard() {
  const today = useToday();
  const week = useWeekStats();
  return (
    <View style={{ gap: 14 }}>
      <Text variant="sectionTitle" accessibilityRole="header">
        {t("progress.title")}
      </Text>
      <Card radius={28} padding={20} style={{ gap: 12 }}>
        <Text variant="bodyMedium" tone="mute">
          {t("progress.completion")}
        </Text>
        <Text variant="display">{`${Math.round(week.cmp.current.completion * 100)}%`}</Text>
        <BarChart
          accessibilityLabel={t("progress.completion")}
          data={week.days.map((d) => ({
            label: t(`onboarding.daysLetters.${weekdayIndex(d.date)}`),
            value: d.completion,
            highlight: d.date === today,
          }))}
        />
      </Card>
      <Text tone="mute">{t("home.selectHint")}</Text>
    </View>
  );
}

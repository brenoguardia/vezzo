import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Chip, DayPills, EmojiTile, Stepper, Text } from "@/components/ui";
import type { LandingCopy } from "@/i18n/landing";
import { useTheme } from "@/lib/useTheme";
import { radius } from "@/shared/tokens";
import { DemoShell } from "./DemoShell";

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [0, 1, 2, 3, 4];

/** Criar hábito, ao vivo: escolha o hábito, ajuste a meta e os dias; a prévia acompanha. */
export function CreateDemo({ copy, days }: { copy: LandingCopy["create"]; days: LandingCopy["days"] }) {
  const theme = useTheme();
  const [presetIndex, setPresetIndex] = useState(0);
  const preset = copy.presets[presetIndex] ?? copy.presets[0];
  const [goal, setGoal] = useState(preset?.start ?? 0);
  const [active, setActive] = useState<number[]>(WEEKDAYS);
  if (!preset) return null;

  const choose = (index: number) => {
    const next = copy.presets[index];
    if (!next) return;
    setPresetIndex(index);
    setGoal(next.start);
  };
  // O hábito precisa de ao menos um dia, como no app.
  const changeDays = (next: number[]) => {
    if (next.length > 0) setActive(next);
  };
  const schedule = active.length === ALL_DAYS.length ? copy.everyDay : active.map((d) => days.abbr[d]).join(", ");

  return (
    <DemoShell hint={copy.hint}>
      <View style={[styles.preview, { backgroundColor: theme.bg }]} accessibilityLiveRegion="polite">
        <EmojiTile emoji={preset.emoji} size={48} />
        <View style={styles.previewText}>
          <Text variant="bodyStrong">{preset.name}</Text>
          <Text variant="caption" tone="mute">
            {goal} {preset.unit} · {schedule}
          </Text>
        </View>
      </View>

      <View style={styles.group}>
        <Text variant="label" tone="mute">
          {copy.presetsLabel}
        </Text>
        <View style={styles.chips}>
          {copy.presets.map((item, index) => (
            <Chip
              key={item.name}
              emoji={item.emoji}
              label={item.name}
              selected={index === presetIndex}
              onPress={() => choose(index)}
            />
          ))}
        </View>
      </View>

      <View style={styles.goalRow}>
        <Text variant="bodyMedium">{copy.goalLabel}</Text>
        <Stepper
          value={`${goal} ${preset.unit}`}
          decrementLabel={copy.decrease}
          incrementLabel={copy.increase}
          decrementDisabled={goal - preset.step < preset.step}
          onDecrement={() => setGoal((g) => Math.max(preset.step, g - preset.step))}
          onIncrement={() => setGoal((g) => g + preset.step)}
        />
      </View>

      <View style={styles.group}>
        <Text variant="label" tone="mute">
          {copy.daysLabel}
        </Text>
        <DayPills labels={days.short} accessibilityLabels={days.full} value={active} onChange={changeDays} />
      </View>
    </DemoShell>
  );
}

const styles = StyleSheet.create({
  preview: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: radius.card, padding: 14 },
  previewText: { flex: 1, gap: 2 },
  group: { gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});

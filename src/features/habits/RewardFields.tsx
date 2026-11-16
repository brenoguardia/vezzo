import { type Control, Controller, useFormState } from "react-hook-form";
import { StyleSheet, Switch, View } from "react-native";
import { Card, Chip, EmojiField, Field, Text } from "@/components/ui";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";
import { REWARD_PRESETS } from "@/shared/reward";
import { DEFAULT_REWARD_EMOJI, REWARD_TITLE_MAX } from "@/shared/schemas";
import type { HabitFormOutput, HabitFormValues } from "./HabitForm";

const DEFAULT_DAYS = 90;

/** Bloco opcional "Meta e presente" do formulário de hábito. `reward: null` significa sem presente. */
export function RewardFields({ control }: { control: Control<HabitFormValues, unknown, HabitFormOutput> }) {
  const t = useT();
  const theme = useTheme();
  const { errors } = useFormState({ control, name: "reward" });

  return (
    <View style={styles.block}>
      <Text variant="label" tone="mute">
        {t("habit.reward.section")}
      </Text>
      <Controller
        control={control}
        name="reward"
        render={({ field }) => {
          const reward = field.value;
          return (
            <>
              <Card radius={16} padding={14} style={styles.switchRow}>
                <View style={styles.flex}>
                  <Text variant="bodyMedium">{t("habit.reward.toggle")}</Text>
                  <Text variant="caption" tone="mute">
                    {t("habit.reward.hint")}
                  </Text>
                </View>
                <Switch
                  accessibilityLabel={t("habit.reward.toggle")}
                  value={!!reward}
                  onValueChange={(on) =>
                    field.onChange(on ? { title: "", emoji: DEFAULT_REWARD_EMOJI, days: DEFAULT_DAYS } : null)
                  }
                  trackColor={{ true: theme.acc, false: theme.line }}
                />
              </Card>

              {reward ? (
                <>
                  <Field
                    label={t("habit.reward.titleLabel")}
                    placeholder={t("habit.reward.titlePlaceholder")}
                    value={reward.title}
                    onChangeText={(title) => field.onChange({ ...reward, title })}
                    onBlur={field.onBlur}
                    maxLength={REWARD_TITLE_MAX}
                    error={errors.reward?.title ? t("habit.reward.titleRequired") : undefined}
                  />
                  <Text variant="label" tone="mute">
                    {t("habit.reward.emoji")}
                  </Text>
                  <EmojiField
                    value={reward.emoji}
                    onChange={(emoji) => field.onChange({ ...reward, emoji })}
                    customLabel={t("habit.emojiCustom")}
                    error={errors.reward?.emoji ? t("habit.emojiInvalid") : undefined}
                  />
                  <View style={styles.chips}>
                    {REWARD_PRESETS.map((days) => (
                      <Chip
                        key={days}
                        label={t("habit.reward.preset", { count: days })}
                        selected={reward.days === days}
                        onPress={() => field.onChange({ ...reward, days })}
                      />
                    ))}
                  </View>
                  <Field
                    label={t("habit.reward.duration")}
                    keyboardType="number-pad"
                    value={reward.days ? String(reward.days) : ""}
                    onChangeText={(text) => field.onChange({ ...reward, days: Number(text.replace(/\D/g, "")) })}
                    maxLength={3}
                    error={errors.reward?.days ? t("habit.reward.durationInvalid") : undefined}
                  />
                </>
              ) : null}
            </>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  block: { gap: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
});

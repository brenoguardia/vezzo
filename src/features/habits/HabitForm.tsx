import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ScrollView, StyleSheet, Switch, View } from "react-native";
import type { z } from "zod";
import { Button, Card, Chip, DayPills, EmojiField, Field, Stepper, Text, TimeChips } from "@/components/ui";
import { currentLocale, dayLetters, dayNames } from "@/features/onboarding/locale";
import { t } from "@/i18n";
import { useTheme } from "@/lib/useTheme";
import { CATEGORIES, GOAL_UNITS, type GoalUnit } from "@/shared/categories";
import { defaultsOf, formatGoal, stepGoal, stepSize, templateName } from "@/shared/onboarding";
import { habitInput } from "@/shared/schemas";

export type HabitFormValues = z.input<typeof habitInput>;
export type HabitFormOutput = z.output<typeof habitInput>;

export const BLANK_HABIT: HabitFormValues = {
  name: "",
  emoji: "🎯",
  goalValue: 1,
  goalUnit: "BOOLEAN",
  days: [0, 1, 2, 3, 4, 5, 6],
  reminders: [],
  quickActions: true,
};

interface Props {
  defaultValues?: HabitFormValues;
  /** Atalhos de atividades pré-definidas (só ao criar). */
  showTemplates?: boolean;
  onSubmit: (values: HabitFormOutput) => Promise<void>;
  onCancel: () => void;
  title: string;
  /** Conteúdo extra ao fim do formulário (ex.: arquivar). */
  extra?: ReactNode;
}

/** Criar/editar hábito (docs/05, tela 8): React Hook Form + `habitInput`. Erros do servidor viram `root`. */
export function HabitForm({ defaultValues = BLANK_HABIT, showTemplates, onSubmit, onCancel, title, extra }: Props) {
  const theme = useTheme();
  const locale = currentLocale();
  const form = useForm<HabitFormValues, unknown, HabitFormOutput>({
    resolver: zodResolver(habitInput),
    mode: "onChange",
    defaultValues,
  });
  const { control, handleSubmit, setError, setValue, formState } = form;
  const unit = useWatch({ control, name: "goalUnit" }) as GoalUnit;
  const goal = useWatch({ control, name: "goalValue" });
  const step = stepSize(unit);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch {
      setError("root", { message: t("habit.saveError") });
    }
  });

  const apply = (patch: Partial<HabitFormValues>) =>
    (Object.keys(patch) as (keyof HabitFormValues)[]).forEach((k) =>
      setValue(k, patch[k] as never, { shouldValidate: true, shouldDirty: true }),
    );

  return (
    <View style={styles.flex}>
      <View style={styles.bar}>
        <Button label={t("habit.cancel")} variant="secondary" onPress={onCancel} style={styles.barBtn} />
        <Text variant="bodyStrong" accessibilityRole="header">
          {title}
        </Text>
        <Button
          label={t("habit.save")}
          onPress={() => void submit()}
          disabled={!formState.isValid}
          loading={formState.isSubmitting}
          style={styles.barBtn}
        />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {showTemplates ? (
          <View style={styles.block}>
            <Text variant="label" tone="mute">
              {t("habit.template")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {CATEGORIES.flatMap((c) => c.templates).map((tpl) => (
                <Chip
                  key={tpl.slug}
                  label={templateName(tpl, locale)}
                  emoji={tpl.emoji}
                  onPress={() =>
                    apply({
                      name: templateName(tpl, locale),
                      emoji: tpl.emoji,
                      goalUnit: tpl.goalUnit,
                      ...defaultsOf(tpl),
                      templateSlug: tpl.slug,
                    })
                  }
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Field
              label={t("habit.name")}
              placeholder={t("habit.namePlaceholder")}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              maxLength={40}
              error={fieldState.error ? t("habit.nameRequired") : undefined}
            />
          )}
        />

        <View style={styles.block}>
          <Text variant="label" tone="mute">
            {t("habit.emoji")}
          </Text>
          <Controller
            control={control}
            name="emoji"
            render={({ field, fieldState }) => (
              <EmojiField
                value={field.value}
                onChange={field.onChange}
                customLabel={t("habit.emojiCustom")}
                error={fieldState.error ? t("habit.emojiInvalid") : undefined}
              />
            )}
          />
        </View>

        <View style={styles.block}>
          <Text variant="label" tone="mute">
            {t("habit.frequency")}
          </Text>
          <Controller
            control={control}
            name="days"
            render={({ field, fieldState }) => (
              <>
                <DayPills
                  labels={dayLetters()}
                  accessibilityLabels={dayNames()}
                  value={field.value}
                  onChange={field.onChange}
                />
                {fieldState.error ? (
                  <Text variant="caption" tone="danger" accessibilityRole="alert">
                    {t("habit.daysRequired")}
                  </Text>
                ) : null}
              </>
            )}
          />
        </View>

        <View style={styles.block}>
          <Text variant="label" tone="mute">
            {t("habit.goal")}
          </Text>
          <View style={styles.chips}>
            {GOAL_UNITS.map((u) => (
              <Chip
                key={u}
                label={t(`habit.units.${u}`)}
                selected={u === unit}
                onPress={() => apply({ goalUnit: u, goalValue: u === "BOOLEAN" ? 1 : stepGoal(0, u, 1) })}
              />
            ))}
          </View>
          {step !== null ? (
            <Card radius={16} padding={14} style={styles.goal}>
              <Text variant="bodyStrong">{t("habit.goal")}</Text>
              <Stepper
                value={formatGoal(goal, unit, locale)}
                decrementLabel={t("habit.decrease")}
                incrementLabel={t("habit.increase")}
                onDecrement={() => apply({ goalValue: stepGoal(goal, unit, -1) })}
                onIncrement={() => apply({ goalValue: stepGoal(goal, unit, 1) })}
              />
            </Card>
          ) : null}
        </View>

        <View style={styles.block}>
          <Text variant="label" tone="mute">
            {t("habit.reminder")}
          </Text>
          <Controller
            control={control}
            name="reminders"
            render={({ field }) => (
              <TimeChips
                value={field.value ?? []}
                onChange={field.onChange}
                addLabel={t("habit.reminderAdd")}
                removeLabel={(time) => t("habit.reminderRemove", { time })}
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="quickActions"
          render={({ field }) => (
            <Card radius={16} padding={14} style={styles.switchRow}>
              <Text variant="bodyMedium" style={styles.flex}>
                {t("habit.quickActions")}
              </Text>
              <Switch
                accessibilityLabel={t("habit.quickActions")}
                value={field.value}
                onValueChange={field.onChange}
                trackColor={{ true: theme.acc, false: theme.line }}
              />
            </Card>
          )}
        />

        {formState.errors.root?.message ? (
          <Text variant="caption" tone="danger" accessibilityRole="alert">
            {formState.errors.root.message}
          </Text>
        ) : null}
        {extra}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 22, paddingVertical: 8 },
  barBtn: { height: 44, paddingHorizontal: 16, minWidth: 88 },
  body: { padding: 22, gap: 18, paddingBottom: 48 },
  block: { gap: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goal: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
});

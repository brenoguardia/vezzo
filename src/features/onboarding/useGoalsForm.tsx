import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import type { z } from "zod";
import { completeOnboarding } from "@/api/onboarding";
import { Button, Card, DayPills, EmojiTile, Stepper, Text } from "@/components/ui";
import { dayLetters, dayNames } from "@/features/onboarding/locale";
import { useLocale } from "@/i18n/useLocale";
import { useT } from "@/i18n/useT";
import { buildOnboardingHabits, formatGoal, stepGoal, stepSize } from "@/shared/onboarding";
import { onboardingGoalsInput } from "@/shared/schemas";
import { useOnboardingStore } from "@/store/onboarding";

type GoalsValues = z.input<typeof onboardingGoalsInput>;
type GoalsOutput = z.output<typeof onboardingGoalsInput>;

/**
 * Formulário de metas e dias (etapa 3). Devolve o corpo e o rodapé separados para a tela
 * única (`goals`) e para o painel direito do modo dual montá-los onde precisam.
 */
export function useGoalsForm(): { body: ReactNode; footer: ReactNode } {
  const t = useT();
  const router = useRouter();
  const locale = useLocale();
  const setGoal = useOnboardingStore((s) => s.setGoal);
  const setDays = useOnboardingStore((s) => s.setDays);
  const form = useForm<GoalsValues, unknown, GoalsOutput>({
    resolver: zodResolver(onboardingGoalsInput),
    mode: "onChange",
    defaultValues: { habits: buildOnboardingHabits(useOnboardingStore.getState().selected, locale) },
  });
  const { control, handleSubmit, setError, formState } = form;
  const { fields } = useFieldArray({ control, name: "habits" });

  const onSubmit = handleSubmit(async ({ habits }) => {
    try {
      await completeOnboarding({ displayName: useOnboardingStore.getState().displayName, habits });
      router.push("/reminders");
    } catch {
      setError("root", { message: t("onboarding.saveError") });
    }
  });

  const body = (
    <>
      {fields.map((habit, index) => {
        const slug = habit.templateSlug ?? "";
        const step = stepSize(habit.goalUnit);
        return (
          <Card key={habit.id} style={styles.card}>
            <View style={styles.header}>
              <EmojiTile emoji={habit.emoji} size={36} />
              <Text variant="bodyStrong" style={styles.name} numberOfLines={1}>
                {habit.name}
              </Text>
              {step === null ? (
                <Text variant="caption" tone="mute">
                  {t("onboarding.daily")}
                </Text>
              ) : (
                <Controller
                  control={control}
                  name={`habits.${index}.goalValue`}
                  render={({ field }) => (
                    <Stepper
                      value={formatGoal(field.value, habit.goalUnit, locale)}
                      decrementLabel={t("onboarding.decrease", { habit: habit.name })}
                      incrementLabel={t("onboarding.increase", { habit: habit.name })}
                      decrementDisabled={field.value <= step}
                      onDecrement={() => {
                        const next = stepGoal(field.value, habit.goalUnit, -1);
                        field.onChange(next);
                        setGoal(slug, next);
                      }}
                      onIncrement={() => {
                        const next = stepGoal(field.value, habit.goalUnit, 1);
                        field.onChange(next);
                        setGoal(slug, next);
                      }}
                    />
                  )}
                />
              )}
            </View>
            <Controller
              control={control}
              name={`habits.${index}.days`}
              render={({ field }) => (
                <DayPills
                  labels={dayLetters(t)}
                  accessibilityLabels={dayNames(t)}
                  value={field.value}
                  onChange={(days) => {
                    field.onChange(days);
                    setDays(slug, days);
                  }}
                />
              )}
            />
          </Card>
        );
      })}
    </>
  );
  const footer = (
    <>
      <>
        {formState.errors.root?.message ? (
          <Text variant="caption" tone="danger" accessibilityRole="alert">
            {formState.errors.root.message}
          </Text>
        ) : null}
        <Button
          label={t("onboarding.start")}
          onPress={() => void onSubmit()}
          disabled={!formState.isValid}
          loading={formState.isSubmitting}
        />
      </>
    </>
  );
  return { body, footer };
}

const styles = StyleSheet.create({
  card: { paddingVertical: 16, paddingHorizontal: 18, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { flex: 1 },
});

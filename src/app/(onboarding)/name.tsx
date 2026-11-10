import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, TextInput, View } from "react-native";
import { Button, MAX_FONT_SCALE, Text } from "@/components/ui";
import { OnboardingShell } from "@/features/onboarding/OnboardingShell";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";
import { type OnboardingNameInput, onboardingNameInput } from "@/shared/schemas";
import { fontFamily } from "@/shared/tokens";
import { useOnboardingStore } from "@/store/onboarding";

/** Onboarding 1/3 · nome (mín. 1, máx. 30 caracteres). */
export default function OnboardingName() {
  const t = useT();
  const theme = useTheme();
  const router = useRouter();
  const setName = useOnboardingStore((s) => s.setName);
  const form = useForm<OnboardingNameInput>({
    resolver: zodResolver(onboardingNameInput),
    mode: "onChange",
    defaultValues: { displayName: useOnboardingStore.getState().displayName },
  });
  const { control, handleSubmit, formState } = form;

  const onSubmit = handleSubmit(({ displayName }) => {
    setName(displayName);
    router.push("/activities");
  });

  return (
    <OnboardingShell
      step={1}
      title={t("onboarding.nameTitle")}
      titleVariant="onboardingTitle"
      subtitle={t("onboarding.nameSub")}
      footer={
        <Button
          label={t("onboarding.continue")}
          onPress={() => void onSubmit()}
          disabled={!formState.isValid}
          loading={formState.isSubmitting}
        />
      }
    >
      <Controller
        control={control}
        name="displayName"
        render={({ field, fieldState }) => (
          <View>
            <TextInput
            maxFontSizeMultiplier={MAX_FONT_SCALE}
              ref={field.ref}
              accessibilityLabel={t("onboarding.nameLabel")}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoFocus
              autoCapitalize="words"
              autoComplete="name"
              textContentType="givenName"
              returnKeyType="next"
              onSubmitEditing={() => void onSubmit()}
              selectionColor={theme.acc}
              style={[styles.input, { color: theme.ink, borderBottomColor: fieldState.error ? theme.danger : theme.acc }]}
            />
            {fieldState.error && field.value.length > 0 ? (
              <Text variant="caption" tone="danger" accessibilityRole="alert" style={styles.error}>
                {t(fieldState.error.type === "too_big" ? "onboarding.nameTooLong" : "onboarding.nameRequired")}
              </Text>
            ) : null}
          </View>
        )}
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  // Campo grande 700/34 com sublinhado de 2 na cor de destaque (docs/05, tela 4.1).
  input: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    lineHeight: 42,
    minHeight: 52,
    paddingVertical: 4,
    paddingHorizontal: 0,
    borderBottomWidth: 2,
  },
  error: { marginTop: 8 },
});

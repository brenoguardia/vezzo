import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable } from "react-native";
import { Button, Field, Text } from "@/components/ui";
import { requestPasswordReset } from "@/features/auth/actions";
import { AuthScreen } from "@/features/auth/AuthScreen";
import { t, translateMessage } from "@/i18n";
import { type ForgotPasswordInput, forgotPasswordInput } from "@/shared/schemas";
import { layout } from "@/shared/tokens";

export default function ForgotPassword() {
  const router = useRouter();
  const { control, handleSubmit, setError, formState } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordInput),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await requestPasswordReset(values);
    // Resposta igual exista ou não a conta (docs/04): só falhas de rede/limite viram erro.
    if (!result.ok && (result.key === "network" || result.key === "tooManyRequests")) {
      setError("root", { message: t(`auth.errors.${result.key}`) });
      return;
    }
    router.push({ pathname: "/check-email", params: { email: values.email, purpose: "reset" } });
  });

  return (
    <AuthScreen
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSub")}
      back
      footer={
        <>
          <Button label={t("auth.sendLink")} onPress={() => void onSubmit()} disabled={!formState.isValid} loading={formState.isSubmitting} />
          <Pressable
            accessibilityRole="link"
            onPress={() => router.replace("/sign-in")}
            style={{ minHeight: layout.minTouch, alignItems: "center", justifyContent: "center" }}
          >
            <Text variant="bodyMedium" tone="mute">
              {t("auth.backLogin")}
            </Text>
          </Pressable>
        </>
      }
    >
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <Field
            ref={field.ref}
            label={t("auth.email")}
            placeholder={t("auth.emailPlaceholder")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={translateMessage(fieldState.error?.message)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={() => void onSubmit()}
          />
        )}
      />
      {formState.errors.root?.message ? (
        <Text variant="caption" tone="danger" accessibilityRole="alert">
          {formState.errors.root.message}
        </Text>
      ) : null}
    </AuthScreen>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Field, PasswordField, Text } from "@/components/ui";
import { translateMessage } from "@/i18n";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";
import { type SignInInput, type SignUpInput, signInInput, signUpInput } from "@/shared/schemas";
import { layout } from "@/shared/tokens";
import { useToastStore } from "@/store/toast";
import { resendVerification, signInWithEmail, signUpWithEmail } from "./actions";
import { SocialButtons } from "./SocialButtons";

type Values = SignUpInput | SignInInput;

/** Formulário de e-mail e senha das telas de criar conta e entrar (React Hook Form + Zod). */
export function CredentialsForm({ mode }: { mode: "sign-up" | "sign-in" }) {
  const t = useT();
  const theme = useTheme();
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);
  const signUp = mode === "sign-up";
  const [socialError, setSocialError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(signUp ? signUpInput : signInInput),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });
  const { control, handleSubmit, setError, formState } = form;

  const onSubmit = handleSubmit(async (values) => {
    setSocialError(null);
    setUnverifiedEmail(null);
    const result = signUp ? await signUpWithEmail(values) : await signInWithEmail(values);
    if (result.ok) {
      // Cadastro exige verificação de e-mail (docs/04); o login é concluído pela guarda de rotas.
      if (signUp) router.replace({ pathname: "/check-email", params: { email: values.email, purpose: "verify" } });
      return;
    }
    const message = t(`auth.errors.${result.key}`);
    if (result.key === "emailTaken") setError("email", { message });
    else if (result.key === "invalidCredentials") setError("password", { message });
    else {
      setError("root", { message });
      if (result.key === "emailNotVerified") setUnverifiedEmail(values.email);
    }
  });

  async function onResend() {
    if (!unverifiedEmail) return;
    const result = await resendVerification(unverifiedEmail);
    showToast(result.ok ? t("auth.verifyResent") : t(`auth.errors.${result.key}`));
  }

  const rootError = formState.errors.root?.message ?? socialError;

  return (
    <View style={styles.form}>
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
            error={translateMessage(fieldState.error?.message, t)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordField
            ref={field.ref}
            label={t("auth.password")}
            showLabel={t("common.show")}
            hideLabel={t("common.hide")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={translateMessage(fieldState.error?.message, t)}
            autoComplete={signUp ? "new-password" : "current-password"}
            textContentType={signUp ? "newPassword" : "password"}
            returnKeyType="go"
            onSubmitEditing={() => void onSubmit()}
          />
        )}
      />
      <Link href="/forgot-password" asChild>
        <Pressable accessibilityRole="link" style={styles.forgot}>
          <Text variant="captionStrong" tone="acc" style={styles.forgotText}>
            {t("auth.forgot")}
          </Text>
        </Pressable>
      </Link>

      {rootError ? (
        <Text variant="caption" tone="danger" accessibilityRole="alert">
          {rootError}
        </Text>
      ) : null}
      {unverifiedEmail ? (
        <Pressable accessibilityRole="button" onPress={onResend} style={styles.resend}>
          <Text variant="bodyMedium" tone="acc">
            {t("auth.verifyResend")}
          </Text>
        </Pressable>
      ) : null}

      <Button
        label={t(signUp ? "auth.continue" : "auth.signIn")}
        onPress={() => void onSubmit()}
        disabled={!formState.isValid}
        loading={formState.isSubmitting}
      />
      <SocialButtons onError={setSocialError} />
      <Link href={signUp ? "/sign-in" : "/sign-up"} replace asChild>
        <Pressable accessibilityRole="link" style={styles.switch}>
          <Text variant="bodyMedium" tone="mute" style={{ color: theme.mute }}>
            {t(signUp ? "auth.hasAccount" : "auth.noAccount")}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 14 },
  forgot: { alignSelf: "flex-end", minHeight: layout.minTouch, justifyContent: "center", marginTop: -8 },
  forgotText: { fontSize: 13 },
  resend: { minHeight: layout.minTouch, justifyContent: "center" },
  switch: { minHeight: layout.minTouch, alignItems: "center", justifyContent: "center" },
});

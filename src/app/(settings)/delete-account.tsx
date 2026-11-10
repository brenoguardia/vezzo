import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { deleteAccount } from "@/api/account";
import { ApiError } from "@/api/client";
import { authClient } from "@/auth/client";
import { Button, PasswordField, Text } from "@/components/ui";
import { signInWithEmail } from "@/features/auth/actions";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { signOutAndClear } from "@/features/profile/sign-out";
import { useHasPassword } from "@/features/profile/useHasPassword";
import { translateMessage } from "@/i18n";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";
import { type DeleteAccountInput, deleteAccountInput } from "@/shared/schemas";

/**
 * Excluir conta (`DELETE /v1/account`). Contas com senha reautenticam com ela antes;
 * contas Apple/Google dependem de um login recente e, se a sessão for antiga, são orientadas a entrar de novo.
 */
export default function DeleteAccountScreen() {
  const t = useT();
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const hasPassword = useHasPassword();
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [removing, setRemoving] = useState(false);
  const { control, handleSubmit, setError, formState } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountInput),
    mode: "onChange",
    defaultValues: { password: "" },
  });

  async function remove() {
    setRemoving(true);
    try {
      await deleteAccount();
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) setNeedsSignIn(true);
      else setError("root", { message: t("profile.deleteError") });
      setRemoving(false);
      return;
    }
    await signOutAndClear();
  }

  const onSubmit = handleSubmit(async ({ password }) => {
    const email = session?.user.email;
    if (!email) return;
    setRemoving(true);
    const reauth = await signInWithEmail({ email, password });
    if (!reauth.ok) {
      setRemoving(false);
      setError(reauth.key === "invalidCredentials" ? "password" : "root", {
        message: t(`auth.errors.${reauth.key}`),
      });
      return;
    }
    await remove();
  });

  const submitting = removing;
  const ready = hasPassword !== null;

  return (
    <SettingsShell
      tabBar={false}
      title={t("profile.deleteTitle")}
      back
      footer={
        needsSignIn ? (
          <Button label={t("profile.signOut")} variant="secondary" onPress={() => void signOutAndClear()} />
        ) : (
          <>
            <Button
              label={t("profile.deleteConfirm")}
              disabled={!ready || (hasPassword === true && !formState.isValid)}
              loading={submitting}
              onPress={() => void (hasPassword ? onSubmit() : remove())}
              style={{ backgroundColor: theme.danger }}
            />
            <Button
              label={t("profile.deleteCancel")}
              variant="secondary"
              disabled={submitting}
              onPress={() => router.back()}
            />
          </>
        )
      }
    >
      <Text tone="mute">{t("profile.deleteBody")}</Text>
      {hasPassword && !needsSignIn ? (
        <View style={styles.form}>
          <Text variant="bodyMedium">{t("profile.deletePassword")}</Text>
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <PasswordField
                ref={field.ref}
                label={t("auth.password")}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={translateMessage(fieldState.error?.message, t)}
                showLabel={t("common.show")}
                hideLabel={t("common.hide")}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={() => void onSubmit()}
              />
            )}
          />
        </View>
      ) : null}
      {needsSignIn ? (
        <Text variant="bodyMedium" tone="danger" accessibilityRole="alert">
          {t("profile.deleteReauth")}
        </Text>
      ) : null}
      {formState.errors.root?.message ? (
        <Text variant="caption" tone="danger" accessibilityRole="alert">
          {formState.errors.root.message}
        </Text>
      ) : null}
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: 10, marginTop: 6 },
});

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button, PasswordField, Text } from "@/components/ui";
import { authClient } from "@/auth/client";
import { readToken } from "@/auth/errors";
import { resetPassword } from "@/features/auth/actions";
import { AuthScreen } from "@/features/auth/AuthScreen";
import { PasswordChecklist } from "@/features/auth/PasswordChecklist";
import { translateMessage } from "@/i18n";
import { useT } from "@/i18n/useT";
import { type ResetPasswordInput, passwordChecks, resetPasswordInput } from "@/shared/schemas";
import { useToastStore } from "@/store/toast";

/** Abre por `vezzo://reset-password?token=...`. O servidor acrescenta `error=INVALID_TOKEN` se o link venceu. */
export default function ResetPassword() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[]; error?: string | string[] }>();
  const showToast = useToastStore((s) => s.show);
  const { data: session } = authClient.useSession();
  const token = readToken(params.token);
  const [tokenRejected, setTokenRejected] = useState(!!readToken(params.error));

  const { control, handleSubmit, setError, formState } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordInput),
    mode: "onChange",
    defaultValues: { password: "", confirm: "" },
  });
  const [password, confirm] = useWatch({ control, name: ["password", "confirm"] });
  const checks = passwordChecks(password ?? "", confirm ?? "");

  if (!token || tokenRejected) {
    return (
      <AuthScreen
        title={t("auth.invalidLinkTitle")}
        subtitle={t("auth.invalidLinkSub")}
        back
        footer={<Button label={t("auth.requestNew")} onPress={() => router.replace("/forgot-password")} />}
      >
        {null}
      </AuthScreen>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    const result = await resetPassword(values.password, token);
    if (result.ok) {
      showToast(t("auth.passwordChanged"));
      if (session) router.back();
      else router.replace("/sign-in");
      return;
    }
    if (result.key === "invalidToken") setTokenRejected(true);
    else setError("root", { message: t(`auth.errors.${result.key}`) });
  });

  return (
    <AuthScreen
      title={t("auth.newPass")}
      subtitle={t("auth.newPassSub")}
      back
      footer={<Button label={t("auth.savePass")} onPress={() => void onSubmit()} disabled={!formState.isValid} loading={formState.isSubmitting} />}
    >
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordField
            ref={field.ref}
            label={t("auth.newPassLbl")}
            showLabel={t("common.show")}
            hideLabel={t("common.hide")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            // O checklist já explica as regras ao vivo; mostramos erro só depois de sair do campo.
            error={fieldState.isTouched ? translateMessage(fieldState.error?.message, t) : undefined}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
          />
        )}
      />
      <Controller
        control={control}
        name="confirm"
        render={({ field, fieldState }) => (
          <PasswordField
            ref={field.ref}
            label={t("auth.confirmLbl")}
            showLabel={t("common.show")}
            hideLabel={t("common.hide")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.isTouched ? translateMessage(fieldState.error?.message, t) : undefined}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={() => void onSubmit()}
          />
        )}
      />
      <PasswordChecklist checks={checks} />
      {formState.errors.root?.message ? (
        <Text variant="caption" tone="danger" accessibilityRole="alert">
          {formState.errors.root.message}
        </Text>
      ) : null}
    </AuthScreen>
  );
}

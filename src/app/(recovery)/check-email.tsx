import { Redirect, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "@/components/ui";
import { requestPasswordReset, resendVerification } from "@/features/auth/actions";
import { AuthScreen } from "@/features/auth/AuthScreen";
import { useCountdown } from "@/features/auth/useCountdown";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";
import { layout } from "@/shared/tokens";
import { useToastStore } from "@/store/toast";

const RESEND_SECONDS = 60;

/** Serve a "Verifique seu e-mail" da redefinição de senha e da confirmação de cadastro. */
export default function CheckEmail() {
  const t = useT();
  const theme = useTheme();
  const params = useLocalSearchParams<{ email?: string; purpose?: string }>();
  const showToast = useToastStore((s) => s.show);
  const { seconds, restart } = useCountdown(RESEND_SECONDS);
  const [sending, setSending] = useState(false);

  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  if (!email) return <Redirect href="/forgot-password" />;
  const verify = params.purpose === "verify";

  async function resend() {
    if (!email) return;
    setSending(true);
    const result = verify ? await resendVerification(email) : await requestPasswordReset({ email });
    setSending(false);
    if (result.ok) {
      restart();
      showToast(t(verify ? "auth.verifyResent" : "auth.resent"));
    } else {
      showToast(t(`auth.errors.${result.key}`));
    }
  }

  const openMail = () => Linking.openURL(Platform.OS === "ios" ? "message:" : "mailto:").catch(() => {});

  return (
    <AuthScreen title={t(verify ? "auth.verifyTitle" : "auth.checkMail")} back>
      <View style={styles.center}>
        <View style={[styles.circle, { backgroundColor: theme.card }]}>
          <Text style={styles.emoji} accessibilityElementsHidden importantForAccessibility="no">
            ✉️
          </Text>
        </View>
        <Text tone="mute" style={styles.copy}>
          {t(verify ? "auth.verifySent" : "auth.sentTo")}
        </Text>
        <Text variant="bodyStrong" style={styles.copy}>
          {email}
        </Text>
        <Text tone="mute" style={styles.copy}>
          {t(verify ? "auth.verifyHint" : "auth.linkExp")}
        </Text>
      </View>
      <Button label={t("auth.openMail")} onPress={openMail} />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: seconds > 0 || sending }}
        disabled={seconds > 0 || sending}
        onPress={resend}
        style={[styles.resend, { opacity: seconds > 0 || sending ? 0.5 : 1 }]}
      >
        <Text variant="bodyMedium" tone={seconds > 0 ? "mute" : "acc"}>
          {seconds > 0 ? t("auth.resendIn", { seconds }) : t("auth.resend")}
        </Text>
      </Pressable>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", gap: 6, marginBottom: 18 },
  circle: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emoji: { fontSize: 40, lineHeight: 48 },
  copy: { textAlign: "center" },
  resend: { minHeight: layout.minTouch, alignItems: "center", justifyContent: "center" },
});

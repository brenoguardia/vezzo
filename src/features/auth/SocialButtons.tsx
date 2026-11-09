import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui";
import { t } from "@/i18n";
import { useTheme } from "@/lib/useTheme";
import { layout, radius } from "@/shared/tokens";
import { type AuthResult, signInWithApple, signInWithGoogle } from "./actions";
import { GoogleButton } from "./GoogleButton";

interface Props {
  /** Erro traduzido do último login social (a tela decide onde exibir). */
  onError: (message: string | null) => void;
}

/** "ou" + Apple (botão oficial, só iOS) + Google. O redirecionamento pós-login vem da guarda de rotas. */
export function SocialButtons({ onError }: Props) {
  const theme = useTheme();
  const [busy, setBusy] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable, () => setAppleAvailable(false));
  }, []);

  async function handle(action: () => Promise<AuthResult | "cancelled">) {
    onError(null);
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (result !== "cancelled" && !result.ok) onError(t(`auth.errors.${result.key}`));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.divider}>
        <View style={[styles.rule, { backgroundColor: theme.line }]} />
        <Text variant="caption" tone="mute">
          {t("common.or")}
        </Text>
        <View style={[styles.rule, { backgroundColor: theme.line }]} />
      </View>
      {appleAvailable ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={
            theme.scheme === "dark"
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={radius.button}
          style={styles.apple}
          onPress={() => (busy ? undefined : void handle(signInWithApple))}
        />
      ) : null}
      <GoogleButton label={t("auth.continueGoogle")} disabled={busy} onPress={() => void handle(signInWithGoogle)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  rule: { flex: 1, height: 1 },
  apple: { height: 52, minHeight: layout.minTouch, width: "100%" },
});

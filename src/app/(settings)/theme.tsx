import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Ring, SegmentedControl, Text } from "@/components/ui";
import { AccentSwatches } from "@/features/profile/AccentSwatches";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { useT } from "@/i18n/useT";
import { isAccent, modeFromApi, modeToApi } from "@/lib/theme-sync";
import { useTheme } from "@/lib/useTheme";
import { radius } from "@/shared/tokens";
import { useProfileStore } from "@/store/profile";
import { type ThemeMode, useThemeStore } from "@/store/theme";
import { useToastStore } from "@/store/toast";

/**
 * Tema: a cor e o modo mudam o app inteiro ao vivo (via store) e só são gravados em
 * `PUT /v1/profile` ao tocar em "Aplicar". Sair sem aplicar restaura o que estava salvo.
 */
export default function ThemeScreen() {
  const t = useT();
  const router = useRouter();
  const theme = useTheme();
  const showToast = useToastStore((s) => s.show);
  const update = useProfileStore((s) => s.update);
  const accent = useThemeStore((s) => s.accent);
  const mode = useThemeStore((s) => s.mode);
  const [saving, setSaving] = useState(false);

  // Valores salvos ao abrir a tela: o perfil do servidor, ou o que o aparelho já usava.
  const [committed] = useState(() => {
    const profile = useProfileStore.getState().profile;
    const current = useThemeStore.getState();
    return {
      accent: profile && isAccent(profile.accent) ? profile.accent : current.accent,
      mode: profile ? modeFromApi(profile.themeMode) : current.mode,
    };
  });
  const applied = useRef(false);

  useEffect(
    () => () => {
      if (applied.current) return;
      const store = useThemeStore.getState();
      store.setAccent(committed.accent);
      store.setMode(committed.mode);
    },
    [committed],
  );

  const dirty = accent !== committed.accent || mode !== committed.mode;

  async function apply() {
    setSaving(true);
    try {
      await update({ accent, themeMode: modeToApi(mode) });
      applied.current = true;
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch {
      showToast(t("theme.saveError"));
    } finally {
      setSaving(false);
    }
  }

  const modes: { value: ThemeMode; label: string }[] = [
    { value: "dark", label: t("theme.dark") },
    { value: "light", label: t("theme.light") },
    { value: "system", label: t("theme.system") },
  ];

  return (
    <SettingsShell
      tabBar={false}
      title={t("theme.title")}
      back
      footer={<Button label={t("theme.apply")} onPress={() => void apply()} disabled={!dirty} loading={saving} />}
    >
      <Card radius={radius.cardHero} padding={18} style={styles.preview}>
        <Ring progress={0.6} size={72} strokeWidth={8} accessibilityLabel="3/5">
          <Text variant="bodyStrong">3/5</Text>
        </Ring>
        <View style={styles.previewText}>
          <Text variant="bodyStrong">{t("theme.preview")}</Text>
          <View style={[styles.pill, { backgroundColor: theme.acc }]}>
            <Text variant="captionStrong" tone="accInk">
              {t("theme.previewDone")}
            </Text>
          </View>
        </View>
      </Card>

      <Text variant="label" tone="mute" style={styles.label}>
        {t("theme.accentLabel")}
      </Text>
      <AccentSwatches value={accent} onChange={(next) => useThemeStore.getState().setAccent(next)} />

      <Text variant="label" tone="mute" style={styles.label}>
        {t("theme.appearance")}
      </Text>
      <SegmentedControl
        options={modes}
        value={mode}
        onChange={(next) => useThemeStore.getState().setMode(next)}
        accessibilityLabel={t("theme.appearance")}
      />
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  preview: { flexDirection: "row", alignItems: "center", gap: 18 },
  previewText: { gap: 8, alignItems: "flex-start" },
  pill: { minHeight: 30, paddingHorizontal: 14, borderRadius: radius.chip, justifyContent: "center" },
  label: { marginTop: 8 },
});

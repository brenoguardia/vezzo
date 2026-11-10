import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { authClient } from "@/auth/client";
import { Button, Card, Text } from "@/components/ui";
import { requestPasswordReset } from "@/features/auth/actions";
import { accentName } from "@/features/profile/AccentSwatches";
import { SettingsRow } from "@/features/profile/SettingsRow";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { signOutAndClear } from "@/features/profile/sign-out";
import { useHasPassword } from "@/features/profile/useHasPassword";
import { useReminderPermission } from "@/features/profile/useReminderPermission";
import { useProfileSummary } from "@/features/profile/useProfileSummary";
import { setLocale } from "@/i18n";
import { useT } from "@/i18n/useT";
import { useLocale } from "@/i18n/useLocale";
import { formatMonthYear } from "@/lib/format";
import { useTheme } from "@/lib/useTheme";
import { radius } from "@/shared/tokens";
import { useProfileStore } from "@/store/profile";
import { useThemeStore } from "@/store/theme";
import { useToastStore } from "@/store/toast";

const LOCALES = ["pt-BR", "en"] as const;

export default function ProfileScreen() {
  const t = useT();
  const locale = useLocale();
  const theme = useTheme();
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);
  const profile = useProfileStore((s) => s.profile);
  const update = useProfileStore((s) => s.update);
  const accent = useThemeStore((s) => s.accent);
  const { data: session } = authClient.useSession();
  const hasPassword = useHasPassword();
  const summary = useProfileSummary(profile?.timezone);
  const reminderPermission = useReminderPermission();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  if (!profile) return null;
  const email = session?.user.email;

  async function changeLanguage(next: (typeof LOCALES)[number]) {
    setLanguageOpen(false);
    const previous = locale;
    if (next === previous) return;
    setLocale(next); // troca na hora; volta se o servidor recusar
    try {
      await update({ language: next });
    } catch {
      setLocale(previous);
      showToast(t("profile.languageError"));
    }
  }

  async function resetPassword() {
    if (!email) return;
    setSendingReset(true);
    const result = await requestPasswordReset({ email });
    setSendingReset(false);
    if (
      !result.ok &&
      (result.key === "network" || result.key === "tooManyRequests")
    ) {
      showToast(t(`auth.errors.${result.key}`));
      return;
    }
    router.push({
      pathname: "/check-email",
      params: { email, purpose: "reset" },
    });
  }

  const dash = "–";
  const metrics = [
    {
      label: t("profile.streak"),
      value: summary ? String(summary.streak) : dash,
    },
    {
      label: t("profile.habits"),
      value: summary ? String(summary.habits) : dash,
    },
    {
      label: t("profile.completion"),
      value: summary ? `${Math.round(summary.completion * 100)}%` : dash,
    },
  ];

  return (
    <SettingsShell>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.acc }]}>
          <Text
            variant="display"
            tone="accInk"
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            {profile.displayName.trim().charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text
          variant="sectionTitle"
          accessibilityRole="header"
          style={styles.name}
        >
          {profile.displayName}
        </Text>
        <Text variant="caption" tone="mute">
          {t("profile.since", {
            date: formatMonthYear(profile.createdAt, locale),
          })}
        </Text>
      </View>

      <View style={styles.metrics}>
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            radius={radius.card}
            padding={14}
            style={styles.metric}
          >
            <Text
              variant="sectionTitle"
              accessibilityLabel={`${metric.label}: ${metric.value}`}
            >
              {metric.value}
            </Text>
            <Text variant="caption" tone="mute">
              {metric.label}
            </Text>
          </Card>
        ))}
      </View>

      <Text variant="label" tone="mute" style={styles.section}>
        {t("profile.preferences")}
      </Text>
      <Card radius={radius.cardLarge} padding={0}>
        <SettingsRow
          label={t("profile.theme")}
          value={accentName(accent, t)}
          chevron
          onPress={() => router.push("/theme")}
        />
        <SettingsRow
          label={t("profile.language")}
          value={t(`profile.languages.${locale}`)}
          last={!languageOpen}
          onPress={() => setLanguageOpen((open) => !open)}
          accessibilityState={{ expanded: languageOpen }}
        />
        {languageOpen
          ? LOCALES.map((option, index) => (
              <SettingsRow
                key={option}
                label={t(`profile.languages.${option}`)}
                value={option === locale ? "✓" : undefined}
                last={index === LOCALES.length - 1}
                onPress={() => void changeLanguage(option)}
              />
            ))
          : null}
        <SettingsRow
          label={t("profile.reminders")}
          value={
            reminderPermission === "granted"
              ? t("profile.remindersOn")
              : undefined
          }
          last={!__DEV__ && reminderPermission !== "denied"}
        />
        {__DEV__ ? (
          <SettingsRow
            label={t("profile.debugReminder")}
            chevron
            last
            onPress={() => router.push("/notifications-debug")}
          />
        ) : null}
      </Card>

      {reminderPermission === "denied" ? (
        <Card radius={radius.card} padding={16} style={styles.denied}>
          <Text variant="bodyStrong">{t("profile.remindersDenied")}</Text>
          <Text tone="mute">{t("profile.remindersDeniedSub")}</Text>
          <Button
            label={t("profile.openSettings")}
            variant="secondary"
            onPress={() => void Linking.openSettings()}
          />
        </Card>
      ) : null}

      <Text variant="label" tone="mute" style={styles.section}>
        {t("profile.account")}
      </Text>
      <Card radius={radius.cardLarge} padding={0}>
        <SettingsRow label={t("profile.email")} value={email} />
        {hasPassword ? (
          <SettingsRow
            label={t("profile.resetPassword")}
            chevron
            disabled={sendingReset}
            accessibilityState={{ busy: sendingReset }}
            onPress={() => void resetPassword()}
          />
        ) : null}
        <SettingsRow
          label={t("profile.signOut")}
          tone="danger"
          last
          onPress={() => void signOutAndClear()}
        />
      </Card>

      <Card radius={radius.cardLarge} padding={0} style={styles.danger}>
        <SettingsRow
          label={t("profile.deleteAccount")}
          tone="danger"
          last
          onPress={() => router.push("/delete-account")}
        />
      </Card>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", gap: 4 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  name: { fontSize: 24, lineHeight: 30 },
  metrics: { flexDirection: "row", gap: 10 },
  metric: { flex: 1, alignItems: "center", gap: 2 },
  section: { marginTop: 8, marginLeft: 4 },
  danger: { marginTop: 18 },
  denied: { gap: 10 },
});

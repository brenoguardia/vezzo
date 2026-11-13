import { Link } from "expo-router";
import type { ReactNode } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui";
import type { LandingCopy, LandingRow } from "@/i18n/landing";
import { useTheme } from "@/lib/useTheme";
import { STORE_LINKS } from "@/shared/landing";
import { LEGAL_CONFIG } from "@/shared/legal/config";
import { fontFamily, layout } from "@/shared/tokens";
import { CreateDemo } from "./CreateDemo";
import { ReminderDemo } from "./ReminderDemo";
import { StoreBadge } from "./StoreBadge";
import { StreakDemo } from "./StreakDemo";
import { ThemeDemo } from "./ThemeDemo";
import { TodayDemo } from "./TodayDemo";

export const MAX_WIDTH = 1120;

/** Coluna centralizada com a largura máxima da página e a margem lateral do projeto. */
export function Container({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.container, style]}>{children}</View>;
}

function H2({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <Text variant="screenTitle" accessibilityRole="header" aria-level={2} style={wide ? styles.h2Wide : undefined}>
      {children}
    </Text>
  );
}

export function Stores({ copy, center }: { copy: LandingCopy["stores"]; center?: boolean }) {
  return (
    <View style={[styles.stores, center && styles.center]}>
      <StoreBadge
        testID="badge-app-store"
        icon="apple"
        caption={copy.appStoreLabel}
        store={copy.appStore}
        url={STORE_LINKS.appStore}
        soonLabel={copy.soon}
      />
      <StoreBadge
        testID="badge-play-store"
        icon="play"
        caption={copy.playStoreLabel}
        store={copy.playStore}
        url={STORE_LINKS.playStore}
        soonLabel={copy.soon}
      />
    </View>
  );
}

export function Hero({ copy, wide }: { copy: LandingCopy; wide: boolean }) {
  return (
    <Container style={[styles.hero, wide && styles.heroWide]}>
      <View style={[styles.heroText, wide && styles.heroTextWide]}>
        <Text variant="display" accessibilityRole="header" aria-level={1} style={wide ? styles.h1Wide : styles.h1}>
          {copy.hero.title}
        </Text>
        <Text tone="mute" style={styles.lead}>
          {copy.hero.subtitle}
        </Text>
        <Stores copy={copy.stores} />
      </View>
      <View style={[styles.heroDemo, wide && styles.heroDemoWide]}>
        <TodayDemo copy={copy.demo} />
      </View>
    </Container>
  );
}

export function Steps({ copy, wide }: { copy: LandingCopy["steps"]; wide: boolean }) {
  const theme = useTheme();
  return (
    <Container style={styles.section}>
      <H2 wide={wide}>{copy.title}</H2>
      <View style={[styles.steps, wide && styles.stepsWide]}>
        {copy.items.map((step, i) => (
          <View key={step.title} style={[styles.step, wide && styles.stepWide]}>
            <View style={[styles.stepNumber, { backgroundColor: theme.acc }]}>
              <Text tone="accInk" style={styles.stepNumberText}>
                {i + 1}
              </Text>
            </View>
            <View style={styles.stepText}>
              <Text variant="sectionTitle" accessibilityRole="header" aria-level={3}>
                {step.title}
              </Text>
              <Text tone="mute">{step.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </Container>
  );
}

function RowVisual({ row, copy }: { row: LandingRow; copy: LandingCopy }) {
  switch (row.id) {
    case "reminders":
      return <ReminderDemo copy={copy.reminder} />;
    case "create":
      return <CreateDemo copy={copy.create} days={copy.days} />;
    case "streak":
      return <StreakDemo copy={copy.streakDemo} days={copy.days} />;
    case "theme":
      return <ThemeDemo copy={copy.themeDemo} />;
  }
}

/** Uma função por linha, alternando o lado da demo. Cada demo é interativa, como a do hero. */
export function FeatureRows({ copy, wide }: { copy: LandingCopy; wide: boolean }) {
  const theme = useTheme();
  return (
    <Container style={styles.rows}>
      {copy.rows.map((row, i) => (
        <View
          key={row.id}
          style={[
            styles.row,
            { borderTopColor: theme.line },
            wide && styles.rowWide,
            wide && i % 2 === 1 && styles.rowReverse,
          ]}
        >
          <View style={[styles.rowText, wide && styles.rowTextWide]}>
            <H2 wide={wide}>{row.title}</H2>
            <Text tone="mute" style={styles.lead}>
              {row.body}
            </Text>
          </View>
          <View style={[styles.rowVisual, wide && styles.rowVisualWide, wide && i % 2 === 1 && styles.rowVisualStart]}>
            <RowVisual row={row} copy={copy} />
          </View>
        </View>
      ))}
    </Container>
  );
}

export function Also({ copy, wide }: { copy: LandingCopy["also"]; wide: boolean }) {
  const theme = useTheme();
  return (
    <Container style={styles.section}>
      <H2 wide={wide}>{copy.title}</H2>
      <View style={[styles.also, wide && styles.alsoWide]}>
        {copy.items.map((item) => (
          <View key={item.title} style={[styles.alsoItem, { borderTopColor: theme.line }]}>
            <Text variant="sectionTitle" accessibilityRole="header" aria-level={3}>
              {item.title}
            </Text>
            <Text tone="mute">{item.body}</Text>
          </View>
        ))}
      </View>
    </Container>
  );
}

export function PrivacyBand({ copy, wide }: { copy: LandingCopy["privacy"]; wide: boolean }) {
  const theme = useTheme();
  return (
    <Container style={styles.section}>
      <View style={[styles.privacy, { borderTopColor: theme.line }, wide && styles.privacyWide]}>
        <View style={wide ? styles.privacyTitle : undefined}>
          <H2 wide={wide}>{copy.title}</H2>
        </View>
        <View style={[styles.privacyBody, wide && styles.privacyBodyWide]}>
          <Text tone="mute" style={styles.lead}>
            {copy.body}
          </Text>
          <View style={styles.points}>
            {copy.points.map((point) => (
              <View key={point} style={styles.point}>
                <Text tone="acc" accessibilityElementsHidden importantForAccessibility="no">
                  ✓
                </Text>
                <Text variant="bodyMedium">{point}</Text>
              </View>
            ))}
          </View>
          <Link href="/privacy" asChild>
            <Pressable accessibilityRole="link" style={styles.linkBox}>
              <Text tone="acc" style={styles.link}>
                {copy.link}
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Container>
  );
}

export function FinalCta({ copy, stores }: { copy: LandingCopy["cta"]; stores: LandingCopy["stores"] }) {
  return (
    <Container style={[styles.section, styles.cta]}>
      <Text variant="onboardingTitle" accessibilityRole="header" aria-level={2} style={styles.ctaTitle}>
        {copy.title}
      </Text>
      <Text tone="mute" style={styles.ctaSub}>
        {copy.subtitle}
      </Text>
      <Stores copy={stores} center />
    </Container>
  );
}

export function Footer({ copy }: { copy: LandingCopy["footer"] }) {
  const theme = useTheme();
  const year = new Date().getFullYear();
  const email = LEGAL_CONFIG.contactEmail;
  return (
    <View style={[styles.footer, { borderTopColor: theme.line }]}>
      <Container style={styles.footerInner}>
        <View style={styles.footerLinks}>
          <Link href="/privacy" asChild>
            <Pressable accessibilityRole="link" style={styles.linkBox}>
              <Text variant="bodyMedium" tone="mute">
                {copy.privacy}
              </Text>
            </Pressable>
          </Link>
          <Link href="/terms" asChild>
            <Pressable accessibilityRole="link" style={styles.linkBox}>
              <Text variant="bodyMedium" tone="mute">
                {copy.terms}
              </Text>
            </Pressable>
          </Link>
          <Link href="/account-deletion" asChild>
            <Pressable accessibilityRole="link" style={styles.linkBox}>
              <Text variant="bodyMedium" tone="mute">
                {copy.deletion}
              </Text>
            </Pressable>
          </Link>
          {email ? (
            <Pressable
              accessibilityRole="link"
              style={styles.linkBox}
              onPress={() => void Linking.openURL(`mailto:${email}`)}
            >
              <Text variant="bodyMedium" tone="mute">
                {copy.contact}
              </Text>
            </Pressable>
          ) : null}
        </View>
        <Text variant="caption" tone="mute">
          © {year} Vezzo · {LEGAL_CONFIG.controllerName ?? "Vezzo"}. {copy.rights}
        </Text>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center", paddingHorizontal: layout.screenMargin },
  center: { justifyContent: "center" },
  stores: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  hero: { paddingTop: 24, paddingBottom: 56, gap: 40 },
  heroWide: { flexDirection: "row", alignItems: "center", gap: 72, paddingTop: 56, paddingBottom: 96 },
  heroText: { gap: 20 },
  heroTextWide: { flex: 1 },
  h1: { fontSize: 44, lineHeight: 48, letterSpacing: -1.5 },
  h1Wide: { fontSize: 68, lineHeight: 70, letterSpacing: -2.6, maxWidth: 560 },
  h2Wide: { fontSize: 36, lineHeight: 40, letterSpacing: -1 },
  lead: { fontSize: 17, lineHeight: 27, maxWidth: 480 },
  heroDemo: { alignItems: "center" },
  heroDemoWide: { flex: 1, alignItems: "flex-end" },
  section: { paddingVertical: 48, gap: 24 },
  steps: { gap: 24 },
  stepsWide: { flexDirection: "row", gap: 40 },
  step: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  stepWide: { flex: 1 },
  stepNumber: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  stepNumberText: { fontFamily: fontFamily.extrabold, fontSize: 20, lineHeight: 26 },
  stepText: { flex: 1, gap: 4 },
  rows: { paddingVertical: 24 },
  row: { borderTopWidth: 1, paddingVertical: 48, gap: 32 },
  rowWide: { flexDirection: "row", alignItems: "center", gap: 72, paddingVertical: 56 },
  rowReverse: { flexDirection: "row-reverse" },
  rowText: { gap: 16 },
  rowTextWide: { flex: 1 },
  rowVisual: { alignItems: "center" },
  rowVisualWide: { flex: 1, alignItems: "flex-end" },
  rowVisualStart: { alignItems: "flex-start" },
  also: { gap: 24 },
  alsoWide: { flexDirection: "row", gap: 40 },
  alsoItem: { flex: 1, borderTopWidth: 1, paddingTop: 20, gap: 6 },
  privacy: { borderTopWidth: 1, paddingTop: 48, gap: 20 },
  privacyWide: { flexDirection: "row", gap: 72 },
  privacyTitle: { flex: 1 },
  privacyBody: { gap: 16 },
  privacyBodyWide: { flex: 1 },
  points: { gap: 8 },
  point: { flexDirection: "row", gap: 10, alignItems: "center" },
  linkBox: { minHeight: layout.minTouch, justifyContent: "center", alignSelf: "flex-start" },
  link: { fontFamily: fontFamily.bold, textDecorationLine: "underline" },
  cta: { alignItems: "center", paddingVertical: 80 },
  ctaTitle: { textAlign: "center" },
  ctaSub: { textAlign: "center", fontSize: 16, lineHeight: 24 },
  footer: { borderTopWidth: 1, paddingVertical: 24, marginTop: 24 },
  footerInner: { gap: 12 },
  footerLinks: { flexDirection: "row", flexWrap: "wrap", columnGap: 24 },
});

import { StyleSheet, View } from "react-native";
import { Ring, SegmentedControl, Text } from "@/components/ui";
import type { LandingCopy } from "@/i18n/landing";
import { useTheme } from "@/lib/useTheme";
import { fontFamily, radius } from "@/shared/tokens";
import { type ThemeMode, useThemeStore } from "@/store/theme";
import { AccentPicker } from "./AccentPicker";
import { DemoShell, fill } from "./DemoShell";

/** Tema ao vivo: modo e cor de destaque mudam o app de verdade, e a página inteira acompanha. */
export function ThemeDemo({ copy }: { copy: LandingCopy["themeDemo"] }) {
  const theme = useTheme();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const options: { value: ThemeMode; label: string }[] = [
    { value: "dark", label: copy.modes.dark },
    { value: "light", label: copy.modes.light },
    { value: "system", label: copy.modes.system },
  ];

  return (
    <DemoShell hint={copy.hint}>
      <View style={[styles.preview, { backgroundColor: theme.bg }]}>
        <Ring progress={0.6} size={64} strokeWidth={7}>
          <Text tone="acc" style={styles.ringMark}>
            ✓
          </Text>
        </Ring>
        <View style={[styles.sample, { backgroundColor: theme.acc }]} accessibilityElementsHidden>
          <Text tone="accInk" variant="bodyStrong">
            {copy.sample}
          </Text>
        </View>
      </View>

      <View style={styles.group}>
        <Text variant="label" tone="mute">
          {copy.modeLabel}
        </Text>
        <SegmentedControl options={options} value={mode} onChange={setMode} accessibilityLabel={copy.modeLabel} />
      </View>

      <View style={styles.group}>
        <Text variant="label" tone="mute">
          {copy.accentTitle}
        </Text>
        <AccentPicker label={(n) => fill(copy.accentLabel, { n })} />
      </View>
    </DemoShell>
  );
}

const styles = StyleSheet.create({
  preview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.card,
    padding: 14,
  },
  ringMark: { fontFamily: fontFamily.extrabold, fontSize: 22, lineHeight: 26 },
  sample: { minHeight: 44, borderRadius: radius.button, paddingHorizontal: 22, justifyContent: "center" },
  group: { gap: 8 },
});

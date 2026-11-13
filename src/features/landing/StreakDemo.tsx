import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui";
import type { LandingCopy } from "@/i18n/landing";
import { useTheme } from "@/lib/useTheme";
import { fontFamily, layout, radius } from "@/shared/tokens";
import { DemoShell, fill } from "./DemoShell";

/** Quinta-feira: dias seguintes ainda não aconteceram e não podem ser marcados. */
const TODAY = 3;
/** Dias seguidos antes de segunda-feira desta semana. */
const BEFORE_WEEK = 8;
const MILESTONES = [15, 30, 100] as const;

/** Dias seguidos até hoje: a sequência para no primeiro dia em branco; semana completa soma os dias anteriores. */
export function streakOf(done: readonly number[]): number {
  let run = 0;
  for (let day = TODAY; day >= 0 && done.includes(day); day--) run++;
  return run === TODAY + 1 ? run + BEFORE_WEEK : run;
}

/** Sequência ao vivo: marque e desmarque os dias da semana e veja o número e as conquistas responderem. */
export function StreakDemo({ copy, days }: { copy: LandingCopy["streakDemo"]; days: LandingCopy["days"] }) {
  const theme = useTheme();
  const [done, setDone] = useState<number[]>([0, 1, 2, 3]);
  const streak = streakOf(done);

  const toggle = (day: number) =>
    setDone((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]));

  return (
    <DemoShell hint={copy.hint}>
      <View style={styles.hero} accessibilityLiveRegion="polite">
        <Text testID="streak-number" style={styles.number}>
          {streak}
        </Text>
        <Text variant="bodyMedium" tone="mute">
          {copy.unit}
        </Text>
        <Text variant="bodyStrong" tone={streak === 0 ? "mute" : "acc"}>
          {streak === 0 ? copy.startToday : copy.keepGoing}
        </Text>
      </View>

      <View style={styles.group}>
        <Text variant="label" tone="mute">
          {copy.weekLabel}
        </Text>
        <View style={styles.week}>
          {days.short.map((label, day) => {
            const future = day > TODAY;
            const checked = done.includes(day);
            return (
              <Pressable
                key={days.full[day]}
                accessibilityRole="checkbox"
                accessibilityLabel={days.full[day]}
                accessibilityState={{ checked, disabled: future }}
                disabled={future}
                onPress={() => toggle(day)}
                style={styles.dayTarget}
              >
                <View
                  style={[
                    styles.dot,
                    checked ? { backgroundColor: theme.acc, borderColor: theme.acc } : { borderColor: theme.line },
                    future && { opacity: 0.4 },
                  ]}
                >
                  {checked ? (
                    <Text tone="accInk" style={styles.dotMark}>
                      ✓
                    </Text>
                  ) : null}
                </View>
                <Text variant="caption" tone={day === TODAY ? "ink" : "mute"}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <Text variant="label" tone="mute">
          {copy.milestonesTitle}
        </Text>
        {MILESTONES.map((target) => (
          <View key={target} style={styles.milestone}>
            <View style={styles.milestoneHead}>
              <Text variant="bodyMedium">{fill(copy.milestone, { target })}</Text>
              <Text variant="caption" tone="mute">
                {fill(copy.progress, { n: Math.min(streak, target), target })}
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: theme.line }]}>
              <View
                style={[styles.fill, { backgroundColor: theme.acc, width: `${Math.min(1, streak / target) * 100}%` }]}
              />
            </View>
          </View>
        ))}
      </View>
    </DemoShell>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: 2 },
  number: { fontFamily: fontFamily.extrabold, fontSize: 72, lineHeight: 76, letterSpacing: -3 },
  group: { gap: 10 },
  week: { flexDirection: "row", justifyContent: "space-between" },
  dayTarget: { minWidth: layout.minTouch, minHeight: layout.minTouch, alignItems: "center", gap: 4 },
  dot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  dotMark: { fontFamily: fontFamily.extrabold, fontSize: 14, lineHeight: 18 },
  milestone: { gap: 6 },
  milestoneHead: { flexDirection: "row", justifyContent: "space-between" },
  track: { height: 8, borderRadius: radius.cell / 2, overflow: "hidden" },
  fill: { height: 8, borderRadius: radius.cell / 2 },
});

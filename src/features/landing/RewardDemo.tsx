import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Chip, Text } from "@/components/ui";
import type { LandingCopy } from "@/i18n/landing";
import { useTheme } from "@/lib/useTheme";
import { radius } from "@/shared/tokens";
import { DemoShell, fill } from "./DemoShell";

/** Dias já cumpridos quando a demo abre. */
const START_RUN = 12;

/** Presente por meta ao vivo: escolha o presente e a duração, conclua o dia ou perca um dia e veja a contagem reagir. */
export function RewardDemo({ copy }: { copy: LandingCopy["reward"] }) {
  const theme = useTheme();
  const [giftIndex, setGiftIndex] = useState(0);
  const [durationIndex, setDurationIndex] = useState(0);
  const [run, setRun] = useState(START_RUN);
  const [attempts, setAttempts] = useState(1);
  const [claimed, setClaimed] = useState(false);

  const gift = copy.gifts[giftIndex] ?? copy.gifts[0];
  const total = copy.durations[durationIndex] ?? copy.durations[0];
  if (!gift || total === undefined) return null;

  const shown = Math.min(run, total);
  const left = total - shown;
  const achieved = shown >= total;
  const percent = shown / total;
  const label = `${gift.emoji} ${gift.name}`;

  return (
    <DemoShell hint={copy.hint}>
      <View style={styles.group}>
        <Text variant="label" tone="mute">
          {copy.giftLabel}
        </Text>
        <View style={styles.chips}>
          {copy.gifts.map((item, index) => (
            <Chip
              key={item.name}
              emoji={item.emoji}
              label={item.name}
              selected={index === giftIndex}
              onPress={() => setGiftIndex(index)}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Text variant="label" tone="mute">
          {copy.durationLabel}
        </Text>
        <View style={styles.chips}>
          {copy.durations.map((days, index) => (
            <Chip
              key={days}
              label={fill(copy.durationOption, { n: days })}
              selected={index === durationIndex}
              onPress={() => setDurationIndex(index)}
            />
          ))}
        </View>
      </View>

      <View
        style={[styles.card, { backgroundColor: theme.bg }, achieved && { borderWidth: 2, borderColor: theme.acc }]}
        accessibilityLiveRegion="polite"
      >
        <Text variant="caption" tone="mute">
          {copy.cardTitle}
        </Text>
        <Text variant="sectionTitle">{label}</Text>
        {achieved ? (
          <>
            <Text variant="bodyStrong">{claimed ? copy.claimed : copy.doneTitle}</Text>
            {claimed ? null : <Text>{fill(copy.doneSub, { gift: label })}</Text>}
            {claimed ? null : <Button label={copy.claim} onPress={() => setClaimed(true)} />}
          </>
        ) : (
          <>
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(percent * 100) }}
              style={[styles.track, { backgroundColor: theme.line }]}
            >
              <View style={[styles.fill, { backgroundColor: theme.acc, width: `${percent * 100}%` }]} />
            </View>
            <Text variant="bodyMedium">{fill(copy.progress, { run: shown, total })}</Text>
            <Text variant="caption" tone="mute">
              {left === 1 ? copy.daysLeftOne : fill(copy.daysLeft, { n: left })}
            </Text>
            {attempts > 1 ? (
              <Text variant="caption" tone="mute">
                {fill(copy.restarted, { n: attempts })}
              </Text>
            ) : null}
          </>
        )}
      </View>

      <View style={styles.actions}>
        <Button label={copy.completeDay} disabled={achieved} onPress={() => setRun((r) => r + 1)} style={styles.flex} />
        <Button
          label={copy.missDay}
          variant="secondary"
          disabled={achieved}
          onPress={() => {
            setRun(0);
            setAttempts((n) => n + 1);
          }}
          style={styles.flex}
        />
      </View>
    </DemoShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: { borderRadius: radius.card, padding: 16, gap: 8 },
  track: { height: 10, borderRadius: 5, overflow: "hidden" },
  fill: { height: 10, borderRadius: 5 },
  actions: { flexDirection: "row", gap: 10 },
});

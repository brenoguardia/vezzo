import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Field } from "@/components/ui";
import { NoteTimeline } from "@/features/notes/NoteTimeline";
import type { LandingCopy } from "@/i18n/landing";
import { addDays, localDate } from "@/shared/dates";
import { NOTE_MAX_LENGTH, type NoteDto } from "@/shared/schemas";
import { DemoShell } from "./DemoShell";

const HABIT = "0".repeat(24);
const noteOf = (n: number, date: string, text: string): NoteDto => ({
  id: n.toString(16).padStart(24, "0"),
  habitId: HABIT,
  date,
  text,
  createdAt: `${date}T12:00:00.000Z`,
  updatedAt: `${date}T12:00:00.000Z`,
});

/** Anotações ao vivo: escreva uma anotação e veja a mesma linha do tempo do app crescer. */
export function NotesDemo({ copy }: { copy: LandingCopy["notes"] }) {
  const today = useMemo(() => localDate(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"), []);
  const [notes, setNotes] = useState<NoteDto[]>(() =>
    copy.seed.map((item, i) => noteOf(i + 1, addDays(today, -item.daysAgo), item.text)),
  );
  const [text, setText] = useState("");
  const empty = text.trim().length === 0;

  const save = () => {
    if (empty) return;
    setNotes((current) => [noteOf(current.length + 1, today, text.trim()), ...current]);
    setText("");
  };

  return (
    <DemoShell hint={copy.hint}>
      <Field
        label={copy.textLabel}
        placeholder={copy.placeholder}
        value={text}
        onChangeText={setText}
        maxLength={NOTE_MAX_LENGTH}
        onSubmitEditing={save}
        returnKeyType="done"
      />
      <Button label={copy.save} disabled={empty} onPress={save} />
      <View accessibilityLiveRegion="polite" style={styles.timeline}>
        <NoteTimeline notes={notes} today={today} />
      </View>
    </DemoShell>
  );
}

const styles = StyleSheet.create({
  timeline: { paddingTop: 4 },
});

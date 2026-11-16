import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "@/components/ui";
import { NoteComposer } from "@/features/notes/NoteComposer";
import { NoteTimeline } from "@/features/notes/NoteTimeline";
import { useNotes } from "@/features/notes/useNotes";
import { useT } from "@/i18n/useT";
import type { Ymd } from "@/shared/dates";

const PREVIEW = 3;

/** Prévia das anotações no detalhe do hábito: nova anotação e as três mais recentes. */
export function NotesCard({ habitId, today }: { habitId: string; today: Ymd }) {
  const t = useT();
  const router = useRouter();
  const { notes, hasMore, error, create } = useNotes(habitId, PREVIEW);
  const [composing, setComposing] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text variant="sectionTitle" accessibilityRole="header">
        {t("habit.notes.title")}
      </Text>
      {composing ? (
        <NoteComposer
          today={today}
          onCancel={() => setComposing(false)}
          onSubmit={async (value) => {
            await create(value);
            setComposing(false);
          }}
        />
      ) : (
        <Button label={t("habit.notes.new")} variant="secondary" onPress={() => setComposing(true)} />
      )}
      <Card radius={20} padding={16}>
        {notes.length ? (
          <NoteTimeline notes={notes.slice(0, PREVIEW)} today={today} />
        ) : (
          <>
            <Text variant="bodyStrong">{error ? t("habit.notes.loadError") : t("habit.notes.empty")}</Text>
            {error ? null : (
              <Text variant="caption" tone="mute">
                {t("habit.notes.emptySub")}
              </Text>
            )}
          </>
        )}
        {notes.length > 0 || hasMore ? (
          <Button
            label={t("habit.notes.seeAll")}
            variant="secondary"
            onPress={() => router.push({ pathname: "/habit/[id]/notes", params: { id: habitId } })}
          />
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
});

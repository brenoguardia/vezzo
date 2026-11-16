import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "@/components/ui";
import { useToday } from "@/features/habits/useToday";
import { NoteComposer } from "@/features/notes/NoteComposer";
import { NoteTimeline } from "@/features/notes/NoteTimeline";
import { useNotes } from "@/features/notes/useNotes";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { useT } from "@/i18n/useT";
import type { NoteDto } from "@/shared/schemas";
import { useHabitsStore } from "@/store/habits";

/** Todas as anotações do hábito, em timeline (mais recentes primeiro). */
export default function HabitNotes() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const today = useToday();
  const habit = useHabitsStore((s) => s.habits.find((h) => h.id === id));
  const { notes, hasMore, loading, error, loadMore, create, update, remove } = useNotes(id);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<NoteDto | null>(null);

  return (
    <SettingsShell
      back
      title={habit ? `${habit.emoji} ${t("habit.notes.title")}` : t("habit.notes.title")}
      tabBar={false}
    >
      <View style={styles.stack}>
        {editing ? (
          <NoteComposer
            key={editing.id}
            today={today}
            initialDate={editing.date}
            initialText={editing.text}
            onCancel={() => setEditing(null)}
            onSubmit={async (value) => {
              await update(editing.id, value);
              setEditing(null);
            }}
          />
        ) : composing ? (
          <NoteComposer
            today={today}
            onCancel={() => setComposing(false)}
            onSubmit={async (value) => {
              await create(value);
              setComposing(false);
            }}
          />
        ) : (
          <Button label={t("habit.notes.new")} onPress={() => setComposing(true)} />
        )}

        {notes.length ? (
          <Card radius={20} padding={16}>
            <NoteTimeline
              notes={notes}
              today={today}
              onEdit={(note) => {
                setComposing(false);
                setEditing(note);
              }}
              onDelete={(note) => remove(note.id)}
            />
          </Card>
        ) : loading ? null : (
          <Card radius={20} padding={16}>
            <Text variant="bodyStrong">{error ? t("habit.notes.loadError") : t("habit.notes.empty")}</Text>
            {error ? null : (
              <Text variant="caption" tone="mute">
                {t("habit.notes.emptySub")}
              </Text>
            )}
          </Card>
        )}

        {hasMore ? (
          <Button
            label={t("habit.notes.loadMore")}
            variant="secondary"
            onPress={() => void loadMore()}
            loading={loading}
          />
        ) : null}
        {error && notes.length ? (
          <Text variant="caption" tone="danger" accessibilityRole="alert">
            {t("habit.notes.loadError")}
          </Text>
        ) : null}
      </View>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
});

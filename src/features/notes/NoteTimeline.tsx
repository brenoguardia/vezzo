import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui";
import { dayLabel } from "@/features/notes/dayLabel";
import { useLocale } from "@/i18n/useLocale";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";
import type { Ymd } from "@/shared/dates";
import type { NoteDto } from "@/shared/schemas";
import { layout } from "@/shared/tokens";

interface Props {
  notes: readonly NoteDto[];
  today: Ymd;
  /** Sem `onEdit`/`onDelete` a timeline é só leitura (prévia no detalhe). */
  onEdit?: (note: NoteDto) => void;
  onDelete?: (note: NoteDto) => Promise<void>;
}

const DOT = 12;

/** Histórico em linha do tempo: marcador por anotação ligado por uma linha vertical, mais recentes primeiro. */
export function NoteTimeline({ notes, today, onEdit, onDelete }: Props) {
  const t = useT();
  const theme = useTheme();
  const locale = useLocale();
  const [confirming, setConfirming] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  return (
    <View accessibilityRole="list">
      {notes.map((note, i) => {
        const first = i === 0 || notes[i - 1]?.date !== note.date;
        const last = i === notes.length - 1;
        return (
          <View key={note.id} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.line, { backgroundColor: theme.line }, last && styles.lineEnd]} />
              <View style={[styles.dot, { backgroundColor: first ? theme.acc : theme.line }]} />
            </View>
            <View style={styles.body}>
              {first ? (
                <Text variant="captionStrong" tone="mute" accessibilityRole="header">
                  {dayLabel(note.date, today, locale, t)}
                </Text>
              ) : null}
              <Text variant="body" accessibilityRole="text">
                {note.text}
              </Text>
              {onEdit || onDelete ? (
                <View style={styles.actions}>
                  {onEdit ? (
                    <Pressable accessibilityRole="button" onPress={() => onEdit(note)} style={styles.action}>
                      <Text variant="caption" tone="acc">
                        {t("habit.notes.edit")}
                      </Text>
                    </Pressable>
                  ) : null}
                  {onDelete ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={async () => {
                        if (confirming !== note.id) {
                          setConfirming(note.id);
                          setFailed(null);
                          return;
                        }
                        try {
                          await onDelete(note);
                        } catch {
                          setFailed(note.id);
                        } finally {
                          setConfirming(null);
                        }
                      }}
                      style={styles.action}
                    >
                      <Text variant="caption" tone={confirming === note.id ? "danger" : "mute"}>
                        {confirming === note.id ? t("habit.notes.confirmDelete") : t("habit.notes.delete")}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
              {failed === note.id ? (
                <Text variant="caption" tone="danger" accessibilityRole="alert">
                  {t("habit.notes.deleteError")}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 14 },
  rail: { width: DOT, alignItems: "center" },
  line: { position: "absolute", top: 6, bottom: -6, width: 2, borderRadius: 1 },
  lineEnd: { bottom: "auto", height: 8 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, marginTop: 4 },
  body: { flex: 1, gap: 4, paddingBottom: 18 },
  actions: { flexDirection: "row", gap: 4 },
  action: { minHeight: layout.minTouch, justifyContent: "center", paddingRight: 16 },
});

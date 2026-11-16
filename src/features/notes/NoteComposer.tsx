import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Field, Stepper, Text } from "@/components/ui";
import { dayLabel } from "@/features/notes/dayLabel";
import { useLocale } from "@/i18n/useLocale";
import { useT } from "@/i18n/useT";
import { addDays, type Ymd } from "@/shared/dates";
import { NOTE_MAX_LENGTH } from "@/shared/schemas";

interface Props {
  today: Ymd;
  initialDate?: Ymd;
  initialText?: string;
  onSubmit: (value: { date: Ymd; text: string }) => Promise<void>;
  onCancel: () => void;
}

/** Compositor inline: escolhe o dia (hoje ou anteriores, nunca futuro) e escreve a anotação. */
export function NoteComposer({ today, initialDate = today, initialText = "", onSubmit, onCancel }: Props) {
  const t = useT();
  const locale = useLocale();
  const [date, setDate] = useState<Ymd>(initialDate);
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const empty = text.trim().length === 0;

  const submit = async () => {
    setSaving(true);
    setFailed(false);
    try {
      await onSubmit({ date, text: text.trim() });
    } catch {
      // Mantém o texto digitado para tentar de novo.
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card radius={20} padding={16} style={styles.card}>
      <Stepper
        value={dayLabel(date, today, locale, t)}
        decrementLabel={t("habit.notes.prevDay")}
        incrementLabel={t("habit.notes.nextDay")}
        onDecrement={() => setDate(addDays(date, -1))}
        onIncrement={() => setDate(addDays(date, 1))}
        incrementDisabled={date >= today}
      />
      <Field
        label={t("habit.notes.textLabel")}
        placeholder={t("habit.notes.placeholder")}
        value={text}
        onChangeText={setText}
        maxLength={NOTE_MAX_LENGTH}
        multiline
        autoFocus={!initialText}
      />
      {failed ? (
        <Text variant="caption" tone="danger" accessibilityRole="alert">
          {t("habit.notes.saveError")}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Button label={t("habit.notes.cancel")} variant="secondary" onPress={onCancel} style={styles.flex} />
        <Button
          label={t("habit.notes.save")}
          onPress={() => void submit()}
          disabled={empty}
          loading={saving}
          style={styles.flex}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: 12 },
  actions: { flexDirection: "row", gap: 10 },
});

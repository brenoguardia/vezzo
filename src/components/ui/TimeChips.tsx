import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { radius } from "@/shared/tokens";
import { Text } from "./Text";

interface Props {
  /** Horários "HH:mm". */
  value: readonly string[];
  onChange: (times: string[]) => void;
  max?: number;
  addLabel: string;
  removeLabel: (time: string) => string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toHhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const toDate = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

/** Lista de horários de lembrete com seletor nativo. Mantém a lista ordenada e sem duplicados. */
export function TimeChips({ value, onChange, max = 5, addLabel, removeLabel }: Props) {
  const theme = useTheme();
  const [iosOpen, setIosOpen] = useState(false);

  const add = (date: Date) => {
    const time = toHhmm(date);
    if (!value.includes(time)) onChange([...value, time].sort());
  };

  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: toDate("08:00"),
        mode: "time",
        is24Hour: true,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === "set" && date) add(date);
        },
      });
    } else {
      setIosOpen((v) => !v);
    }
  };

  return (
    <View>
      <View style={styles.row}>
        {value.map((time) => (
          <Pressable
            key={time}
            accessibilityRole="button"
            accessibilityLabel={removeLabel(time)}
            onPress={() => onChange(value.filter((v) => v !== time))}
            style={[styles.chip, { backgroundColor: theme.acc }]}
          >
            <Text variant="bodyMedium" tone="accInk">
              {time} ✕
            </Text>
          </Pressable>
        ))}
        {value.length < max ? (
          <Pressable
            accessibilityRole="button"
            onPress={open}
            style={[styles.chip, { borderWidth: 1, borderColor: theme.line }]}
          >
            <Text variant="bodyMedium" tone="mute">
              + {addLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {iosOpen && Platform.OS === "ios" ? (
        <DateTimePicker
          value={toDate("08:00")}
          mode="time"
          display="spinner"
          is24Hour
          onChange={(_, date) => date && add(date)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: radius.chip, justifyContent: "center" },
});

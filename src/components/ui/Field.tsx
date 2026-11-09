import { type ComponentRef, forwardRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { fontFamily, radius } from "@/shared/tokens";
import { Text } from "./Text";

export interface FieldProps extends Omit<TextInputProps, "style" | "placeholderTextColor"> {
  label: string;
  error?: string;
  /** Elemento à direita do valor (ex.: botão mostrar/ocultar senha). */
  right?: React.ReactNode;
}

export type FieldInput = ComponentRef<typeof TextInput>;

export const Field = forwardRef<FieldInput, FieldProps>(function Field(
  { label, error, right, onFocus, onBlur, ...input },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? theme.danger : focused ? theme.acc : "transparent";
  return (
    <View>
      <View style={[styles.box, { backgroundColor: theme.card, borderColor }]}>
        <View style={styles.main}>
          <Text variant="label" tone="mute" style={styles.label}>
            {label}
          </Text>
          <TextInput
            ref={ref}
            accessibilityLabel={label}
            placeholderTextColor={theme.mute}
            selectionColor={theme.acc}
            {...input}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[styles.input, { color: theme.ink }]}
          />
        </View>
        {right}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

/** Área de toque de 44 pt para elementos à direita do campo. */
export function FieldAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={styles.action}>
      <Text variant="captionStrong" tone="mute">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 64,
    borderRadius: radius.field,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  main: { flex: 1 },
  // Rótulo do campo: 600/11 `mute` (docs/05), sem caixa alta.
  label: { fontFamily: fontFamily.semibold, textTransform: "none", letterSpacing: 0, marginBottom: 2 },
  input: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22, padding: 0, minHeight: 22 },
  error: { marginTop: 6, marginLeft: 4 },
  action: { minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center", marginLeft: 8 },
});

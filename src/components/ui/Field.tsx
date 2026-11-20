import { type ComponentRef, forwardRef, useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { fontFamily, radius } from "@/shared/tokens";
import { MAX_FONT_SCALE, Text } from "./Text";

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
  const inner = useRef<FieldInput | null>(null);
  const setRef = useCallback(
    (node: FieldInput | null) => {
      inner.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  const borderColor = error ? theme.danger : focused ? theme.acc : "transparent";
  return (
    <View>
      {/* A caixa inteira (≥ 64 dp) foca o campo: o TextInput sozinho tem só ~22 dp de altura. Fora da árvore de acessibilidade para não duplicar o foco do leitor de tela. */}
      <Pressable
        accessible={false}
        importantForAccessibility="no"
        onPress={() => inner.current?.focus()}
        style={[styles.box, { backgroundColor: theme.card, borderColor }]}
      >
        <View style={styles.main}>
          <Text variant="label" tone="mute" style={styles.label}>
            {label}
          </Text>
          <TextInput
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            ref={setRef}
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
      </Pressable>
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

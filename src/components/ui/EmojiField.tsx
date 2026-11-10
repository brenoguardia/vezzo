import { type ComponentRef, useRef } from "react";
import { Pressable, StyleSheet, Text as RNText, TextInput, View } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { EMOJI_PRESETS, isSingleEmoji, lastEmoji } from "@/shared/emoji";
import { radius } from "@/shared/tokens";
import { MAX_FONT_SCALE, Text } from "./Text";

interface Props {
  value: string;
  onChange: (emoji: string) => void;
  customLabel: string;
  error?: string;
}

const TILE = 46;

/** Grade de 10 emojis + tile tracejado "+" que abre o teclado de emojis do sistema (TextInput oculto). */
export function EmojiField({ value, onChange, customLabel, error }: Props) {
  const theme = useTheme();
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const custom = !(EMOJI_PRESETS as readonly string[]).includes(value) && isSingleEmoji(value);

  return (
    <View>
      <View style={styles.grid}>
        {EMOJI_PRESETS.map((emoji) => {
          const selected = emoji === value;
          return (
            <Pressable
              key={emoji}
              accessibilityRole="button"
              accessibilityLabel={emoji}
              accessibilityState={{ selected }}
              onPress={() => onChange(emoji)}
              style={[
                styles.tile,
                { backgroundColor: theme.card },
                selected && { borderWidth: 2, borderColor: theme.acc },
              ]}
            >
              <RNText style={styles.emoji}>{emoji}</RNText>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={customLabel}
          accessibilityState={{ selected: custom }}
          onPress={() => input.current?.focus()}
          style={[
            styles.tile,
            custom
              ? { backgroundColor: theme.card, borderWidth: 2, borderColor: theme.acc }
              : { borderWidth: 1.5, borderStyle: "dashed", borderColor: theme.line },
          ]}
        >
          {custom ? (
            <RNText style={styles.emoji}>{value}</RNText>
          ) : (
            <Text tone="mute" style={styles.plus}>
              +
            </Text>
          )}
        </Pressable>
      </View>
      <TextInput
            maxFontSizeMultiplier={MAX_FONT_SCALE}
        ref={input}
        value=""
        accessibilityElementsHidden
        importantForAccessibility="no"
        caretHidden
        autoCorrect={false}
        onChangeText={(text) => {
          const emoji = lastEmoji(text);
          if (emoji) {
            onChange(emoji);
            input.current?.blur();
          }
        }}
        style={styles.hidden}
      />
      {error ? (
        <Text variant="caption" tone="danger" accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: TILE, height: TILE, borderRadius: radius.chip, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 24, lineHeight: 30, includeFontPadding: false },
  plus: { fontSize: 22, lineHeight: 26 },
  hidden: { position: "absolute", width: 1, height: 1, opacity: 0 },
  error: { marginTop: 6 },
});

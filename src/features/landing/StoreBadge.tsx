import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui";
import { useTheme } from "@/lib/useTheme";
import { fontFamily, layout, radius } from "@/shared/tokens";

interface Props {
  /** Linha pequena acima do nome ("Baixar na"). */
  caption: string;
  store: string;
  /** URL da loja; `null` desativa o selo e mostra `soonLabel`. */
  url: string | null;
  soonLabel: string;
  testID?: string;
}

/** Selo de download. Sem URL, fica desativado ("Em breve") até os links existirem em `STORE_LINKS`. */
export function StoreBadge({ caption, store, url, soonLabel, testID }: Props) {
  const theme = useTheme();
  const available = url !== null;
  return (
    <Pressable
      testID={testID}
      accessibilityRole={available ? "link" : "button"}
      accessibilityLabel={available ? `${caption} ${store}` : `${store}, ${soonLabel}`}
      accessibilityState={{ disabled: !available }}
      disabled={!available}
      onPress={() => {
        if (url) void Linking.openURL(url);
      }}
      style={({ pressed }) => [
        styles.badge,
        { backgroundColor: theme.card, borderColor: theme.line, opacity: available ? (pressed ? 0.85 : 1) : 0.7 },
      ]}
    >
      <View>
        <Text variant="caption" tone="mute">
          {available ? caption : soonLabel}
        </Text>
        <Text style={styles.store}>{store}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: layout.minTouch + 12,
    minWidth: 160,
    borderRadius: radius.button,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: "center",
  },
  store: { fontFamily: fontFamily.extrabold, fontSize: 18, lineHeight: 24 },
});

import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { radius } from "@/shared/tokens";
import { useToastStore } from "@/store/toast";
import { Text } from "./Text";

const DURATION_MS = 3500;

export function ToastHost() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(hide, DURATION_MS);
    return () => clearTimeout(id);
  }, [message, hide]);

  if (!message) return null;
  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 12 }]}>
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.toast, { backgroundColor: theme.card, borderColor: theme.line }]}
      >
        <Text variant="bodyMedium">{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center", paddingHorizontal: 22 },
  toast: { maxWidth: 480, borderRadius: radius.field, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 18 },
});

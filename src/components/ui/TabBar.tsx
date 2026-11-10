import { Platform, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { layout, radius, tabBarShadow } from "@/shared/tokens";
import { TabIcon, type TabIconName } from "./TabIcon";
import { Text } from "./Text";

export interface TabItem {
  key: string;
  label: string;
  icon: TabIconName;
}

interface Props {
  items: readonly TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

/**
 * Barra de abas flutuante (docs/05), ícones de traço 18×18. Para usar com Expo Router, passe-a
 * em `tabBar={...}` adaptando `state`.
 */
export function TabBar({ items, activeKey, onSelect }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(22, insets.bottom) }]}>
      <View
        accessibilityRole="tablist"
        style={[styles.bar, { backgroundColor: theme.card }, shadow]}
      >
        {items.map((item) => {
          const active = item.key === activeKey;
          // `accText`: a cor de destaque crua não tem contraste suficiente no modo claro.
          const color = active ? theme.accText : theme.mute;
          return (
            <Pressable
              key={item.key}
              testID={`tab-${item.key}`}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(item.key)}
              style={styles.item}
            >
              <TabIcon name={item.icon} color={color} active={active} />
              <Text variant="captionStrong" style={[styles.label, { color }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const shadow: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: tabBarShadow.blur / 2,
    shadowOffset: { width: 0, height: tabBarShadow.offsetY },
  },
  android: { elevation: 8 },
  default: { boxShadow: `0 ${tabBarShadow.offsetY}px ${tabBarShadow.blur}px ${tabBarShadow.color}` },
})!;

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, alignItems: "center" },
  bar: {
    height: layout.tabBarHeight,
    width: "100%",
    maxWidth: layout.tabBarMaxWidth,
    borderRadius: radius.tabBar,
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 5, minHeight: 44 },
  label: { fontSize: 10, lineHeight: 13 },
});

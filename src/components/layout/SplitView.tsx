import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLayoutMode } from "@/lib/useLayoutMode";
import { useTheme } from "@/lib/useTheme";
import { layout } from "@/shared/tokens";

interface Props {
  left: ReactNode;
  right: ReactNode;
  /** No modo single, só o lado ativo (escolhido pela navegação) é renderizado. */
  active?: "left" | "right";
  /** Reserva espaço para a barra de abas flutuante. */
  tabBar?: boolean;
  /** `false` quando o lado direito já rola sozinho (ex.: formulário), evitando rolagem aninhada. */
  rightScrolls?: boolean;
}

/**
 * Duas colunas independentes no modo dual; nunca cruzam a dobradiça (docs/08). Cada coluna rola
 * sozinha e tem os próprios paddings (44 no topo, 28 nas laterais). No modo single, renderiza só
 * o lado ativo.
 */
export function SplitView({ left, right, active = "left", tabBar = true, rightScrolls = true }: Props) {
  const { dual, columnWidth, sides } = useLayoutMode();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(22, insets.bottom) + (tabBar ? layout.tabBarHeight + 24 : 0);

  if (!dual) return <>{active === "left" ? left : right}</>;

  const pane = (children: ReactNode, testID: string) => (
    <ScrollView
      testID={testID}
      style={[styles.pane, { width: columnWidth }]}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top + layout.dualPaddingTop,
        paddingBottom: bottom,
        paddingHorizontal: layout.dualPaddingSide,
        gap: 14,
      }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );

  return (
    <View style={[styles.row, { backgroundColor: theme.bg, paddingLeft: sides.left, paddingRight: sides.right }]}>
      {pane(left, "split-left")}
      {rightScrolls ? (
        pane(right, "split-right")
      ) : (
        <View testID="split-right" style={{ width: columnWidth, paddingTop: insets.top, paddingBottom: bottom }}>
          {right}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: "row", justifyContent: "center", gap: layout.dualGap },
  pane: { flexGrow: 0 },
});

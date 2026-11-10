import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type LayoutInfo, layoutInfo } from "./layout-mode";

/**
 * Reage à largura disponível da janela, nunca ao modelo do aparelho (docs/08). Lê a janela e a
 * safe area no render: ao dobrar/abrir um dobrável ambas mudam, e um valor em cache ficaria velho.
 */
export function useLayoutMode(): LayoutInfo {
  const { width } = useWindowDimensions();
  const { left, right } = useSafeAreaInsets();
  return layoutInfo(width, undefined, { left, right });
}

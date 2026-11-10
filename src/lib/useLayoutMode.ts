import { useWindowDimensions } from "react-native";
import { type LayoutInfo, layoutInfo } from "./layout-mode";

/** Reage à largura disponível da janela, nunca ao modelo do aparelho (docs/08). */
export function useLayoutMode(): LayoutInfo {
  const { width } = useWindowDimensions();
  return layoutInfo(width);
}

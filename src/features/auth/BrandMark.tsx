import Svg, { Path, Rect } from "react-native-svg";
import { useTheme } from "@/lib/useTheme";

/** Marca: quadrado `acc` (raio 0,26·L) com V-check em `accInk`. */
export function BrandMark({ size = 112 }: { size?: number }) {
  const theme = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 112 112" accessibilityRole="image" accessibilityLabel="Vezzo">
      <Rect width={112} height={112} rx={112 * 0.26} fill={theme.acc} />
      <Path
        d="M30 44 L50 76 L84 32"
        stroke={theme.accInk}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

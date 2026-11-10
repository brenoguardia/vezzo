import Svg, { Circle, Path } from "react-native-svg";

export type TabIconName = "today" | "progress" | "habits" | "profile";

interface Props {
  name: TabIconName;
  color: string;
  /** Lado em pt; o design usa 18. */
  size?: number;
  /** Traço mais grosso no item ativo. */
  active?: boolean;
}

/** Ícones da barra de abas (traço, viewBox 24). Decorativos: o rótulo da aba é lido pelo leitor de tela. */
export function TabIcon({ name, color, size = 18, active = false }: Props) {
  const stroke = {
    stroke: color,
    strokeWidth: active ? 2.5 : 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
  } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {name === "today" ? (
        <>
          <Circle cx={12} cy={12} r={9} {...stroke} />
          <Path d="M8 12.5l2.8 2.8L16.2 9.6" {...stroke} />
        </>
      ) : null}
      {name === "progress" ? <Path d="M5 20v-7M12 20V5M19 20V9" {...stroke} /> : null}
      {name === "habits" ? (
        <>
          <Path d="M10 6h10M10 12h10M10 18h10" {...stroke} />
          <Circle cx={4.5} cy={6} r={1} {...stroke} />
          <Circle cx={4.5} cy={12} r={1} {...stroke} />
          <Circle cx={4.5} cy={18} r={1} {...stroke} />
        </>
      ) : null}
      {name === "profile" ? (
        <>
          <Circle cx={12} cy={8} r={4} {...stroke} />
          <Path d="M4 20c0-3.9 3.6-6 8-6s8 2.1 8 6" {...stroke} />
        </>
      ) : null}
    </Svg>
  );
}

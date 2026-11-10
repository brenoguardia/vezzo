import { layout } from "@/shared/tokens";

export type LayoutMode = "single" | "dual";

/** Insets horizontais da safe area: no iPhone Duo o rail vertical (~84 pt) aparece aqui. */
export interface SideInsets {
  left: number;
  right: number;
}

export interface LayoutInfo {
  mode: LayoutMode;
  dual: boolean;
  /** Largura da janela. */
  width: number;
  /** Largura utilizável: janela menos os insets laterais (rail do dobrável). */
  usableWidth: number;
  /** Insets laterais, para somar às margens e à posição de barras flutuantes. */
  sides: SideInsets;
  /** Largura de cada coluna no modo dual; a largura utilizável no modo single. */
  columnWidth: number;
}

/** `dual` a partir de 600 pt: iPad, iPhone Max em paisagem e dobráveis abertos (docs/08). */
export const layoutMode = (width: number): LayoutMode => (width >= layout.dualBreakpoint ? "dual" : "single");

const NO_SIDES: SideInsets = { left: 0, right: 0 };

export function layoutInfo(width: number, gap: number = layout.dualGap, sides: SideInsets = NO_SIDES): LayoutInfo {
  const mode = layoutMode(width);
  const usableWidth = Math.max(0, width - sides.left - sides.right);
  const base = { mode, width, usableWidth, sides };
  if (mode === "single") return { ...base, dual: false, columnWidth: usableWidth };
  return { ...base, dual: true, columnWidth: Math.min((usableWidth - gap) / 2, layout.dualColumnMax) };
}

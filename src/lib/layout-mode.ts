import { layout } from "@/shared/tokens";

export type LayoutMode = "single" | "dual";

export interface LayoutInfo {
  mode: LayoutMode;
  dual: boolean;
  width: number;
  /** Largura de cada coluna no modo dual; a largura total no modo single. */
  columnWidth: number;
}

/** `dual` a partir de 600 pt: iPad, iPhone Max em paisagem e dobráveis abertos (docs/08). */
export const layoutMode = (width: number): LayoutMode => (width >= layout.dualBreakpoint ? "dual" : "single");

export function layoutInfo(width: number, gap: number = layout.dualGap): LayoutInfo {
  const mode = layoutMode(width);
  if (mode === "single") return { mode, dual: false, width, columnWidth: width };
  return { mode, dual: true, width, columnWidth: Math.min((width - gap) / 2, layout.dualColumnMax) };
}

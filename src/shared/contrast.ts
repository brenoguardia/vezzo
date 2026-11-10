const channel = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** Luminância relativa WCAG de uma cor `#rrggbb`. */
export function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1, 7), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** Razão de contraste WCAG entre duas cores `#rrggbb` (1 a 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
const rgb = (hex: string) => {
  const n = Number.parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

/** Mistura `from` em direção a `to` (`t` de 0 a 1). */
export function mix(from: string, to: string, t: number): string {
  const [a, b] = [rgb(from), rgb(to)];
  return `#${[0, 1, 2].map((i) => toHex((a[i] ?? 0) + ((b[i] ?? 0) - (a[i] ?? 0)) * t)).join("")}`;
}

/**
 * Escurece (ou clareia) `color` em direção a `toward` até atingir `min`:1 sobre `background`.
 * Mantém a matiz da cor de destaque quando ela já é legível.
 */
export function readableOn(color: string, background: string, toward: string, min = 4.5): string {
  for (let t = 0; t <= 1; t += 0.02) {
    const candidate = mix(color, toward, t);
    if (contrastRatio(candidate, background) >= min) return candidate;
  }
  return toward;
}

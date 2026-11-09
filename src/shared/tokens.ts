import { ACCENTS } from "./schemas/common";

export { ACCENTS };
export type Accent = (typeof ACCENTS)[number];
export type ThemeScheme = "dark" | "light";

export const DEFAULT_ACCENT: Accent = ACCENTS[0];

export interface Palette {
  bg: string;
  card: string;
  ink: string;
  mute: string;
  line: string;
  accInk: string;
  danger: string;
  /** Alfa (hex) aplicado à cor de destaque no fundo do emoji. */
  tintAlpha: string;
}

export const palettes: Record<ThemeScheme, Palette> = {
  dark: {
    bg: "#121413",
    card: "#1c1f1d",
    ink: "#f2f3ef",
    mute: "#9aa19b",
    line: "#2e332f",
    accInk: "#14170c",
    danger: "#ee6f6f",
    tintAlpha: "30",
  },
  light: {
    bg: "#f6f4ee",
    card: "#ffffff",
    ink: "#1b1d1a",
    mute: "#6f746c",
    line: "#e4e1d8",
    accInk: "#14170c",
    danger: "#ee6f6f",
    tintAlpha: "40",
  },
};

export interface ThemeTokens extends Palette {
  scheme: ThemeScheme;
  acc: Accent;
  /** Fundo do emoji tile: `acc` + alfa. */
  tint: string;
}

export function buildTheme(scheme: ThemeScheme, acc: Accent): ThemeTokens {
  const palette = palettes[scheme];
  return { ...palette, scheme, acc, tint: `${acc}${palette.tintAlpha}` };
}

/** Pesos da Manrope (nomes de `@expo-google-fonts/manrope`). */
export const fontFamily = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semibold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extrabold: "Manrope_800ExtraBold",
  /** Exigida pelas diretrizes do botão do Google. */
  roboto: "Roboto_500Medium",
} as const;
export type FontWeightKey = keyof typeof fontFamily;

export interface TextStyleToken {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: "uppercase";
}

const title = (size: number, spacing: number): TextStyleToken => ({
  fontFamily: fontFamily.extrabold,
  fontSize: size,
  lineHeight: Math.round(size * 1.1),
  letterSpacing: spacing,
});
const body = (family: string, size: number): TextStyleToken => ({
  fontFamily: family,
  fontSize: size,
  lineHeight: Math.round(size * 1.4),
  letterSpacing: 0,
});

export const typography = {
  streak: title(96, -4),
  brand: title(44, -1.5),
  display: title(40, -1),
  onboardingTitle: title(36, -1.2),
  authTitle: title(32, -1),
  screenTitle: title(28, -0.8),
  sectionTitle: { ...title(18, 0), lineHeight: 25 },
  bodyStrong: body(fontFamily.bold, 16),
  bodyMedium: body(fontFamily.semibold, 15),
  body: body(fontFamily.medium, 15),
  caption: body(fontFamily.semibold, 12),
  captionStrong: body(fontFamily.bold, 12),
  label: {
    ...body(fontFamily.bold, 11),
    letterSpacing: 1,
    textTransform: "uppercase",
  } satisfies TextStyleToken,
} as const satisfies Record<string, TextStyleToken>;
export type TextVariant = keyof typeof typography;

export const spacing = {
  xs: 4,
  s6: 6,
  s: 8,
  s10: 10,
  m: 12,
  s14: 14,
  l: 16,
  s18: 18,
  xl: 20,
  s22: 22,
  xxl: 24,
  xxxl: 28,
} as const;

export const radius = {
  cell: 8,
  pill: 10,
  chip: 14,
  field: 16,
  button: 18,
  card: 20,
  cardLarge: 24,
  cardHero: 28,
  tabBar: 34,
} as const;

export const layout = {
  screenMargin: 22,
  authMargin: 28,
  minTouch: 44,
  tabBarHeight: 68,
  tabBarMaxWidth: 540,
} as const;

export const tabBarShadow = {
  offsetY: 8,
  blur: 24,
  color: "rgba(0,0,0,0.18)",
} as const;

function channel(hex: string, i: number): number {
  return parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
}

function luminance(hex: string): number {
  const [r, g, b] = [0, 1, 2].map((i) => {
    const c = channel(hex, i) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** Razão de contraste WCAG entre duas cores `#rrggbb`. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Botões de marca: cores e proporções definidas pelas diretrizes do Google, não pelo tema do app. */
export const googleButton = {
  dark: { bg: "#131314", border: "#8e918f", text: "#e3e3e3" },
  light: { bg: "#ffffff", border: "#747775", text: "#1f1f1f" },
  logo: { blue: "#4285f4", green: "#34a853", yellow: "#fbbc05", red: "#ea4335" },
} as const;

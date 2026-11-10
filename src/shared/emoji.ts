const PICTOGRAPHIC = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;
const SINGLE_FALLBACK =
  /^(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier}|‍\p{Extended_Pictographic})*)$/u;

/** Verdadeiro se o texto é exatamente um emoji (um grafema pictográfico). */
export function isSingleEmoji(value: string): boolean {
  if (!value || !PICTOGRAPHIC.test(value)) return false;
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const graphemes = [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value)];
    return graphemes.length === 1;
  }
  // Hermes pode não ter Intl.Segmenter.
  return SINGLE_FALLBACK.test(value);
}

/** Emojis pré-selecionados do seletor de hábito (docs/05, tela 8). */
export const EMOJI_PRESETS = ["📖", "💧", "🏃", "🧘", "🥗", "😴", "✍️", "🎯", "💰", "🌿"] as const;

/** Último emoji digitado, ou `null`. Usado pelo campo oculto que abre o teclado de emojis do sistema. */
export function lastEmoji(text: string): string | null {
  if (!text) return null;
  const parts =
    typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
      ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map((s) => s.segment)
      : (text.match(/\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier}|‍\p{Extended_Pictographic})*/gu) ?? []);
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part && isSingleEmoji(part)) return part;
  }
  return null;
}

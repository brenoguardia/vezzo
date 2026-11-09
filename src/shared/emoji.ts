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

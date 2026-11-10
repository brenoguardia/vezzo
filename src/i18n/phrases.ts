import type { Locale } from "./index";

/** Faixa de progresso do dia: nenhum feito, menos da metade, metade ou mais, tudo feito. */
export type PhraseBand = "none" | "low" | "high" | "full";

export const phraseBand = (done: number, counted: number): PhraseBand => {
  if (counted <= 0 || done <= 0) return "none";
  if (done >= counted) return "full";
  return done / counted >= 0.5 ? "high" : "low";
};

const ptBR: Record<PhraseBand, string[]> = {
  none: [
    "Um pequeno passo já muda o dia.",
    "Comece pelo mais fácil. O resto vem.",
    "Hoje é um bom dia para recomeçar.",
    "Um hábito de cada vez.",
    "O primeiro check é o mais importante.",
    "Não precisa ser perfeito, só constante.",
    "Respire e escolha um hábito para começar.",
    "Seu eu de amanhã agradece o começo de hoje.",
  ],
  low: [
    "Bom começo! Continue assim.",
    "Já saiu do zero. O ritmo vem junto.",
    "Cada hábito feito conta.",
    "Você está no caminho. Mais um?",
    "Constância vence intensidade.",
    "Ótimo, o mais difícil já passou.",
    "Pequenos passos somam muito.",
    "Falta bastante, mas você já começou.",
  ],
  high: [
    "Você já completou mais da metade. Falta pouco.",
    "Reta final: quase lá!",
    "Mais da metade feita. Siga firme.",
    "Está indo muito bem. Falta pouco.",
    "O dia está quase ganho.",
    "Só mais um empurrãozinho.",
    "Ritmo ótimo. Continue!",
    "Quase tudo feito. Vale terminar.",
  ],
  full: [
    "Dia completo! Orgulhe-se.",
    "Tudo feito. Sua sequência agradece.",
    "Missão cumprida por hoje.",
    "Dia perfeito. Aproveite o descanso.",
    "Você cumpriu tudo o que planejou.",
    "Mais um dia para a sua história.",
    "Que constância! Parabéns.",
    "Hoje você foi até o fim.",
  ],
};

const en: Record<PhraseBand, string[]> = {
  none: [
    "One small step can change the day.",
    "Start with the easiest one. The rest follows.",
    "Today is a good day to start over.",
    "One habit at a time.",
    "The first check is the most important.",
    "It doesn't have to be perfect, just steady.",
    "Take a breath and pick a habit to begin.",
    "Tomorrow's you will thank today's start.",
  ],
  low: [
    "Good start! Keep it going.",
    "You're off zero. The rhythm will follow.",
    "Every habit done counts.",
    "You're on your way. One more?",
    "Consistency beats intensity.",
    "Great, the hardest part is behind you.",
    "Small steps add up.",
    "Plenty left, but you've begun.",
  ],
  high: [
    "You're past halfway. Almost there.",
    "Final stretch: nearly done!",
    "More than half done. Stay steady.",
    "You're doing great. Not much left.",
    "The day is almost won.",
    "Just one more push.",
    "Great pace. Keep going!",
    "Almost everything done. Finish strong.",
  ],
  full: [
    "Day complete! Be proud.",
    "All done. Your streak says thanks.",
    "Mission accomplished for today.",
    "A perfect day. Enjoy the rest.",
    "You did everything you planned.",
    "Another day for your story.",
    "Such consistency! Well done.",
    "Today you went all the way.",
  ],
};

export const phraseBank: Record<Locale, Record<PhraseBand, string[]>> = { "pt-BR": ptBR, en };

/** Frase do dia: uma por dia, índice = dia do ano, dentro da faixa de progresso. */
export function dailyPhrase(locale: Locale, band: PhraseBand, dayOfYear: number): string {
  const list = phraseBank[locale][band];
  return list[((dayOfYear % list.length) + list.length) % list.length]!;
}

import { CATEGORIES, type GoalUnit, type TemplateSeed } from "./categories";
import type { HabitInput } from "./schemas";

export type Locale = "pt-BR" | "en";
export type Selection = Record<string, { goalValue: number; days: number[] }>;

const STEPS: Record<GoalUnit, number | null> = {
  LITERS: 0.25,
  MILLILITERS: 250,
  MINUTES: 5,
  PAGES: 5,
  COUNT: 1,
  CURRENCY: 1,
  BOOLEAN: null,
};

/** Passo do stepper por unidade (docs/05). `null` = sem stepper (sim/não). */
export const stepSize = (unit: GoalUnit): number | null => STEPS[unit];

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Sobe ou desce um passo; o mínimo é um passo (a meta é sempre positiva). */
export function stepGoal(value: number, unit: GoalUnit, direction: 1 | -1): number {
  const step = STEPS[unit];
  if (step === null) return 1;
  return round(Math.max(step, value + direction * step));
}

const UNIT_SUFFIX: Record<GoalUnit, Record<Locale, string>> = {
  LITERS: { "pt-BR": " L", en: " L" },
  MILLILITERS: { "pt-BR": " ml", en: " ml" },
  MINUTES: { "pt-BR": " min", en: " min" },
  PAGES: { "pt-BR": " pág.", en: " pg." },
  COUNT: { "pt-BR": "×", en: "×" },
  CURRENCY: { "pt-BR": "", en: "" },
  BOOLEAN: { "pt-BR": "", en: "" },
};

export function formatGoal(value: number, unit: GoalUnit, locale: Locale): string {
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  return `${number}${UNIT_SUFFIX[unit][locale]}`;
}

const TEMPLATES: TemplateSeed[] = CATEGORIES.flatMap((c) => c.templates);

export const findTemplate = (slug: string): TemplateSeed | undefined => TEMPLATES.find((t) => t.slug === slug);

export const templateName = (template: TemplateSeed, locale: Locale): string =>
  locale === "en" ? template.nameEn : template.namePt;

export const defaultsOf = (template: TemplateSeed): Selection[string] => ({
  goalValue: template.defaultGoalValue,
  days: [...template.defaultDays],
});

/** Chips pré-selecionados no design (docs/05, tela 4.2). */
export const DEFAULT_SLUGS = ["beber-agua", "meditar", "ler", "treinar"] as const;

export const DEFAULT_SELECTION: Selection = Object.fromEntries(
  DEFAULT_SLUGS.flatMap((slug) => {
    const template = findTemplate(slug);
    return template ? [[slug, defaultsOf(template)] as const] : [];
  }),
);

/** Converte a seleção em hábitos para `POST /v1/onboarding/complete`, na ordem do catálogo. */
export function buildOnboardingHabits(selected: Selection, locale: Locale): HabitInput[] {
  return TEMPLATES.flatMap((template) => {
    const choice = selected[template.slug];
    if (!choice) return [];
    return [
      {
        templateSlug: template.slug,
        name: templateName(template, locale),
        emoji: template.emoji,
        goalValue: choice.goalValue,
        goalUnit: template.goalUnit,
        days: [...choice.days].sort((a, b) => a - b),
        reminders: [],
        quickActions: true,
      },
    ];
  });
}

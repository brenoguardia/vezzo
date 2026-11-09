// Catálogo pré-definido (docs/02). Fonte única: usado pelo seed e pelo onboarding offline.
export const GOAL_UNITS = [
  "COUNT",
  "LITERS",
  "MILLILITERS",
  "MINUTES",
  "PAGES",
  "BOOLEAN",
  "CURRENCY",
] as const;
export type GoalUnit = (typeof GOAL_UNITS)[number];

export type TemplateSeed = {
  slug: string;
  namePt: string;
  nameEn: string;
  emoji: string;
  defaultGoalValue: number;
  goalUnit: GoalUnit;
  /** 0 = segunda ... 6 = domingo */
  defaultDays: number[];
  order: number;
};

export type CategorySeed = {
  slug: string;
  namePt: string;
  nameEn: string;
  order: number;
  templates: TemplateSeed[];
};

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [0, 1, 2, 3, 4];

export const CATEGORIES: CategorySeed[] = [
  {
    slug: "saude",
    namePt: "Saúde",
    nameEn: "Health",
    order: 1,
    templates: [
      { slug: "beber-agua", namePt: "Beber água", nameEn: "Drink water", emoji: "💧", defaultGoalValue: 2.5, goalUnit: "LITERS", defaultDays: ALL_DAYS, order: 1 },
      { slug: "treinar", namePt: "Treinar", nameEn: "Work out", emoji: "🏋️", defaultGoalValue: 30, goalUnit: "MINUTES", defaultDays: [0, 2, 4], order: 2 },
      { slug: "dormir-cedo", namePt: "Dormir cedo", nameEn: "Sleep early", emoji: "😴", defaultGoalValue: 1, goalUnit: "BOOLEAN", defaultDays: ALL_DAYS, order: 3 },
      { slug: "comer-bem", namePt: "Comer bem", nameEn: "Eat well", emoji: "🥗", defaultGoalValue: 1, goalUnit: "BOOLEAN", defaultDays: ALL_DAYS, order: 4 },
    ],
  },
  {
    slug: "mente",
    namePt: "Mente",
    nameEn: "Mind",
    order: 2,
    templates: [
      { slug: "meditar", namePt: "Meditar", nameEn: "Meditate", emoji: "🧘", defaultGoalValue: 10, goalUnit: "MINUTES", defaultDays: ALL_DAYS, order: 1 },
      { slug: "ler", namePt: "Ler", nameEn: "Read", emoji: "📚", defaultGoalValue: 15, goalUnit: "PAGES", defaultDays: ALL_DAYS, order: 2 },
      { slug: "diario", namePt: "Diário", nameEn: "Journal", emoji: "✍️", defaultGoalValue: 1, goalUnit: "BOOLEAN", defaultDays: ALL_DAYS, order: 3 },
      { slug: "estudar-idioma", namePt: "Estudar idioma", nameEn: "Study a language", emoji: "🌍", defaultGoalValue: 15, goalUnit: "MINUTES", defaultDays: WEEKDAYS, order: 4 },
    ],
  },
  {
    slug: "produtividade",
    namePt: "Produtividade",
    nameEn: "Productivity",
    order: 3,
    templates: [
      { slug: "foco-profundo", namePt: "Foco profundo", nameEn: "Deep focus", emoji: "🎯", defaultGoalValue: 60, goalUnit: "MINUTES", defaultDays: WEEKDAYS, order: 1 },
      { slug: "planejar-o-dia", namePt: "Planejar o dia", nameEn: "Plan the day", emoji: "🗓️", defaultGoalValue: 1, goalUnit: "BOOLEAN", defaultDays: WEEKDAYS, order: 2 },
    ],
  },
  {
    slug: "financas",
    namePt: "Finanças",
    nameEn: "Finance",
    order: 4,
    templates: [
      { slug: "registrar-gastos", namePt: "Registrar gastos", nameEn: "Track spending", emoji: "💰", defaultGoalValue: 1, goalUnit: "BOOLEAN", defaultDays: ALL_DAYS, order: 1 },
    ],
  },
];

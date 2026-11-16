export interface LandingDemoHabit {
  emoji: string;
  name: string;
  detail: string;
}

export interface LandingRow {
  id: "reminders" | "create" | "reward" | "streak" | "notes" | "theme";
  title: string;
  body: string;
}

export interface LandingStep {
  title: string;
  body: string;
}

export interface LandingAlso {
  title: string;
  body: string;
}

export interface LandingPreset {
  emoji: string;
  name: string;
  /** Unidade da meta ("min", "pág."). */
  unit: string;
  start: number;
  step: number;
}

/** Sete textos, de segunda (0) a domingo (6). */
export type Week = [string, string, string, string, string, string, string];

export interface LandingCopy {
  nav: { language: string; theme: string };
  hero: { title: string; subtitle: string };
  demo: {
    greeting: string;
    name: string;
    doneLabel: string;
    habitsTitle: string;
    hint: string;
    /** `{count}` é o número de dias. */
    streak: string;
    /** `{done}` e `{total}`. */
    progress: string;
    messages: { none: string; some: string; all: string };
    habits: LandingDemoHabit[];
  };
  stores: { appStore: string; playStore: string; appStoreLabel: string; playStoreLabel: string; soon: string };
  steps: { title: string; items: LandingStep[] };
  rows: LandingRow[];
  days: { short: Week; abbr: Week; full: Week };
  reminder: {
    app: string;
    when: string;
    title: string;
    body: string;
    actions: [string, string, string];
    /** Resultado de cada ação: concluir, adiar, pular. */
    results: [string, string, string];
    hint: string;
  };
  create: {
    presets: LandingPreset[];
    presetsLabel: string;
    goalLabel: string;
    daysLabel: string;
    everyDay: string;
    decrease: string;
    increase: string;
    hint: string;
  };
  reward: {
    giftLabel: string;
    /** Presentes de exemplo (emoji + nome). */
    gifts: { emoji: string; name: string }[];
    durationLabel: string;
    /** Opções de duração em dias. */
    durations: number[];
    /** `{n}` é o número de dias. */
    durationOption: string;
    cardTitle: string;
    /** `{run}` e `{total}`. */
    progress: string;
    /** `{n}` dias que faltam. */
    daysLeft: string;
    daysLeftOne: string;
    /** `{n}` é o número da tentativa. */
    restarted: string;
    doneTitle: string;
    /** `{gift}` é o presente. */
    doneSub: string;
    claim: string;
    claimed: string;
    completeDay: string;
    missDay: string;
    hint: string;
  };
  notes: {
    textLabel: string;
    placeholder: string;
    save: string;
    /** Anotações de exemplo, de quantos dias atrás. */
    seed: { daysAgo: number; text: string }[];
    hint: string;
  };
  streakDemo: {
    unit: string;
    weekLabel: string;
    startToday: string;
    keepGoing: string;
    milestonesTitle: string;
    /** `{target}` é a meta em dias. */
    milestone: string;
    /** `{n}` e `{target}`. */
    progress: string;
    hint: string;
  };
  themeDemo: {
    modeLabel: string;
    modes: { dark: string; light: string; system: string };
    accentTitle: string;
    /** Rótulo do botão de exemplo na prévia. */
    sample: string;
    /** `{n}` é a posição da cor (1 a 7). */
    accentLabel: string;
    hint: string;
  };
  also: { title: string; items: LandingAlso[] };
  privacy: { title: string; body: string; points: string[]; link: string };
  cta: { title: string; subtitle: string };
  footer: { privacy: string; terms: string; deletion: string; contact: string; rights: string };
}

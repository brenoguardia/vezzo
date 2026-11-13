export interface LandingDemoHabit {
  emoji: string;
  name: string;
  detail: string;
}

export interface LandingRow {
  id: "reminders" | "create" | "streak" | "theme";
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

import type { LandingCopy } from "./types";

export const landingPtBR: LandingCopy = {
  nav: { language: "Mudar idioma para inglês", theme: "Alternar tema claro e escuro" },
  hero: {
    title: "Rotina simples, todo dia.",
    subtitle:
      "Crie hábitos, receba lembretes na hora certa e acompanhe sua sequência. Marque como feito direto na notificação.",
  },
  demo: {
    greeting: "Hoje",
    name: "Olá, Ana",
    doneLabel: "feitos",
    habitsTitle: "Hábitos",
    hint: "Experimente: toque num hábito para marcar como feito.",
    streak: "Sequência de {count} dias",
    progress: "{done} de {total} hábitos feitos",
    messages: { none: "Comece por um hábito.", some: "Só mais um empurrãozinho.", all: "Dia completo. Até amanhã!" },
    habits: [
      { emoji: "💧", name: "Beber água", detail: "1,8 / 2,5 L" },
      { emoji: "🧘", name: "Meditar", detail: "10 min" },
      { emoji: "🏋️", name: "Treinar", detail: "30 min" },
      { emoji: "📚", name: "Ler", detail: "15 pág." },
      { emoji: "💰", name: "Registrar gastos", detail: "Todo dia" },
    ],
  },
  stores: {
    appStore: "App Store",
    playStore: "Google Play",
    appStoreLabel: "Baixar na",
    playStoreLabel: "Disponível no",
    soon: "Em breve",
  },
  steps: {
    title: "Como funciona",
    items: [
      { title: "Crie seus hábitos", body: "Em poucos toques, com meta e dias da semana." },
      { title: "Receba o lembrete", body: "Na hora certa, com ações direto na notificação." },
      { title: "Acompanhe a sequência", body: "Veja o dia, a semana e o histórico evoluírem." },
    ],
  },
  rows: [
    {
      id: "reminders",
      title: "Responda sem abrir o app",
      body: "O lembrete chega na hora certa. Conclua, adie 1 hora ou pule direto pela notificação.",
    },
    {
      id: "create",
      title: "Cada hábito do seu jeito",
      body: "Escolha emoji, meta e os dias da semana. Do copo d'água ao treino, o ritmo é seu.",
    },
    {
      id: "streak",
      title: "Veja a sequência crescer",
      body: "Conte os dias seguidos, acompanhe o resumo da semana e o histórico das últimas 4 semanas.",
    },
    {
      id: "theme",
      title: "Com a sua cara",
      body: "7 cores de destaque e tema claro, escuro ou automático. Toque numa cor e veja esta página mudar.",
    },
  ],
  days: {
    short: ["S", "T", "Q", "Q", "S", "S", "D"],
    abbr: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    full: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
  },
  reminder: {
    app: "Vezzo",
    when: "agora",
    title: "Hora de beber água",
    body: "Meta de hoje: 2,5 L. Você já bebeu 1,8 L.",
    actions: ["Concluir", "Adiar 1 h", "Pular"],
    results: ["Beber água concluído. Boa!", "Combinado: aviso de novo em 1 hora.", "Pulado hoje. Amanhã tem mais."],
    hint: "Toque numa ação, como na notificação de verdade.",
  },
  create: {
    presets: [
      { emoji: "🧘", name: "Meditar", unit: "min", start: 10, step: 5 },
      { emoji: "📚", name: "Ler", unit: "pág.", start: 15, step: 5 },
      { emoji: "🏋️", name: "Treinar", unit: "min", start: 30, step: 5 },
      { emoji: "💧", name: "Beber água", unit: "copos", start: 8, step: 1 },
    ],
    presetsLabel: "Hábito",
    goalLabel: "Meta",
    daysLabel: "Dias da semana",
    everyDay: "Todo dia",
    decrease: "Diminuir meta",
    increase: "Aumentar meta",
    hint: "Monte um hábito: escolha, ajuste a meta e os dias.",
  },
  streakDemo: {
    unit: "dias seguidos",
    weekLabel: "Esta semana",
    startToday: "Comece sua sequência hoje.",
    keepGoing: "Só mais um empurrãozinho.",
    milestonesTitle: "Próximas conquistas",
    milestone: "{target} dias",
    progress: "{n}/{target}",
    hint: "Toque nos dias da semana e veja a sequência mudar.",
  },
  themeDemo: {
    modeLabel: "Aparência",
    modes: { dark: "Escuro", light: "Claro", system: "Sistema" },
    accentTitle: "Cor de destaque",
    sample: "Concluir",
    accentLabel: "Cor de destaque {n}",
    hint: "Isto muda a página inteira, como no app.",
  },
  also: {
    title: "E também",
    items: [
      { title: "Funciona offline", body: "Marque sem internet. Tudo sincroniza quando a conexão voltar." },
      { title: "Para qualquer tela", body: "Layout de duas colunas em iPad e dobráveis." },
      { title: "Português e inglês", body: "O app acompanha o idioma do seu celular." },
    ],
  },
  privacy: {
    title: "Seus hábitos são só seus",
    body: "O Vezzo foi feito para ajudar, não para vigiar. Você controla os seus dados e pode excluir a conta quando quiser.",
    points: ["Sem anúncios", "Sem rastreamento entre apps", "Exclusão de conta a qualquer momento"],
    link: "Ler a Política de Privacidade",
  },
  cta: {
    title: "Comece hoje a sua sequência",
    subtitle: "Grátis, em português e inglês, para iPhone e Android.",
  },
  footer: {
    privacy: "Privacidade",
    terms: "Termos de Uso",
    deletion: "Excluir conta",
    contact: "Contato",
    rights: "Todos os direitos reservados.",
  },
};

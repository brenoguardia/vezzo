import type { LandingCopy } from "./types";

export const landingEn: LandingCopy = {
  nav: { language: "Switch language to Portuguese", theme: "Toggle light and dark theme" },
  hero: {
    title: "Simple routine, every day.",
    subtitle:
      "Create habits, get reminders at the right time and follow your streak. Mark things as done right from the notification.",
  },
  demo: {
    greeting: "Today",
    name: "Hi, Ana",
    doneLabel: "done",
    habitsTitle: "Habits",
    hint: "Try it: tap a habit to mark it as done.",
    streak: "{count}-day streak",
    progress: "{done} of {total} habits done",
    messages: { none: "Start with one habit.", some: "Just a little push.", all: "Day complete. See you tomorrow!" },
    habits: [
      { emoji: "💧", name: "Drink water", detail: "1.8 / 2.5 L" },
      { emoji: "🧘", name: "Meditate", detail: "10 min" },
      { emoji: "🏋️", name: "Work out", detail: "30 min" },
      { emoji: "📚", name: "Read", detail: "15 pages" },
      { emoji: "💰", name: "Log expenses", detail: "Every day" },
    ],
  },
  stores: {
    appStore: "App Store",
    playStore: "Google Play",
    appStoreLabel: "Download on the",
    playStoreLabel: "Get it on",
    soon: "Coming soon",
  },
  steps: {
    title: "How it works",
    items: [
      { title: "Create your habits", body: "In a few taps, with a goal and days of the week." },
      { title: "Get the reminder", body: "At the right time, with actions right in the notification." },
      { title: "Follow your streak", body: "Watch your day, week and history grow." },
    ],
  },
  rows: [
    {
      id: "reminders",
      title: "Answer without opening the app",
      body: "The reminder arrives at the right time. Complete, snooze for 1 hour or skip straight from the notification.",
    },
    {
      id: "create",
      title: "Every habit your way",
      body: "Pick an emoji, a goal and the days of the week. From a glass of water to a workout, the pace is yours.",
    },
    {
      id: "streak",
      title: "Watch your streak grow",
      body: "Count consecutive days, follow your weekly summary and the history of the last 4 weeks.",
    },
    {
      id: "theme",
      title: "Make it yours",
      body: "7 accent colors and light, dark or automatic theme. Tap a color and watch this page change.",
    },
  ],
  days: {
    short: ["M", "T", "W", "T", "F", "S", "S"],
    abbr: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    full: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  reminder: {
    app: "Vezzo",
    when: "now",
    title: "Time to drink water",
    body: "Today's goal: 2.5 L. You have had 1.8 L so far.",
    actions: ["Complete", "Snooze 1 h", "Skip"],
    results: ["Drink water done. Nice!", "Got it: reminding you again in 1 hour.", "Skipped today. More tomorrow."],
    hint: "Tap an action, just like on a real notification.",
  },
  create: {
    presets: [
      { emoji: "🧘", name: "Meditate", unit: "min", start: 10, step: 5 },
      { emoji: "📚", name: "Read", unit: "pages", start: 15, step: 5 },
      { emoji: "🏋️", name: "Work out", unit: "min", start: 30, step: 5 },
      { emoji: "💧", name: "Drink water", unit: "glasses", start: 8, step: 1 },
    ],
    presetsLabel: "Habit",
    goalLabel: "Goal",
    daysLabel: "Days of the week",
    everyDay: "Every day",
    decrease: "Decrease goal",
    increase: "Increase goal",
    hint: "Build a habit: pick one, adjust the goal and the days.",
  },
  streakDemo: {
    unit: "days in a row",
    weekLabel: "This week",
    startToday: "Start your streak today.",
    keepGoing: "Just a little push.",
    milestonesTitle: "Next milestones",
    milestone: "{target} days",
    progress: "{n}/{target}",
    hint: "Tap the days of the week and watch the streak change.",
  },
  themeDemo: {
    modeLabel: "Appearance",
    modes: { dark: "Dark", light: "Light", system: "System" },
    accentTitle: "Accent color",
    sample: "Complete",
    accentLabel: "Accent color {n}",
    hint: "This changes the whole page, just like in the app.",
  },
  also: {
    title: "Also",
    items: [
      { title: "Works offline", body: "Check things off without internet. Everything syncs when you are back online." },
      { title: "Built for any screen", body: "Two-column layout on iPad and foldables." },
      { title: "English and Portuguese", body: "The app follows your phone's language." },
    ],
  },
  privacy: {
    title: "Your habits are yours alone",
    body: "Vezzo is built to help, not to watch. You control your data and can delete your account whenever you want.",
    points: ["No ads", "No cross-app tracking", "Delete your account anytime"],
    link: "Read the Privacy Policy",
  },
  cta: {
    title: "Start your streak today",
    subtitle: "Free, in English and Portuguese, for iPhone and Android.",
  },
  footer: {
    privacy: "Privacy",
    terms: "Terms of Use",
    deletion: "Delete account",
    contact: "Contact",
    rights: "All rights reserved.",
  },
};

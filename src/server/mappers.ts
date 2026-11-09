import type { Habit, HabitLog, Profile } from "@prisma/client";
import type { HabitDto, LogDto, ProfileDto } from "@/shared/schemas";

export const toProfileDto = (p: Profile): ProfileDto => ({
  displayName: p.displayName,
  accent: p.accent,
  themeMode: p.themeMode,
  language: p.language === "en" ? "en" : "pt-BR",
  timezone: p.timezone,
  onboardingDone: p.onboardingDone,
  createdAt: p.createdAt.toISOString(),
});

export const toHabitDto = (h: Habit): HabitDto => ({
  id: h.id,
  templateId: h.templateId,
  name: h.name,
  emoji: h.emoji,
  goalValue: h.goalValue,
  goalUnit: h.goalUnit,
  days: h.days,
  reminders: h.reminders,
  quickActions: h.quickActions,
  order: h.order,
  archivedAt: h.archivedAt ? h.archivedAt.toISOString() : null,
  createdAt: h.createdAt.toISOString(),
});

export const toLogDto = (l: HabitLog): LogDto => ({
  id: l.id,
  habitId: l.habitId,
  date: l.date,
  value: l.value,
  status: l.status,
  source: l.source,
  completedAt: l.completedAt ? l.completedAt.toISOString() : null,
  clientId: l.clientId,
});

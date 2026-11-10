import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { setLocale } from "@/i18n";
import type { HabitDto, ProfileDto } from "@/shared/schemas";
import { useHabitsStore } from "@/store/habits";
import { useProfileStore } from "@/store/profile";
import { cancelAllReminders, rescheduleAll } from "./reschedule";

jest.mock("expo-notifications", () => ({
  SchedulableTriggerInputTypes: { WEEKLY: "weekly", TIME_INTERVAL: "timeInterval" },
  AndroidImportance: { DEFAULT: 3 },
  getPermissionsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(async () => {}),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => {}),
  scheduleNotificationAsync: jest.fn(),
  setNotificationCategoryAsync: jest.fn(async () => ({})),
  setNotificationChannelAsync: jest.fn(async () => ({})),
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "00000000-0000-4000-8000-000000000001" }));
jest.mock("@/api/logs", () => ({ postLogBatch: jest.fn() }));
jest.mock("@/auth/client", () => ({ authClient: {} }));

const N = Notifications as unknown as {
  getPermissionsAsync: jest.Mock<() => Promise<{ granted: boolean }>>;
  getAllScheduledNotificationsAsync: jest.Mock<() => Promise<unknown[]>>;
  cancelScheduledNotificationAsync: jest.Mock<(id: string) => Promise<void>>;
  cancelAllScheduledNotificationsAsync: jest.Mock<() => Promise<void>>;
  scheduleNotificationAsync: jest.Mock<(arg: unknown) => Promise<string>>;
  setNotificationCategoryAsync: jest.Mock<(...a: unknown[]) => Promise<unknown>>;
};

const habit = (id: string, over: Partial<HabitDto> = {}): HabitDto => ({
  id,
  templateId: null,
  name: "Ler",
  emoji: "📖",
  goalValue: 15,
  goalUnit: "PAGES",
  days: [0, 6],
  reminders: ["07:30"],
  quickActions: true,
  order: 0,
  archivedAt: null,
  createdAt: "2026-10-01T00:00:00.000Z",
  ...over,
});

let n = 0;
beforeEach(() => {
  jest.clearAllMocks();
  setLocale("pt-BR");
  Platform.OS = "ios";
  n = 0;
  N.getPermissionsAsync.mockResolvedValue({ granted: true });
  N.getAllScheduledNotificationsAsync.mockResolvedValue([]);
  N.scheduleNotificationAsync.mockImplementation(async () => `id-${++n}`);
  useProfileStore.setState({ profile: { displayName: "Ana", timezone: "UTC", language: "pt-BR" } as ProfileDto });
  useHabitsStore.getState().clear();
  useHabitsStore.getState().hydrate([habit("a".repeat(24))], []);
});

describe("rescheduleAll", () => {
  it("agenda um gatilho semanal por dia, com weekday do Expo, categoria e dados", async () => {
    await rescheduleAll();
    expect(N.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    const calls = N.scheduleNotificationAsync.mock.calls.map(
      (c) => c[0] as { content: Record<string, unknown>; trigger: Record<string, unknown> },
    );
    expect(calls.map((c) => c.trigger.weekday).sort()).toEqual([1, 2]); // segunda=2, domingo=1
    expect(calls[0]?.trigger).toMatchObject({ type: "weekly", hour: 7, minute: 30 });
    expect(calls[0]?.content).toMatchObject({
      title: "Hora de ler",
      categoryIdentifier: "HABIT_REMINDER",
      data: { kind: "reminder", habitId: "a".repeat(24) },
    });
    expect(String(calls[0]?.content.body)).toContain("Ana");
  });

  it("guarda os ids por hábito", async () => {
    await rescheduleAll();
    expect(useHabitsStore.getState().scheduledIds["a".repeat(24)]).toHaveLength(2);
  });

  it("quickActions desligado: sem categoria", async () => {
    useHabitsStore.getState().hydrate([habit("a".repeat(24), { quickActions: false })], []);
    await rescheduleAll();
    const first = N.scheduleNotificationAsync.mock.calls[0]?.[0] as { content: { categoryIdentifier?: string } };
    expect(first.content.categoryIdentifier).toBeUndefined();
  });

  it("cancela só os lembretes semanais antigos, preservando adiamentos", async () => {
    N.getAllScheduledNotificationsAsync.mockResolvedValue([
      { identifier: "old", content: { data: { kind: "reminder" } } },
      { identifier: "snz", content: { data: { kind: "snooze" } } },
    ]);
    await rescheduleAll();
    expect(N.cancelScheduledNotificationAsync.mock.calls.map((c) => c[0])).toEqual(["old"]);
  });

  it("sem permissão: cancela e não agenda", async () => {
    N.getPermissionsAsync.mockResolvedValue({ granted: false });
    await rescheduleAll();
    expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("hábito arquivado não gera lembrete", async () => {
    useHabitsStore.getState().hydrate([habit("a".repeat(24), { archivedAt: "2026-11-01T00:00:00.000Z" })], []);
    await rescheduleAll();
    expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("chamadas simultâneas são serializadas (não duplicam)", async () => {
    await Promise.all([rescheduleAll(), rescheduleAll()]);
    expect(N.scheduleNotificationAsync).toHaveBeenCalledTimes(4); // 2 execuções × 2 dias, em sequência
  });
});

describe("cancelAllReminders", () => {
  it("cancela tudo", async () => {
    await cancelAllReminders();
    expect(N.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });
});

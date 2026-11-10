import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { logKey } from "@/shared/logs";
import type { HabitDto } from "@/shared/schemas";
import { useHabitsStore } from "@/store/habits";
import { useSnoozeStore } from "@/store/snooze";
import { useSyncStore } from "@/store/sync";
import { handleNotificationResponse } from "./actions";

jest.mock("expo-notifications", () => ({
  DEFAULT_ACTION_IDENTIFIER: "expo.modules.notifications.actions.DEFAULT",
  SchedulableTriggerInputTypes: { TIME_INTERVAL: "timeInterval", WEEKLY: "weekly" },
  scheduleNotificationAsync: jest.fn(async () => "snooze-id"),
  cancelScheduledNotificationAsync: jest.fn(async () => {}),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
}));
jest.mock("expo-crypto", () => {
  let n = 0;
  return { randomUUID: () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}` };
});
jest.mock("@/api/logs", () => ({ postLogBatch: jest.fn(() => new Promise(() => {})) }));
jest.mock("@/auth/client", () => ({ authClient: {} }));

const N = Notifications as unknown as {
  scheduleNotificationAsync: jest.Mock<(arg: unknown) => Promise<string>>;
  cancelScheduledNotificationAsync: jest.Mock<(id: string) => Promise<void>>;
  getAllScheduledNotificationsAsync: jest.Mock<() => Promise<unknown[]>>;
};

const ID = "507f1f77bcf86cd799439011";
const NOW = new Date("2026-11-10T15:00:00Z");
const TODAY = "2026-11-10";

const habit: HabitDto = {
  id: ID,
  templateId: null,
  name: "Ler",
  emoji: "📖",
  goalValue: 15,
  goalUnit: "PAGES",
  days: [0, 1, 2, 3, 4, 5, 6],
  reminders: ["08:00"],
  quickActions: true,
  order: 0,
  archivedAt: null,
  createdAt: "2026-10-01T00:00:00.000Z",
};

let seq = 0;
const response = (actionIdentifier: string, habitId: unknown = ID) =>
  ({
    actionIdentifier,
    notification: {
      date: 1_000_000 + ++seq,
      request: {
        identifier: `n${seq}`,
        content: { title: "Hora de ler", body: "corpo", data: { kind: "reminder", habitId } },
      },
    },
  }) as unknown as Notifications.NotificationResponse;

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  useHabitsStore.getState().clear();
  useHabitsStore.getState().hydrate([habit], []);
  useSnoozeStore.getState().clear();
  useSyncStore.setState({ queue: [] });
  N.getAllScheduledNotificationsAsync.mockResolvedValue([]);
});

describe("COMPLETE", () => {
  it("grava DONE com a meta cheia, origem NOTIFICATION, e enfileira para sincronizar", async () => {
    expect(await handleNotificationResponse(response("COMPLETE"), undefined, NOW)).toBe("completed");
    expect(useHabitsStore.getState().logs[logKey(ID, TODAY)]).toMatchObject({ status: "DONE", value: 15 });
    expect(useSyncStore.getState().queue[0]).toMatchObject({
      habitId: ID,
      date: TODAY,
      status: "DONE",
      source: "NOTIFICATION",
    });
  });

  it("cancela adiamentos pendentes do mesmo hábito, e só deles", async () => {
    N.getAllScheduledNotificationsAsync.mockResolvedValue([
      { identifier: "s1", content: { data: { kind: "snooze", habitId: ID } } },
      { identifier: "s2", content: { data: { kind: "snooze", habitId: "outro" } } },
      { identifier: "w1", content: { data: { kind: "reminder", habitId: ID } } },
    ]);
    await handleNotificationResponse(response("COMPLETE"), undefined, NOW);
    expect(N.cancelScheduledNotificationAsync.mock.calls.map((c) => c[0])).toEqual(["s1"]);
  });
});

describe("SKIP", () => {
  it("grava SKIPPED", async () => {
    expect(await handleNotificationResponse(response("SKIP"), undefined, NOW)).toBe("skipped");
    expect(useHabitsStore.getState().logs[logKey(ID, TODAY)]?.status).toBe("SKIPPED");
    expect(useSyncStore.getState().queue.at(-1)).toMatchObject({ status: "SKIPPED", source: "NOTIFICATION" });
  });
});

describe("SNOOZE_1H", () => {
  it("agenda daqui a 60 min com a mesma categoria e conta o adiamento", async () => {
    expect(await handleNotificationResponse(response("SNOOZE_1H"), undefined, NOW)).toBe("snoozed");
    const arg = N.scheduleNotificationAsync.mock.calls[0]?.[0] as {
      content: { categoryIdentifier: string; data: { kind: string } };
      trigger: { seconds: number };
    };
    expect(arg.trigger.seconds).toBe(3600);
    expect(arg.content.categoryIdentifier).toBe("HABIT_REMINDER");
    expect(arg.content.data.kind).toBe("snooze");
    expect(useSnoozeStore.getState().counts[ID]).toEqual({ date: TODAY, count: 1 });
  });

  it("recusa o 4º adiamento do dia", async () => {
    for (let i = 0; i < 3; i++) await handleNotificationResponse(response("SNOOZE_1H"), undefined, NOW);
    expect(await handleNotificationResponse(response("SNOOZE_1H"), undefined, NOW)).toBe("snooze-limit");
    expect(N.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
  });

  it("no dia seguinte volta a permitir", async () => {
    for (let i = 0; i < 3; i++) await handleNotificationResponse(response("SNOOZE_1H"), undefined, NOW);
    const next = new Date("2026-11-11T15:00:00Z");
    expect(await handleNotificationResponse(response("SNOOZE_1H"), undefined, next)).toBe("snoozed");
  });
});

describe("toque no corpo", () => {
  it("abre o hábito", async () => {
    const open = jest.fn();
    expect(await handleNotificationResponse(response("expo.modules.notifications.actions.DEFAULT"), open, NOW)).toBe(
      "open",
    );
    expect(open).toHaveBeenCalledWith(ID);
  });
});

describe("robustez", () => {
  it("ignora payload sem habitId ou hábito desconhecido", async () => {
    expect(await handleNotificationResponse(response("COMPLETE", null), undefined, NOW)).toBe("ignored");
    expect(await handleNotificationResponse(response("COMPLETE", "ffffffffffffffffffffffff"), undefined, NOW)).toBe(
      "ignored",
    );
    expect(useSyncStore.getState().queue).toHaveLength(0);
  });

  it("não processa duas vezes a mesma resposta (listener + task + launch)", async () => {
    const r = response("SNOOZE_1H");
    expect(await handleNotificationResponse(r, undefined, NOW)).toBe("snoozed");
    expect(await handleNotificationResponse(r, undefined, NOW)).toBe("ignored");
    expect(N.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });
});

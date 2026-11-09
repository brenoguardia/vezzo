import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { requestReminderPermission } from "./notifications";

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
}));


const mockN = Notifications as unknown as {
  getPermissionsAsync: jest.Mock<() => Promise<{ granted: boolean; canAskAgain: boolean }>>;
  requestPermissionsAsync: jest.Mock<() => Promise<{ granted: boolean }>>;
  setNotificationChannelAsync: jest.Mock<(...a: unknown[]) => Promise<unknown>>;
};

beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = "ios";
});

describe("requestReminderPermission", () => {
  it("já concedida: não pergunta de novo", async () => {
    mockN.getPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });
    expect(await requestReminderPermission()).toBe("granted");
    expect(mockN.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("pede ao sistema e devolve granted/denied", async () => {
    mockN.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
    mockN.requestPermissionsAsync.mockResolvedValueOnce({ granted: true });
    expect(await requestReminderPermission()).toBe("granted");
    mockN.requestPermissionsAsync.mockResolvedValueOnce({ granted: false });
    expect(await requestReminderPermission()).toBe("denied");
  });

  it("negada em definitivo: não mostra o prompt", async () => {
    mockN.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false });
    expect(await requestReminderPermission()).toBe("denied");
    expect(mockN.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("Android cria o canal `habits` antes de pedir", async () => {
    Platform.OS = "android";
    mockN.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
    mockN.requestPermissionsAsync.mockResolvedValue({ granted: true });
    await requestReminderPermission();
    expect(mockN.setNotificationChannelAsync).toHaveBeenCalledWith("habits", expect.objectContaining({ importance: 3 }));
    expect(mockN.setNotificationChannelAsync.mock.invocationCallOrder[0]).toBeLessThan(
      mockN.requestPermissionsAsync.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("erro do módulo vira denied, nunca quebra o onboarding", async () => {
    mockN.getPermissionsAsync.mockRejectedValue(new Error("boom"));
    expect(await requestReminderPermission()).toBe("denied");
  });
});

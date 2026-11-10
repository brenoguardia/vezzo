import { describe, expect, it, jest } from "@jest/globals";
import * as Sentry from "@sentry/react-native";
import { initMonitoring, monitoringEnabled, reportError, scrub, withMonitoring } from "./monitoring";

jest.mock("@sentry/react-native", () => ({ init: jest.fn(), wrap: jest.fn(), captureException: jest.fn() }));

describe("sem DSN", () => {
  it("fica desligado e não chama o SDK", () => {
    expect(monitoringEnabled).toBe(false);
    initMonitoring();
    reportError(new Error("x"));
    const Root = () => null;
    expect(withMonitoring(Root)).toBe(Root);
    expect(Sentry.init).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.wrap).not.toHaveBeenCalled();
  });
});

describe("scrub", () => {
  it("remove cabeçalhos sensíveis, cookies, corpo e usuário", () => {
    const event = scrub({
      type: undefined,
      user: { id: "u1", email: "a@b.c" },
      request: {
        headers: { Authorization: "Bearer x", Cookie: "s=1", "Content-Type": "application/json", "X-Token": "t" },
        cookies: { s: "1" },
        data: { password: "hunter2" },
      },
    });
    expect(event.user).toBeUndefined();
    expect(event.request?.cookies).toBeUndefined();
    expect(event.request?.data).toBeUndefined();
    expect(event.request?.headers).toEqual({ "Content-Type": "application/json" });
  });
});

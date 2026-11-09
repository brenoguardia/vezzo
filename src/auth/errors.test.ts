import { describe, expect, it } from "@jest/globals";
import { authErrorKey, readToken } from "./errors";

describe("authErrorKey", () => {
  it.each([
    [{ code: "INVALID_EMAIL_OR_PASSWORD", status: 401 }, "invalidCredentials"],
    [{ code: "EMAIL_NOT_VERIFIED", status: 403 }, "emailNotVerified"],
    [{ status: 403 }, "emailNotVerified"],
    [{ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", status: 422 }, "emailTaken"],
    [{ code: "INVALID_TOKEN", status: 400 }, "invalidToken"],
    [{ status: 429 }, "tooManyRequests"],
    [{ status: 0 }, "network"],
    [{ status: 500, message: "boom" }, "generic"],
    [null, "generic"],
  ] as const)("%j -> %s", (error, key) => {
    expect(authErrorKey(error)).toBe(key);
  });
});

describe("readToken", () => {
  it("lê string, array e vazio", () => {
    expect(readToken("abc")).toBe("abc");
    expect(readToken(["abc", "x"])).toBe("abc");
    expect(readToken("  ")).toBeNull();
    expect(readToken(undefined)).toBeNull();
  });
});

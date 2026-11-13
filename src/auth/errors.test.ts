import { describe, expect, it } from "@jest/globals";
import { authErrorKey, readToken, refineNetworkKey } from "./errors";

describe("authErrorKey", () => {
  it.each([
    [{ code: "INVALID_EMAIL_OR_PASSWORD", status: 401 }, "invalidCredentials"],
    [{ code: "EMAIL_NOT_VERIFIED", status: 403 }, "emailNotVerified"],
    [{ status: 403 }, "emailNotVerified"],
    [{ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", status: 422 }, "emailTaken"],
    [{ code: "INVALID_TOKEN", status: 400 }, "invalidToken"],
    [{ status: 429 }, "tooManyRequests"],
    [{ status: 0 }, "network"],
    [{ status: 502 }, "server"],
    [{ status: 503 }, "server"],
    [{ status: 504 }, "server"],
    [{ status: 500, message: "boom" }, "generic"],
    [null, "generic"],
  ] as const)("%j -> %s", (error, key) => {
    expect(authErrorKey(error)).toBe(key);
  });
});

describe("refineNetworkKey", () => {
  it("sem rede no aparelho mantém `network`", () => {
    expect(refineNetworkKey("network", false)).toBe("network");
  });
  it("com rede, falha de conexão vira `server` (servidor inacessível)", () => {
    expect(refineNetworkKey("network", true)).toBe("server");
    expect(refineNetworkKey("network", null)).toBe("server");
  });
  it("não altera as demais chaves", () => {
    expect(refineNetworkKey("generic", true)).toBe("generic");
    expect(refineNetworkKey("invalidCredentials", false)).toBe("invalidCredentials");
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

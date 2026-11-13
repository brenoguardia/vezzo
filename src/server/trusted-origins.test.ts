import { betterAuth } from "better-auth";
import { describe, expect, it } from "vitest";

import { buildTrustedOrigins } from "./trusted-origins";

const BASE_URL = "https://api.example.test";

function createAuth(nodeEnv?: string) {
  return betterAuth({
    baseURL: BASE_URL,
    secret: "test-secret-test-secret-test-secret-123",
    trustedOrigins: buildTrustedOrigins(nodeEnv),
    // Better Auth desliga a checagem de origem em ambiente de teste; aqui ela precisa estar ativa.
    advanced: { disableOriginCheck: false },
    socialProviders: { google: { clientId: "id", clientSecret: "secret" } },
  });
}

async function signInGoogle(callbackURL: string, nodeEnv?: string) {
  const request = new Request(`${BASE_URL}/api/auth/sign-in/social`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE_URL },
    body: JSON.stringify({ provider: "google", callbackURL }),
  });
  return createAuth(nodeEnv).handler(request);
}

describe("trustedOrigins do Better Auth", () => {
  it.each(["vezzo:///", "vezzo://reset-password", "vezzo-preview:///", "vezzo-development:///"])(
    "aceita o callbackURL %s",
    async (callbackURL) => {
      const response = await signInGoogle(callbackURL);
      expect(response.status).toBe(200);
    },
  );

  it("rejeita scheme desconhecido", async () => {
    const response = await signInGoogle("evil:///");
    expect(response.status).toBe(403);
  });

  it("não confia em exp:// fora de desenvolvimento", async () => {
    expect((await signInGoogle("exp://192.168.0.10:8081/--/")).status).toBe(403);
    expect((await signInGoogle("exp://192.168.0.10:8081/--/", "development")).status).toBe(200);
  });
});

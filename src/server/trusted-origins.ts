// Schemes dos apps (ver `app.config.ts`). Fixos de propósito: no servidor `expoConfig` não reflete o app instalado.
export const APP_SCHEMES = ["vezzo", "vezzo-preview", "vezzo-development"] as const;

export function buildTrustedOrigins(nodeEnv: string | undefined): string[] {
  return [
    ...APP_SCHEMES.map((scheme) => `${scheme}://`),

    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(nodeEnv === "development"
      ? [
          "exp://", // Trust all Expo URLs (prefix matching)
          "exp://**", // Trust all Expo URLs (wildcard matching)
          "exp://192.168.*.*:*/**", // Trust 192.168.x.x IP range with any port and path
        ]
      : []),
  ];
}

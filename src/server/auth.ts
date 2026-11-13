import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import * as Constants from "expo-constants";

import { createAuthCallbacks } from "./auth-callbacks";
import { prisma } from "./db";
import { sendEmail } from "./email/send";

const APP_SCHEME = Constants.default.expoConfig?.scheme;

const callbacks = createAuthCallbacks({ db: prisma, sendEmail });
const betterAuthUrl = process.env.BETTER_AUTH_URL;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  baseURL: betterAuthUrl,
  secret: betterAuthSecret,
  trustedOrigins: [
    `${APP_SCHEME}://`,

    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(process.env.NODE_ENV === "development"
      ? [
          "exp://", // Trust all Expo URLs (prefix matching)
          "exp://**", // Trust all Expo URLs (wildcard matching)
          "exp://192.168.*.*:*/**", // Trust 192.168.x.x IP range with any port and path
        ]
      : []),
  ],
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 30,
    sendResetPassword: callbacks.sendResetPassword,
    onPasswordReset: callbacks.onPasswordReset,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: callbacks.sendVerificationEmail,
  },
  socialProviders: {
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user, context) => callbacks.afterUserCreate(user, context?.request),
      },
    },
  },
});

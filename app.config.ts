import type { ConfigContext, ExpoConfig } from "expo/config";

const PROFILE_KEYS = ["development", "preview", "production"] as const;

type ProfileKey = (typeof PROFILE_KEYS)[number];

const APP_NAME = "Vezzo" as const;
const APP_SLUG = "vezzo" as const;
const APP_SCHEMA = "vezzo" as const;
const APP_VERSION = "1.0.0" as const;
const APP_IDENTIFIER = "com.itbuilder.vezzo" as const;

const APP_CONFIG = {
  name: APP_NAME,
  slug: APP_SLUG,
  scheme: APP_SCHEMA,
  version: APP_VERSION,
  identifier: APP_IDENTIFIER,
  ambient: process.env.APP_ENV || "development",
  appOrigin: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8081",
} as const;

let logged = false;

export default ({ config }: ConfigContext): ExpoConfig => {
  if (!logged) {
    console.log(`🔥 Build app with environment => ${APP_CONFIG.ambient}`);
    logged = true;
  }

  const { name, slug, scheme, icon, ios, android, origin } = getDynamicConfig();

  return {
    ...config,
    name,
    slug,
    scheme,
    icon,
    version: "1.0.0",
    orientation: "default",
    userInterfaceStyle: "automatic",
    ios,
    android,
    web: {
      output: "server",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-secure-store",
      "expo-localization",
      [
        "expo-router",
        {
          origin,
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          backgroundColor: "#BADC4E",
          dark: {
            image: "./assets/images/splash-icon-dark.png",
            backgroundColor: "#000000",
          },
          imageWidth: 228,
        },
      ],
      [
        "expo-notifications",
        {
          color: "#b9d94c",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {
        asyncRoutes: {
          web: true,
        },
      },
      eas: {
        projectId: "f41d4ba9-b62c-43f7-8e69-5368439dc475",
      },
    },
    updates: {
      url: "https://u.expo.dev/f41d4ba9-b62c-43f7-8e69-5368439dc475",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  };
};

function getDynamicConfig() {
  const useCaseProfile: Record<ProfileKey, ExpoConfig & { origin: string }> = {
    development: {
      name: `${APP_CONFIG.name} (Dev)`,
      slug: APP_CONFIG.slug,
      scheme: `${APP_CONFIG.scheme}-${APP_CONFIG.ambient}`,
      icon: "./assets/images/icon.png",
      ios: {
        bundleIdentifier: `${APP_CONFIG.identifier}.${APP_CONFIG.ambient}`,
        icon: "./assets/expo.icon",
        supportsTablet: false,
        usesAppleSignIn: false,
      },
      android: {
        adaptiveIcon: {
          backgroundColor: "#E6F4FE",
          foregroundImage: "./assets/images/android-icon-foreground.png",
          backgroundImage: "./assets/images/android-icon-background.png",
          monochromeImage: "./assets/images/android-icon-monochrome.png",
        },
        predictiveBackGestureEnabled: false,
        package: `${APP_CONFIG.identifier}.${APP_CONFIG.ambient}`,
      },
      origin: APP_CONFIG.appOrigin,
    },
    preview: {
      name: `${APP_CONFIG.name} (Prev)`,
      slug: APP_CONFIG.slug,
      scheme: `${APP_CONFIG.scheme}-${APP_CONFIG.ambient}`,
      icon: "./assets/images/icon.png",
      ios: {
        bundleIdentifier: `${APP_CONFIG.identifier}.${APP_CONFIG.ambient}`,
        icon: "./assets/expo.icon",
        supportsTablet: false,
        usesAppleSignIn: false,
      },
      android: {
        adaptiveIcon: {
          backgroundColor: "#E6F4FE",
          foregroundImage: "./assets/images/android-icon-foreground.png",
          backgroundImage: "./assets/images/android-icon-background.png",
          monochromeImage: "./assets/images/android-icon-monochrome.png",
        },
        predictiveBackGestureEnabled: false,
        package: `${APP_CONFIG.identifier}.${APP_CONFIG.ambient}`,
      },
      origin: APP_CONFIG.appOrigin,
    },
    production: {
      name: APP_CONFIG.name,
      slug: APP_CONFIG.slug,
      scheme: APP_CONFIG.scheme,
      icon: "./assets/images/icon.png",
      ios: {
        bundleIdentifier: APP_CONFIG.identifier,
        icon: "./assets/expo.icon",
        supportsTablet: false,
        usesAppleSignIn: false,
      },
      android: {
        adaptiveIcon: {
          backgroundColor: "#E6F4FE",
          foregroundImage: "./assets/images/android-icon-foreground.png",
          backgroundImage: "./assets/images/android-icon-background.png",
          monochromeImage: "./assets/images/android-icon-monochrome.png",
        },
        predictiveBackGestureEnabled: false,
        package: APP_CONFIG.identifier,
      },
      origin: APP_CONFIG.appOrigin,
    },
  };

  if (!isProfileKey(APP_CONFIG.ambient)) {
    throw new Error(`APP_ENV inválido: "${APP_CONFIG.ambient}". Valores aceitos: ${PROFILE_KEYS.join(", ")}.`);
  }

  return useCaseProfile[APP_CONFIG.ambient];
}

function isProfileKey(value: string): value is ProfileKey {
  return (PROFILE_KEYS as readonly string[]).includes(value);
}

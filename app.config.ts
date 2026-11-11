import { ConfigContext, ExpoConfig } from "expo/config";

let logged = false;

export default ({ config }: ConfigContext): ExpoConfig => {
  const ambient = process.env.NODE_ENV;
  const origin = process.env.EXPO_PUBLIC_API_URL;

  if (!logged) {
    console.log(`🔥 Build app with environment => ${ambient}`);
    logged = true;
  }

  return {
    ...config,
    name: "Vezzo",
    slug: "vezzo",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/icon.png",
    scheme: "vezzo",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      icon: "./assets/expo.icon",
      bundleIdentifier: "com.itbuilder.vezzo",
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
      package: "com.itbuilder.vezzo",
    },
    web: {
      output: "server",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
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
      "expo-secure-store",
      "expo-localization",
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
  };
};

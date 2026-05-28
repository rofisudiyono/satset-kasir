const fs = require("node:fs");
const path = require("node:path");

const APP_ENV =
  process.env.APP_ENV === "prod"
    ? "production"
    : process.env.APP_ENV || process.env.EXPO_PUBLIC_APP_ENV || "development";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) return acc;
      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      acc[key] = value;
      return acc;
    }, {});
}

const envFromFile = parseEnvFile(path.join(__dirname, `.env.${APP_ENV}`));
for (const [key, value] of Object.entries(envFromFile)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}

const profiles = {
  staging: {
    name: "Satset Kasir Staging",
    slug: "satset",
    scheme: "satset-kasir-staging",
    androidPackage: "com.sisatset.kasir.staging",
    iosBundleIdentifier: "com.sisatset.kasir.staging",
    oneSignalMode: "development",
  },
  production: {
    name: "Satset Kasir",
    slug: "satset",
    scheme: "sat-set",
    androidPackage: "com.sisatset.kasir",
    iosBundleIdentifier: "com.sisatset.kasir",
    oneSignalMode: "production",
  },
};

const profile = profiles[APP_ENV] ?? profiles.staging;
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "https://api2.arashy.web.id";
const oneSignalAppId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ?? "";
const easProjectId = "3eb2941c-0277-491c-9b99-7b175d41d822";

module.exports = {
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME || profile.name,
    slug: "satset",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/satset_1024.png",
    scheme: process.env.EXPO_PUBLIC_APP_SCHEME || profile.scheme,
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/images/satset_1024.png",
      bundleIdentifier:
        process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER ||
        profile.iosBundleIdentifier,
      supportsTablet: true,
    },
    android: {
      softwareKeyboardLayoutMode: "resize",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        backgroundImage: "./assets/images/android-icon-background.png",
        foregroundImage: "./assets/images/satset_1024.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      package:
        process.env.EXPO_PUBLIC_ANDROID_PACKAGE || profile.androidPackage,
      permissions: [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.POST_NOTIFICATIONS",
      ],
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      [
        "onesignal-expo-plugin",
        {
          mode: process.env.EXPO_PUBLIC_ONESIGNAL_MODE || profile.oneSignalMode,
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "Izinkan $(PRODUCT_NAME) mengakses kamera untuk memindai barcode produk.",
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#FFFFFF",
          android: {
            image: "./assets/images/satset_1024.png",
            imageWidth: 200,
          },
          ios: {
            image: "./assets/images/satset_1024.png",
            imageWidth: 200,
          },
        },
      ],
      "expo-router",
      "expo-sharing",
    ],
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/3eb2941c-0277-491c-9b99-7b175d41d822",
      checkAutomatically: "ON_LOAD",
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      appEnv: APP_ENV,
      apiUrl,
      oneSignalAppId,
      eas: {
        projectId: easProjectId,
      },
    },
  },
};

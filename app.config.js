const fs = require("node:fs");
const path = require("node:path");

const baseConfig = require("./app.json").expo;

const APP_ENV = process.env.APP_ENV === "prod"
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
  development: {
    name: "Satset Kasir Dev",
    slug: "satset-kasir-dev",
    scheme: "satset-kasir-dev",
    androidPackage: "id.satset.kasir.dev",
    iosBundleIdentifier: "id.web.satset.kasir.dev",
    oneSignalMode: "development",
  },
  staging: {
    name: "Satset Kasir Staging",
    slug: "satset-kasir-staging",
    scheme: "satset-kasir-staging",
    androidPackage: "id.satset.kasir.staging",
    iosBundleIdentifier: "id.web.satset.kasir.staging",
    oneSignalMode: "development",
  },
  production: {
    name: "Satset Kasir",
    slug: "satset-kasir",
    scheme: "sat-set",
    androidPackage: "id.satset.kasir",
    iosBundleIdentifier: "id.web.satset.kasir",
    oneSignalMode: "production",
  },
};

const profile = profiles[APP_ENV] ?? profiles.development;
const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? baseConfig.extra?.apiUrl ?? "http://127.0.0.1:3000";
const oneSignalAppId =
  process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ?? baseConfig.extra?.oneSignalAppId ?? "";

module.exports = {
  expo: {
    ...baseConfig,
    name: process.env.EXPO_PUBLIC_APP_NAME || profile.name,
    slug: process.env.EXPO_PUBLIC_APP_SLUG || profile.slug,
    scheme: process.env.EXPO_PUBLIC_APP_SCHEME || profile.scheme,
    android: {
      ...baseConfig.android,
      package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE || profile.androidPackage,
    },
    ios: {
      ...baseConfig.ios,
      bundleIdentifier:
        process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER || profile.iosBundleIdentifier,
    },
    extra: {
      ...baseConfig.extra,
      appEnv: APP_ENV,
      apiUrl,
      oneSignalAppId,
    },
    plugins: baseConfig.plugins.map((plugin) => {
      if (Array.isArray(plugin) && plugin[0] === "onesignal-expo-plugin") {
        return [
          plugin[0],
          {
            ...plugin[1],
            mode: process.env.EXPO_PUBLIC_ONESIGNAL_MODE || profile.oneSignalMode,
          },
        ];
      }
      return plugin;
    }),
  },
};

const { getDefaultConfig } = require("expo/metro-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.platforms = ["ios", "android", "native", "web"];

config.resolver = {
  ...config.resolver,
  unstable_conditionNames: ["browser", "require", "react-native"],
};
config.resolver.unstable_enablePackageExports = false;

// Support .mjs files (needed by Tamagui)
config.resolver.sourceExts.push("mjs");

const reanimatedConfig = wrapWithReanimatedMetroConfig(config);

module.exports = reanimatedConfig;

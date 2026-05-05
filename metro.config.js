const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Support .mjs files (needed by Tamagui)
config.resolver.sourceExts.push("mjs");

module.exports = config;

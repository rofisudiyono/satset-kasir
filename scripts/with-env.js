#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const [, , envName, command, ...args] = process.argv;

if (!envName || !command) {
  console.error("Usage: node scripts/with-env.js <development|staging|production|prod> <command> [...args]");
  process.exit(1);
}

const normalizedEnv = envName === "prod" ? "production" : envName;
const projectRoot = path.resolve(__dirname, "..");
const envFile = path.join(projectRoot, `.env.${normalizedEnv}`);

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

const fileEnv = parseEnvFile(envFile);
const child = spawn(command, args, {
  cwd: projectRoot,
  env: {
    ...process.env,
    ...fileEnv,
    APP_ENV: normalizedEnv,
    EXPO_PUBLIC_APP_ENV: normalizedEnv,
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

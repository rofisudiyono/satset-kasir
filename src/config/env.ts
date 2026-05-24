import Constants from "expo-constants";
import { Platform } from "react-native";

type ExpoExtra = {
  appEnv?: string;
  apiUrl?: string;
  oneSignalAppId?: string;
};

const expoExtra = Constants.expoConfig?.extra as ExpoExtra | undefined;

export const APP_ENV =
  process.env.EXPO_PUBLIC_APP_ENV ?? expoExtra?.appEnv ?? "development";

/**
 * Android emulator tidak bisa mengakses `localhost` / `127.0.0.1` di mesin dev.
 * `10.0.2.2` adalah alias standar ke host loopback dari emulator.
 */
function resolveApiBaseUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, "");
  if (
    __DEV__ &&
    Platform.OS === "android" &&
    (trimmed.includes("localhost") || trimmed.includes("127.0.0.1"))
  ) {
    return trimmed
      .replace("://localhost", "://10.0.2.2")
      .replace("://127.0.0.1", "://10.0.2.2");
  }
  return trimmed;
}

/**
 * Base URL API Satset (tanpa trailing slash).
 * Set `EXPO_PUBLIC_API_URL` di `.env` atau `app.json` → `expo.extra.apiUrl`.
 */
export const API_BASE_URL = resolveApiBaseUrl(
  process.env.EXPO_PUBLIC_API_URL ??
    expoExtra?.apiUrl ??
    "http://127.0.0.1:3000",
);

/** OneSignal App ID untuk push kasir. Kosong = runtime push dilewati. */
export const ONESIGNAL_APP_ID =
  process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ??
  expoExtra?.oneSignalAppId ??
  "";

/**
 * Jika `true`, mengisi `posOrders` dengan data demo saat storage kosong (untuk UI dev/demo).
 * Produksi: biarkan `false` agar tidak ada order palsu di MMKV.
 */
export const USE_POS_DEMO_SEED =
  process.env.EXPO_PUBLIC_POS_DEMO_SEED === "true";

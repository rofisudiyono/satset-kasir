import Constants from "expo-constants";

/**
 * Base URL API Satset (tanpa trailing slash).
 * Set `EXPO_PUBLIC_API_URL` di `.env` atau `app.json` → `expo.extra.apiUrl`.
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  "http://127.0.0.1:3000"
).replace(/\/$/, "");

/** OneSignal App ID untuk push kasir. Kosong = runtime push dilewati. */
export const ONESIGNAL_APP_ID =
  process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ??
  (Constants.expoConfig?.extra as { oneSignalAppId?: string } | undefined)
    ?.oneSignalAppId ??
  "";

/**
 * Jika `true`, mengisi `posOrders` dengan data demo saat storage kosong (untuk UI dev/demo).
 * Produksi: biarkan `false` agar tidak ada order palsu di MMKV.
 */
export const USE_POS_DEMO_SEED =
  process.env.EXPO_PUBLIC_POS_DEMO_SEED === "true";

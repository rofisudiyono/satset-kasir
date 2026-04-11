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

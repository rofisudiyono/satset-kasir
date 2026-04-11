import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getDefaultStore } from "jotai";

import { API_BASE_URL } from "@/config/env";
import { sessionAtom } from "@/features/auth/store/auth.store";

import type { ApiErrorBody, AuthSession } from "./types";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const store = getDefaultStore();
  const session = store.get(sessionAtom);
  const refreshToken = session?.refreshToken;
  if (!refreshToken) return null;

  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });

      const prev = store.get(sessionAtom);
      if (!prev) return null;
      const next: AuthSession = {
        ...prev,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      store.set(sessionAtom, next);
      return data.accessToken;
    } catch {
      store.set(sessionAtom, null);
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

api.interceptors.request.use((config) => {
  const session = getDefaultStore().get(sessionAtom);
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes("/auth/refresh") ||
      original.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    const access = await refreshAccessToken();
    if (access) {
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Terjadi kesalahan"): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const msg = error.response?.data?.message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

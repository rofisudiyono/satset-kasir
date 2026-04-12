import { api } from "./client";

import type { AuthUser } from "./types";

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", { refreshToken });
}

import { getDefaultStore, useAtom } from "jotai";
import { useCallback } from "react";

import { sessionAtom } from "@/features/auth/store/auth.store";
import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import { logoutRequest } from "@/lib/api/auth.api";
import type { AuthSession } from "@/lib/api/types";
import { queryClient } from "@/providers/query-client";

export const useAuth = () => {
  const [session, setSession] = useAtom(sessionAtom);

  const logout = useCallback(async () => {
    const store = getDefaultStore();
    const refreshToken = store.get(sessionAtom)?.refreshToken;
    try {
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } catch {
      // Tetap bersihkan sesi lokal walau revoke gagal
    } finally {
      store.set(sessionAtom, null);
      store.set(isShiftStartedAtom, false);
      store.set(shiftDataAtom, null);
      void queryClient.clear();
    }
  }, []);

  const loginWithSession = useCallback((next: AuthSession) => {
    setSession(next);
  }, [setSession]);

  return {
    session,
    user: session?.user ?? null,
    isLoggedIn: !!session?.accessToken,
    loginWithSession,
    logout,
  };
};

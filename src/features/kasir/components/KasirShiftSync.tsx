import { useSetAtom } from "jotai";
import React, { useEffect } from "react";

import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import { buildShiftSyncState, shouldUpdateShiftState } from "@/features/shift/utils/syncShiftState";
import { useActiveShiftQuery } from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import { appStore } from "@/store/storage";

/**
 * Menyelaraskan shift lokal dengan GET /api/kasir/shifts/active setelah login.
 */
export function KasirShiftSync() {
  const { isLoggedIn } = useAuth();
  const { data, isFetched } = useActiveShiftQuery(isLoggedIn);
  const setIsShiftStarted = useSetAtom(isShiftStartedAtom);
  const setShiftData = useSetAtom(shiftDataAtom);

  useEffect(() => {
    if (!isLoggedIn || !isFetched) return;

    const nextState = buildShiftSyncState(data ?? null);
    const currentIsShiftStarted = appStore.get(isShiftStartedAtom);
    const currentShiftData = appStore.get(shiftDataAtom);

    if (
      !shouldUpdateShiftState({
        currentIsShiftStarted,
        nextIsShiftStarted: nextState.isShiftStarted,
        currentShiftData,
        nextShiftData: nextState.shiftData,
      })
    ) {
      return;
    }

    setIsShiftStarted(nextState.isShiftStarted);
    setShiftData(nextState.shiftData);
  }, [isLoggedIn, isFetched, data, setIsShiftStarted, setShiftData]);

  return null;
}

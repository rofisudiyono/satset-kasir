import { useAtom, useSetAtom } from "jotai";
import React, { useEffect } from "react";

import { useAuth } from "@/lib/auth";
import { kasirShiftToShiftData } from "@/features/shift/utils/mapShift";
import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import { useActiveShiftQuery } from "@/hooks/api/use-kasir-api";

/**
 * Menyelaraskan shift lokal dengan GET /api/kasir/shifts/active setelah login.
 */
export function KasirShiftSync() {
  const { isLoggedIn } = useAuth();
  const { data, isFetched } = useActiveShiftQuery(isLoggedIn);
  const [, setIsShiftStarted] = useAtom(isShiftStartedAtom);
  const setShiftData = useSetAtom(shiftDataAtom);

  useEffect(() => {
    if (!isLoggedIn || !isFetched) return;
    if (data) {
      setIsShiftStarted(true);
      setShiftData(kasirShiftToShiftData(data));
    } else {
      setIsShiftStarted(false);
      setShiftData(null);
    }
  }, [isLoggedIn, isFetched, data, setIsShiftStarted, setShiftData]);

  return null;
}

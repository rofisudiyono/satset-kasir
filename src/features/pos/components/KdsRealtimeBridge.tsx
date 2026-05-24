import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { useAuth } from "@/lib/auth";

import {
  applyKdsQueuedEventsAtom,
  ensurePosSeedDataAtom,
  expireWebOrdersAtom,
} from "../store/pos.store";

const KDS_POLL_INTERVAL_MS = 5_000;

export function KdsRealtimeBridge() {
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const applyQueuedEvents = useSetAtom(applyKdsQueuedEventsAtom);
  const ensureSeedData = useSetAtom(ensurePosSeedDataAtom);
  const expireWebOrders = useSetAtom(expireWebOrdersAtom);

  const active = Boolean(isLoggedIn && isShiftStarted);

  useEffect(() => {
    if (!active) return;

    ensureSeedData();
    expireWebOrders();
    applyQueuedEvents();

    const timer = setInterval(() => {
      expireWebOrders();
      applyQueuedEvents();
    }, KDS_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [active, applyQueuedEvents, ensureSeedData, expireWebOrders]);

  return null;
}

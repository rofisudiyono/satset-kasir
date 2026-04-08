import { useSetAtom } from "jotai";
import { useEffect } from "react";

import {
  applyKdsQueuedEventsAtom,
  ensurePosSeedDataAtom,
  expireWebOrdersAtom,
} from "../store/pos.store";

const KDS_POLL_INTERVAL_MS = 5_000;

export function KdsRealtimeBridge() {
  const applyQueuedEvents = useSetAtom(applyKdsQueuedEventsAtom);
  const ensureSeedData = useSetAtom(ensurePosSeedDataAtom);
  const expireWebOrders = useSetAtom(expireWebOrdersAtom);

  useEffect(() => {
    ensureSeedData();
    expireWebOrders();
    applyQueuedEvents();

    const timer = setInterval(() => {
      expireWebOrders();
      applyQueuedEvents();
    }, KDS_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [applyQueuedEvents, ensureSeedData, expireWebOrders]);

  return null;
}

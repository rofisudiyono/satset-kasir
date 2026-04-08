import { atom } from "jotai";

import { atomWithMMKV } from "@/store/storage";

import { posSeedOrders } from "../api/pos.data";
import type { KdsFulfillmentEvent, KdsNotificationItem } from "../kds.types";
import type { PosFulfillmentStatus, PosOrder } from "../pos.types";
import { expireStaleWebOrders } from "../pos.utils";

export const posOrdersAtom = atomWithMMKV<PosOrder[]>("posOrders", []);
export const posSeededAtom = atomWithMMKV("posOrdersSeeded", false);

export const kdsEventQueueAtom = atomWithMMKV<KdsFulfillmentEvent[]>(
  "kdsEventQueue",
  [],
);

export const kdsNotificationsAtom = atomWithMMKV<KdsNotificationItem[]>(
  "kdsNotifications",
  [],
);

export const lastKdsSyncAtAtom = atomWithMMKV<number | null>(
  "lastKdsSyncAt",
  null,
);

export const enqueueKdsFulfillmentEventAtom = atom(
  null,
  (_get, set, event: KdsFulfillmentEvent) => {
    set(kdsEventQueueAtom, (prev) => [...prev, event]);
  },
);

export const dismissKdsNotificationAtom = atom(
  null,
  (_get, set, notificationId: string) => {
    set(kdsNotificationsAtom, (prev) =>
      prev.filter((item) => item.id !== notificationId),
    );
  },
);

export const applyKdsQueuedEventsAtom = atom(null, (get, set) => {
  const events = get(kdsEventQueueAtom);
  if (events.length === 0) return 0;

  const orders = get(posOrdersAtom);
  const existingReadyOrderIds = new Set(
    orders
      .filter((order) => order.fulfillment === "READY")
      .map((order) => order.id),
  );
  const notifications: KdsNotificationItem[] = [];

  const nextOrders = orders.map((order) => {
    const latestEvent = [...events]
      .reverse()
      .find((event) => event.orderId === order.id);

    if (!latestEvent) return order;

    if (
      latestEvent.fulfillment === "READY" &&
      order.fulfillment !== "READY" &&
      !existingReadyOrderIds.has(order.id)
    ) {
      notifications.push({
        id: `kds-ready-${order.id}-${latestEvent.createdAt}`,
        orderId: order.id,
        title: "Pesanan siap antar",
        message: `${order.id} sudah READY dari dapur.`,
        createdAt: latestEvent.createdAt,
      });
    }

    return {
      ...order,
      fulfillment: latestEvent.fulfillment,
    };
  });

  if (notifications.length > 0) {
    set(kdsNotificationsAtom, (prev) => [...notifications, ...prev].slice(0, 5));
  }

  set(posOrdersAtom, nextOrders);
  set(kdsEventQueueAtom, []);
  set(lastKdsSyncAtAtom, Date.now());

  return events.length;
});

export const ensurePosSeedDataAtom = atom(null, (get, set) => {
  const seeded = get(posSeededAtom);
  const orders = get(posOrdersAtom);

  if (seeded || orders.length > 0) return false;

  set(posOrdersAtom, posSeedOrders);
  set(posSeededAtom, true);
  return true;
});

export const expireWebOrdersAtom = atom(null, (get, set) => {
  const orders = get(posOrdersAtom);
  set(posOrdersAtom, expireStaleWebOrders(orders));
});

export const markOrderServedAtom = atom(null, (get, set, orderId: string) => {
  const orders = get(posOrdersAtom);
  set(posOrdersAtom, updatePosOrderFulfillment(orders, orderId, "SERVED"));
});

export function updatePosOrderFulfillment(
  orders: PosOrder[],
  orderId: string,
  fulfillment: PosFulfillmentStatus,
) {
  return orders.map((order) =>
    order.id === orderId ? { ...order, fulfillment } : order,
  );
}

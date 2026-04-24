import type { Href } from "expo-router";

type NotificationPayload = Record<string, unknown>;

function readString(data: NotificationPayload, key: string): string | null {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function routeFromNotificationPayload(data: NotificationPayload): Href | null {
  const eventType = readString(data, "eventType");
  const orderId = readString(data, "orderId");

  if (eventType === "REFUND_VOID_APPROVAL_RESOLVED" && orderId) {
    return `/mobile/order-detail/${encodeURIComponent(orderId)}` as Href;
  }

  if (
    eventType === "PRINTER_OFFLINE" ||
    eventType === "PRINTER_RECOVERED" ||
    eventType === "OFFLINE_SYNC_FAILED"
  ) {
    return "/bluetooth-printer" as Href;
  }

  if (eventType === "PAYMENT_PENDING_BRANCH_ATTENTION") {
    return "/mobile/pesanan-web" as Href;
  }

  return null;
}

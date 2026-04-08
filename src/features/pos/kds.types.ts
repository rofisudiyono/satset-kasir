import type { PosFulfillmentStatus } from "./pos.types";

export interface KdsFulfillmentEvent {
  id: string;
  orderId: string;
  fulfillment: PosFulfillmentStatus;
  createdAt: number;
  source?: "KDS_POLLING" | "KDS_SSE" | "KDS_WS" | "MANUAL";
}

export interface KdsNotificationItem {
  id: string;
  orderId: string;
  title: string;
  message: string;
  createdAt: number;
}

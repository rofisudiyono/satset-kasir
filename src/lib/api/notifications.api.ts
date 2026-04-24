import { Platform } from "react-native";

import { api } from "./client";

export type NotificationPlatform = "web" | "ios" | "android";

export type RegisterSubscriptionBody = {
  onesignalPlayerId: string;
  externalUserId?: string;
  platform: NotificationPlatform;
  app: "dashboard" | "kasir" | "kds";
  deviceName?: string;
};

export type DeviceHeartbeatBody = {
  deviceId: string;
  deviceName?: string;
  app: "dashboard" | "kasir" | "kds";
  printerConnected?: boolean;
  printerName?: string | null;
  syncQueueCount?: number;
  lastSyncError?: string | null;
};

export async function registerNotificationSubscription(
  body: RegisterSubscriptionBody,
): Promise<{ id: string; message: string }> {
  const { data } = await api.post<{ id: string; message: string }>(
    "/notifications/subscriptions",
    body,
  );
  return data;
}

export async function sendDeviceHeartbeat(body: DeviceHeartbeatBody): Promise<void> {
  await api.post("/notifications/device-heartbeat", body);
}

export function getNotificationPlatform(): NotificationPlatform {
  if (Platform.OS === "ios") return "ios";
  return "android";
}

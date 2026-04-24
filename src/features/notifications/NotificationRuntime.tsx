import * as Device from "expo-device";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { OneSignal, type NotificationClickEvent } from "react-native-onesignal";

import {
  getNotificationPlatform,
  registerNotificationSubscription,
  sendDeviceHeartbeat,
} from "@/lib/api/notifications.api";
import { sessionAtom } from "@/features/auth/store/auth.store";
import { ONESIGNAL_APP_ID } from "@/config/env";
import { bluetoothPrinterManager, type PrinterState } from "@/utils/bluetooth-printer";
import { storage } from "@/store/storage";

import { routeFromNotificationPayload } from "./deep-links";
import { getOfflineSyncSnapshot } from "./offline-sync-reporter";

const DEVICE_ID_KEY = "notifications.deviceId";
const HEARTBEAT_INTERVAL_MS = 5 * 60_000;

function getDeviceId() {
  const existing = storage.getString(DEVICE_ID_KEY);
  if (existing) return existing;
  const next = `kasir-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  storage.set(DEVICE_ID_KEY, next);
  return next;
}

function getDeviceName() {
  return Device.deviceName ?? Device.modelName ?? `${Platform.OS} kasir`;
}

function getPrinterPayload(state: PrinterState) {
  return {
    printerConnected: state.connected,
    printerName: state.printer?.name ?? null,
  };
}

export function NotificationRuntime() {
  const session = useAtomValue(sessionAtom);
  const router = useRouter();
  const initializedRef = useRef(false);
  const registeredPlayerRef = useRef<string | null>(null);
  const printerStateRef = useRef<PrinterState>(bluetoothPrinterManager.getState());
  const appId = ONESIGNAL_APP_ID;

  useEffect(() => {
    const unsubscribe = bluetoothPrinterManager.subscribe((state) => {
      printerStateRef.current = state;
      if (session?.user) {
        void sendHeartbeat(state);
      }
    });
    return unsubscribe;
  }, [session?.user]);

  async function registerCurrentSubscription() {
    if (!session?.user || !appId) return;
    const playerId = await OneSignal.User.pushSubscription.getIdAsync();
    if (!playerId || registeredPlayerRef.current === playerId) return;

    await registerNotificationSubscription({
      onesignalPlayerId: playerId,
      externalUserId: session.user.id,
      platform: getNotificationPlatform(),
      app: "kasir",
      deviceName: getDeviceName(),
    });
    registeredPlayerRef.current = playerId;
  }

  async function sendHeartbeat(state = printerStateRef.current) {
    if (!session?.user) return;
    const offline = getOfflineSyncSnapshot();
    await sendDeviceHeartbeat({
      deviceId: getDeviceId(),
      deviceName: getDeviceName(),
      app: "kasir",
      ...getPrinterPayload(state),
      syncQueueCount: offline.queueCount,
      lastSyncError: offline.lastError,
    });
  }

  useEffect(() => {
    if (!session?.user || !appId) {
      registeredPlayerRef.current = null;
      if (initializedRef.current) OneSignal.logout();
      return;
    }

    if (!initializedRef.current) {
      OneSignal.initialize(appId);
      initializedRef.current = true;
    }

    OneSignal.login(session.user.id);
    void OneSignal.Notifications.requestPermission(true);
    void registerCurrentSubscription();
    void sendHeartbeat();

    const interval = setInterval(() => void sendHeartbeat(), HEARTBEAT_INTERVAL_MS);
    const handleSubscriptionChange = () => {
      void registerCurrentSubscription();
    };
    OneSignal.User.pushSubscription.addEventListener(
      "change",
      handleSubscriptionChange,
    );

    return () => {
      clearInterval(interval);
      OneSignal.User.pushSubscription.removeEventListener(
        "change",
        handleSubscriptionChange,
      );
    };
  }, [appId, session?.user?.id]);

  useEffect(() => {
    const handleClick = (event: NotificationClickEvent) => {
      const data = event.notification.additionalData;
      const route =
        data && typeof data === "object"
          ? routeFromNotificationPayload(data as Record<string, unknown>)
          : null;
      if (route) router.push(route);
    };

    OneSignal.Notifications.addEventListener("click", handleClick);
    return () => {
      OneSignal.Notifications.removeEventListener("click", handleClick);
    };
  }, [router]);

  return null;
}

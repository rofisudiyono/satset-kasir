import { Ionicons } from "@expo/vector-icons";
import { useAtomValue, useSetAtom } from "jotai";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TextBodySm, TextCaption } from "@/components/atoms/Typography";
import {
  ColorBase,
  ColorNeutral,
  ColorPrimary,
  ColorSuccess,
} from "@/themes/Colors";

import {
  dismissKdsNotificationAtom,
  kdsNotificationsAtom,
} from "../store/pos.store";

export function KdsReadyNotifications() {
  const notifications = useAtomValue(kdsNotificationsAtom);
  const dismissNotification = useSetAtom(dismissKdsNotificationAtom);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const timers = notifications.map((item) =>
      setTimeout(() => dismissNotification(item.id), 6000),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [dismissNotification, notifications]);

  if (notifications.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { top: insets.top + 12 }]}
    >
      {notifications.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons
              name="checkmark-done-circle"
              size={18}
              color={ColorSuccess.success600}
            />
          </View>

          <View style={styles.content}>
            <TextBodySm fontWeight="700" color={ColorPrimary.primary700}>
              {item.title}
            </TextBodySm>
            <TextCaption color="$colorSecondary">{item.message}</TextCaption>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => dismissNotification(item.id)}
            style={styles.closeButton}
          >
            <Ionicons
              name="close-outline"
              size={18}
              color={ColorNeutral.neutral500}
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    left: 16,
    zIndex: 1200,
    gap: 8,
    alignItems: "flex-end",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: ColorBase.white,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ColorSuccess.success200,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

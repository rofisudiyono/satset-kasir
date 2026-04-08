import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useCallback } from "react";
import { Platform, useColorScheme, View } from "react-native";
import { Text } from "tamagui";

import { SideNav } from "@/components/layout/SideNav";
import { TAB_ICONS, TAB_LABELS } from "@/config/navigation";
import { useDeviceLayout } from "@/hooks/useDeviceLayout";
import { useAuth } from "@/lib/auth";
import { ColorBase, ColorNeutral, ColorPrimary } from "@/themes/Colors";

export default function TabsLayout() {
  const { isLoggedIn } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const { showSidebarNav } = useDeviceLayout();

  const screenOptions = useCallback(
    ({ route }: { route: { name: string } }) => {
      const phoneTabBarStyle = {
        backgroundColor: isDark ? ColorNeutral.neutral900 : ColorBase.white,
        borderTopColor: isDark
          ? ColorNeutral.neutral700
          : ColorNeutral.neutral200,
        borderTopWidth: 1,
        height: Platform.OS === "ios" ? 84 : 64,
        paddingTop: 8,
        paddingBottom: Platform.OS === "ios" ? 24 : 8,
      };

      return {
        headerShown: false,
        tabBarIcon: ({ focused }: { focused: boolean }) => {
          if (showSidebarNav) return null;
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={22}
              color={focused ? ColorPrimary.primary600 : ColorNeutral.neutral400}
            />
          );
        },
        tabBarLabel: ({ focused }: { focused: boolean }) => {
          if (showSidebarNav) return null;
          return (
            <Text
              fontFamily="$body"
              fontSize={10}
              fontWeight={focused ? "700" : "400"}
              color={focused ? "$primary" : "$colorSecondary"}
              marginBottom={Platform.OS === "ios" ? 0 : 4}
            >
              {TAB_LABELS[route.name] ?? route.name}
            </Text>
          );
        },
        tabBarStyle: showSidebarNav
          ? { display: "none" as const }
          : phoneTabBarStyle,
        tabBarActiveTintColor: ColorPrimary.primary600,
        tabBarInactiveTintColor: isDark
          ? ColorNeutral.neutral400
          : ColorNeutral.neutral500,
      };
    },
    [isDark, showSidebarNav],
  );

  if (!isLoggedIn) return <Redirect href="/login" />;

  const tabs = (
    <Tabs
      screenOptions={screenOptions}
      tabBar={showSidebarNav ? () => null : undefined}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transaksi" />
      <Tabs.Screen name="inventori" />
      <Tabs.Screen name="pengaturan" />
    </Tabs>
  );

  if (showSidebarNav) {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <SideNav />
        <View style={{ flex: 1 }}>{tabs}</View>
      </View>
    );
  }

  return tabs;
}

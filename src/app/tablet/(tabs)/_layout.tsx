import { Redirect, Tabs } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";

import { TopNavHeader } from "@/components/layout/TopNavHeader";
import { Colors } from "@/config/theme";
import { useAuth } from "@/lib/auth";
import { ColorBase, ColorNeutral, ColorPrimary } from "@/themes/Colors";

export default function TabletTabsLayout() {
  const { isLoggedIn } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const screenOptions = useCallback(
    () => ({
      headerShown: false,
      tabBarIcon: () => null,
      tabBarLabel: () => null,
      tabBarStyle: { display: "none" as const },
      tabBarActiveTintColor: ColorPrimary.primary600,
      tabBarInactiveTintColor: isDark
        ? ColorNeutral.neutral400
        : ColorNeutral.neutral500,
    }),
    [isDark],
  );

  if (!isLoggedIn) return <Redirect href="/tablet/login" />;

  return (
    <View style={styles.container}>
      <TopNavHeader />
      <View style={styles.content}>
        <Tabs screenOptions={screenOptions} tabBar={() => null}>
          <Tabs.Screen name="pesanan-web" />
          <Tabs.Screen name="input-manual" />
          <Tabs.Screen name="riwayat" />
          <Tabs.Screen name="siap-antar" />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundElement,
  },
  content: {
    flex: 1,
    backgroundColor: "#F6F3EE",
  },
});

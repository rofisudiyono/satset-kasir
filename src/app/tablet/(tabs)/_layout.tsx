import { Redirect, Tabs } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { TopNavHeader } from "@/components/layout/TopNavHeader";
import { Colors } from "@/config/theme";
import { useAuth } from "@/lib/auth";
import { ColorNeutral } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

export default function TabletTabsLayout() {
  const { isLoggedIn } = useAuth();

  const screenOptions = useCallback(
    () => ({
      headerShown: false,
      tabBarIcon: () => null,
      tabBarLabel: () => null,
      tabBarStyle: { display: "none" as const },
      tabBarActiveTintColor: BrandColors.green,
      tabBarInactiveTintColor: ColorNeutral.neutral500,
    }),
    [],
  );

  if (!isLoggedIn) return <Redirect href={"/tablet/login" as never} />;

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
    backgroundColor: Colors.backgroundElement,
  },
  content: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
});

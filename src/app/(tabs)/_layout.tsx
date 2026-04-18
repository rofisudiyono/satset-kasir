import { Redirect, Tabs } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { TopNavHeader } from "@/components/layout/TopNavHeader";
import { useAuth } from "@/lib/auth";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSurface } from "@/themes/Colors";

export default function TabsLayout() {
  const { isLoggedIn } = useAuth();

  const screenOptions = useCallback(
    ({ route }: { route: { name: string } }) => {
      return {
        headerShown: false,
        tabBarIcon: () => null,
        tabBarLabel: () => null,
        tabBarStyle: { display: "none" as const },
        tabBarActiveTintColor: ColorPrimary.primary600,
        tabBarInactiveTintColor: ColorNeutral.neutral500,
      };
    },
    [],
  );

  if (!isLoggedIn) return <Redirect href="/login" />;

  return (
    <View style={styles.container}>
      <TopNavHeader />
      <View style={styles.content}>
        <Tabs screenOptions={screenOptions} tabBar={() => null}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="transaksi" />
          <Tabs.Screen name="pengaturan" />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorSurface.canvas,
  },
  content: {
    flex: 1,
    backgroundColor: ColorSurface.canvas,
  },
});

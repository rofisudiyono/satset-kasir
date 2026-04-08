import { Redirect, Tabs } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";

import { TopNavHeader } from "@/components/layout/TopNavHeader";
import { useAuth } from "@/lib/auth";
import { ColorBase, ColorNeutral, ColorPrimary } from "@/themes/Colors";

export default function TabsLayout() {
  const { isLoggedIn } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const screenOptions = useCallback(
    ({ route }: { route: { name: string } }) => {
      return {
        headerShown: false,
        tabBarIcon: () => null,
        tabBarLabel: () => null,
        tabBarStyle: { display: "none" as const },
        tabBarActiveTintColor: ColorPrimary.primary600,
        tabBarInactiveTintColor: isDark
          ? ColorNeutral.neutral400
          : ColorNeutral.neutral500,
      };
    },
    [isDark],
  );

  if (!isLoggedIn) return <Redirect href="/login" />;

  return (
    <View style={styles.container}>
      <TopNavHeader />
      <View style={styles.content}>
        <Tabs screenOptions={screenOptions} tabBar={() => null}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="transaksi" />
          <Tabs.Screen name="inventori" />
          <Tabs.Screen name="pengaturan" />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  content: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
});

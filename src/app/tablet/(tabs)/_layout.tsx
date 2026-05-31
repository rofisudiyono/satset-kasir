import { Redirect, Tabs } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { TopNavHeader } from "@/components/layout/TopNavHeader";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { useTenantInfoQuery } from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import { ColorNeutral } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

export default function TabletTabsLayout() {
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const { data: tenantInfo } = useTenantInfoQuery(Boolean(isLoggedIn && isShiftStarted));
  const isPostPay = tenantInfo?.defaultPaymentTiming === "POSTPAY";

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
          <Tabs.Screen name="tagihan-aktif" options={{ href: isPostPay ? undefined : null }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
  content: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs, useFocusEffect, usePathname, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React from "react";
import { Alert, BackHandler, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { useTenantInfoQuery } from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import { getHomeRoute } from "@/lib/routing/device-routes";
import { ColorNeutral } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

function getTabIcon(
  routeName: string,
  focused: boolean,
): keyof typeof Ionicons.glyphMap {
  switch (routeName) {
    case "pesanan-web":
      return focused ? "globe" : "globe-outline";
    case "input-manual":
      return focused ? "create" : "create-outline";
    case "siap-antar":
      return focused ? "bag-check" : "bag-check-outline";
    case "tagihan-aktif":
      return focused ? "receipt" : "receipt-outline";
    case "riwayat":
      return focused ? "time" : "time-outline";
    case "setting":
      return focused ? "settings" : "settings-outline";
    default:
      return focused ? "ellipse" : "ellipse-outline";
  }
}

function TabIcon({
  routeName,
  focused,
  color,
}: {
  routeName: string;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={[styles.tabIconPill, focused && styles.tabIconPillActive]}>
      <Ionicons name={getTabIcon(routeName, focused)} size={22} color={color} />
    </View>
  );
}

export default function MobileTabsLayout() {
  const { isLoggedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const { data: tenantInfo } = useTenantInfoQuery(Boolean(isLoggedIn && isShiftStarted));
  const isPostPay = tenantInfo?.defaultPaymentTiming === "POSTPAY";

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (!isLoggedIn) return false;

          if (pathname !== getHomeRoute(false)) {
            router.replace(getHomeRoute(false) as never);
            return true;
          }

          Alert.alert(
            "Tutup aplikasi?",
            isShiftStarted
              ? "Shift masih aktif. Aplikasi akan ditutup, tetapi shift tetap berjalan sampai kas ditutup."
              : "Aplikasi kasir akan ditutup.",
            [
              { text: "Batal", style: "cancel" },
              {
                text: "Tutup",
                style: "destructive",
                onPress: () => BackHandler.exitApp(),
              },
            ],
          );
          return true;
        },
      );

      return () => subscription.remove();
    }, [isLoggedIn, isShiftStarted, pathname, router]),
  );

  if (!isLoggedIn) return <Redirect href={"/mobile/login" as never} />;

  const tabBarHeight = 64 + Math.max(insets.bottom, 12);

  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: BrandColors.green,
          tabBarInactiveTintColor: ColorNeutral.neutral400,
          sceneStyle: {
            paddingTop: insets.top,
            backgroundColor: BrandColors.canvas,
          },
          tabBarStyle: {
            backgroundColor: BrandColors.surface,
            borderTopWidth: 0,
            height: tabBarHeight,
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 12),
            elevation: 16,
            shadowColor: BrandColors.deep,
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 18,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "700",
            marginTop: 2,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabIcon routeName={route.name} focused={focused} color={color} />
          ),
        })}
      >
        <Tabs.Screen
          name="pesanan-web"
          options={{ title: "Pesanan Web", href: isPostPay ? null : undefined }}
        />
        <Tabs.Screen name="input-manual" options={{ title: "Input Manual" }} />
        <Tabs.Screen name="siap-antar" options={{ title: "Siap Antar" }} />
        <Tabs.Screen name="tagihan-aktif" options={{ title: "Tagihan" }} />
        <Tabs.Screen name="riwayat" options={{ title: "Riwayat" }} />
        <Tabs.Screen name="setting" options={{ title: "Setting" }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabIconPill: {
    width: 48,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconPillActive: {
    backgroundColor: BrandColors.tint,
  },
});

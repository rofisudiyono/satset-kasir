import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs, useFocusEffect, usePathname, useRouter } from "expo-router";
import React from "react";
import { BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { getHomeRoute } from "@/lib/routing/device-routes";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSurface } from "@/themes/Colors";

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
    case "riwayat":
      return focused ? "time" : "time-outline";
    case "setting":
      return focused ? "settings" : "settings-outline";
    default:
      return focused ? "ellipse" : "ellipse-outline";
  }
}

export default function MobileTabsLayout() {
  const { isLoggedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();

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

          return false;
        },
      );

      return () => subscription.remove();
    }, [isLoggedIn, pathname, router]),
  );

  if (!isLoggedIn) return <Redirect href="/mobile/login" />;

  return (
    <>
      <StatusBar
        style="dark"
        translucent
        backgroundColor={ColorSurface.canvas}
      />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: ColorPrimary.primary600,
          tabBarInactiveTintColor: ColorNeutral.neutral500,
          sceneStyle: {
            paddingTop: insets.top,
            backgroundColor: ColorSurface.canvas,
          },
          tabBarStyle: {
            backgroundColor: ColorBase.white,
            borderTopColor: ColorSurface.border,
            height: 62 + Math.max(insets.bottom, 10),
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 10),
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
          },
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={getTabIcon(route.name, focused)}
              size={size}
              color={color}
            />
          ),
        })}
      >
        <Tabs.Screen
          name="pesanan-web"
          options={{ title: "Pesanan Web" }}
        />
        <Tabs.Screen
          name="input-manual"
          options={{ title: "Input Manual" }}
        />
        <Tabs.Screen
          name="siap-antar"
          options={{ title: "Siap Antar" }}
        />
        <Tabs.Screen
          name="riwayat"
          options={{ title: "Riwayat" }}
        />
        <Tabs.Screen
          name="setting"
          options={{ title: "Setting" }}
        />
      </Tabs>
    </>
  );
}

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { Provider as JotaiProvider } from "jotai";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { TamaguiProvider } from "tamagui";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OrientationController } from "@/components/responsive/OrientationController";
import { appStore } from "@/store/storage";
import { KasirShiftSync } from "@/features/kasir/components/KasirShiftSync";
import { KdsReadyNotifications } from "@/features/pos/components/KdsReadyNotifications";
import { KdsRealtimeBridge } from "@/features/pos/components/KdsRealtimeBridge";
import { NotificationRuntime } from "@/features/notifications/NotificationRuntime";
import { QueryProvider } from "@/providers/QueryProvider";
import { DeviceProfileProvider } from "@/providers/DeviceProfileProvider";
import { tamaguiConfig } from "../../tamagui.config";

export default function RootLayout() {
  useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return (
    <ErrorBoundary>
      <JotaiProvider store={appStore}>
        <QueryProvider>
          <DeviceProfileProvider>
            <TamaguiProvider
              config={tamaguiConfig}
              defaultTheme="light"
            >
              <ThemeProvider value={DefaultTheme}>
                <StatusBar style="light" translucent backgroundColor="transparent" />
                <OrientationController />
                <AnimatedSplashOverlay />
                <KdsRealtimeBridge />
                <KdsReadyNotifications />
                <NotificationRuntime />
                <KasirShiftSync />
                <Slot />
              </ThemeProvider>
            </TamaguiProvider>
          </DeviceProfileProvider>
        </QueryProvider>
      </JotaiProvider>
    </ErrorBoundary>
  );
}

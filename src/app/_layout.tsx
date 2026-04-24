import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
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
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
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

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { Provider as JotaiProvider } from "jotai";
import React from "react";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KdsReadyNotifications } from "@/features/pos/components/KdsReadyNotifications";
import { KdsRealtimeBridge } from "@/features/pos/components/KdsRealtimeBridge";
import { tamaguiConfig } from "../../tamagui.config";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  return (
    <ErrorBoundary>
      <JotaiProvider>
        <TamaguiProvider
          config={tamaguiConfig}
          defaultTheme={colorScheme === "dark" ? "dark" : "light"}
        >
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <AnimatedSplashOverlay />
            <KdsRealtimeBridge />
            <KdsReadyNotifications />
            <Slot />
          </ThemeProvider>
        </TamaguiProvider>
      </JotaiProvider>
    </ErrorBoundary>
  );
}

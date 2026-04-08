import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { HomeHeader } from "@/features/home/components/HomeHeader";
import { QuickActions } from "@/features/home/components/QuickActions";
import { WarningBanner } from "@/features/home/components/WarningBanner";
import { ShiftCard } from "@/features/shift/components/ShiftCard";
import { ShiftPreparation } from "@/features/shift/components/ShiftPreparation";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { RecentTransactions } from "@/features/transactions/components/RecentTransactions";
import { AppButton } from "@/components";
import { useDeviceLayout } from "@/hooks/useDeviceLayout";
import { ColorBase, ColorNeutral } from "@/themes/Colors";

export default function HomePage() {
  const router = useRouter();
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const { useTwoPaneLayout } = useDeviceLayout();

  const mainCta = isShiftStarted ? (
    <AppButton
      variant="primary"
      size="lg"
      fullWidth
      title="Mulai Transaksi"
      icon={
        <Ionicons name="cart-outline" size={20} color={ColorBase.white} />
      }
      onPress={() => router.push("/transaksi-baru")}
    />
  ) : (
    <AppButton
      variant="outline"
      size="lg"
      fullWidth
      title="Buka Shift untuk Mulai Transaksi"
      icon={
        <Ionicons
          name="sunny-outline"
          size={20}
          color={ColorNeutral.neutral500}
        />
      }
      onPress={() => router.push("/buka-shift")}
    />
  );

  if (useTwoPaneLayout) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: ColorBase.bgScreen }}
      >
        <HomeHeader />
        <ScrollView showsVerticalScrollIndicator={false}>
          <XStack
            gap="$4"
            paddingHorizontal="$4"
            paddingBottom="$6"
            alignItems="flex-start"
          >
            <YStack flex={1.1} minWidth={0} gap="$3">
              <ShiftCard
                isShiftStarted={isShiftStarted}
                onClose={() => router.push("/tutup-shift")}
                onStart={() => router.push("/buka-shift")}
              />
              {mainCta}
              <QuickActions isShiftStarted={isShiftStarted} />
            </YStack>

            <YStack flex={0.9} minWidth={320} maxWidth={420} gap="$3">
              <WarningBanner
                isShiftStarted={isShiftStarted}
                onViewInventory={() => router.push("/inventori" as never)}
              />
              {isShiftStarted ? <RecentTransactions /> : <ShiftPreparation />}
            </YStack>
          </XStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: ColorBase.bgScreen }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader />

        <YStack gap="$3" paddingHorizontal="$4" paddingBottom="$6">
          <ShiftCard
            isShiftStarted={isShiftStarted}
            onClose={() => router.push("/tutup-shift")}
            onStart={() => router.push("/buka-shift")}
          />

          {mainCta}

          <QuickActions isShiftStarted={isShiftStarted} />

          <WarningBanner
            isShiftStarted={isShiftStarted}
            onViewInventory={() => router.push("/inventori" as never)}
          />

          {isShiftStarted ? <RecentTransactions /> : <ShiftPreparation />}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

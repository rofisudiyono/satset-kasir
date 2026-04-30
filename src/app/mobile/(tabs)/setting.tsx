import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { PageHeader, TextBodySm } from "@/components";
import { isShiftStartedAtom, shiftDataAtom } from "@/features/shift/store/shift.store";
import { kasirKeys } from "@/hooks/api/query-keys";
import { ProfileCard, SettingRow } from "@/features/settings";
import { useAuth } from "@/lib/auth";
import { getLoginRoute, getOpenShiftRoute } from "@/lib/routing/device-routes";
import {
  ColorDanger,
  ColorNeutral,
  ColorPrimary,
  ColorWarning,
} from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

function formatRole(role?: string | null) {
  if (!role) return "Kasir";
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function MobileSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, session, logout } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const shiftData = useAtomValue(shiftDataAtom);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: kasirKeys.activeShift() }),
        queryClient.invalidateQueries({ queryKey: kasirKeys.tenantInfo() }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  async function handleLogout() {
    if (isShiftStarted) {
      Alert.alert(
        "Ganti user?",
        "Shift aktif harus ditutup dulu sebelum akun kasir diganti.",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Tutup Shift",
            style: "destructive",
            onPress: () => {
              router.push({
                pathname: "/tutup-shift",
              } as never);
            },
          },
        ],
      );
      return;
    }

    Alert.alert(
      "Keluar dari akun ini?",
      "Sesi kasir di perangkat ini akan diakhiri dan layar login akan ditampilkan.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await logout();
                router.replace(getLoginRoute(false) as never);
              } catch {
                Alert.alert("Gagal logout", "Coba ulangi beberapa saat lagi.");
              }
            })();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <PageHeader
        title="Setting"
        subtitle="Kelola perangkat kasir dan akses cepat outlet"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void handleRefresh();
            }}
            tintColor={ColorPrimary.primary600}
            colors={[ColorPrimary.primary600]}
          />
        }
      >
        <ProfileCard
          name={session?.email ?? "Kasir"}
          role={formatRole(user?.role)}
          status={isShiftStarted ? "Shift Aktif" : "Belum Buka Shift"}
        />

        <View style={styles.section}>
          <SettingRow
            iconName={isShiftStarted ? "moon-outline" : "sunny-outline"}
            iconBg={isShiftStarted ? BrandColors.tintStrong : BrandColors.tint}
            iconColor={isShiftStarted ? BrandColors.text : BrandColors.green}
            title={isShiftStarted ? "Tutup Shift" : "Buka Shift"}
            subtitle={
              isShiftStarted
                ? `Shift ${shiftData?.slot ?? "aktif"} berjalan${shiftData?.startTime ? ` sejak ${shiftData.startTime}` : ""}`
                : "Mulai operasional kasir dan catat modal awal"
            }
            badge={isShiftStarted ? "Aktif" : "Belum aktif"}
            badgeBg={isShiftStarted ? BrandColors.tintStrong : ColorNeutral.neutral100}
            badgeColor={isShiftStarted ? BrandColors.text : ColorNeutral.neutral500}
            onPress={() =>
              router.push(
                (isShiftStarted ? "/tutup-shift" : getOpenShiftRoute(false)) as never,
              )
            }
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="storefront-outline"
            iconBg={BrandColors.tint}
            iconColor={BrandColors.mid}
            title="Informasi Toko"
            subtitle="Nama toko, alamat, dan jam operasional"
            onPress={() => router.push("/informasi-toko" as never)}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="print-outline"
            iconBg={ColorWarning.warning100}
            iconColor={ColorWarning.warning700}
            title="Bluetooth Printer"
            subtitle="Hubungkan printer struk"
            onPress={() => router.push("/bluetooth-printer" as never)}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="settings-outline"
            iconBg={ColorNeutral.neutral100}
            iconColor={ColorNeutral.neutral600}
            title="Tentang Perangkat"
            subtitle="Konfigurasi dasar perangkat kasir"
            value={user?.branchId ? `Outlet ${user.branchId.slice(0, 6)}` : "Belum diatur"}
            showChevron={false}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => void handleLogout()}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={18} color={ColorDanger.danger600} />
          <YStack gap={2}>
            <TextBodySm fontWeight="700" color={ColorDanger.danger600}>
              {isShiftStarted ? "Tutup Shift & Login Ulang" : "Ganti User"}
            </TextBodySm>
            <TextBodySm color={ColorNeutral.neutral500}>
              {isShiftStarted
                ? "Tutup kas terlebih dahulu sebelum keluar"
                : "Akhiri sesi kasir di perangkat ini"}
            </TextBodySm>
          </YStack>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingTop: 8,
    paddingBottom: 112,
  },
  section: {
    backgroundColor: BrandColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.border,
    overflow: "hidden",
    shadowColor: BrandColors.deep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.border,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BrandColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(185, 28, 28, 0.12)",
    paddingHorizontal: 16,
    paddingVertical: 15,
    shadowColor: ColorDanger.danger900,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
});

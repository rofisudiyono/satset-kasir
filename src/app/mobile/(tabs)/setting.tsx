import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { PageHeader, TextBodySm } from "@/components";
import { ProfileCard, SettingRow } from "@/features/settings";
import { useAuth } from "@/lib/auth";
import { getLoginRoute } from "@/lib/routing/device-routes";
import {
  ColorAccentOrange,
  ColorBase,
  ColorDanger,
  ColorNeutral,
  ColorPrimary,
  ColorSuccess,
  ColorWarning,
} from "@/themes/Colors";

function formatRole(role?: string | null) {
  if (!role) return "Kasir";
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function MobileSettingsPage() {
  const router = useRouter();
  const { user, session, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      router.replace(getLoginRoute(false) as never);
    } catch {
      Alert.alert("Gagal logout", "Coba ulangi beberapa saat lagi.");
    }
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
      >
        <ProfileCard
          name={session?.email ?? "Kasir"}
          role={formatRole(user?.role)}
          status="Aktif"
        />

        <View style={styles.section}>
          <SettingRow
            iconName="storefront-outline"
            iconBg={ColorPrimary.primary50}
            iconColor={ColorPrimary.primary600}
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
            iconName="time-outline"
            iconBg={ColorSuccess.success50}
            iconColor={ColorSuccess.success600}
            title="Tutup Shift"
            subtitle="Lanjutkan proses tutup shift kasir"
            onPress={() => router.push("/tutup-shift" as never)}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="settings-outline"
            iconBg={ColorAccentOrange.orange50}
            iconColor={ColorAccentOrange.orange600}
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
          <Ionicons
            name="log-out-outline"
            size={18}
            color={ColorDanger.danger600}
          />
          <YStack gap={2}>
            <TextBodySm fontWeight="700" color={ColorDanger.danger600}>
              Keluar
            </TextBodySm>
            <TextBodySm color={ColorNeutral.neutral500}>
              Akhiri sesi kasir di perangkat ini
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
    backgroundColor: ColorBase.bgScreen,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: ColorBase.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: ColorNeutral.neutral200,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: ColorBase.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ColorDanger.danger100,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});

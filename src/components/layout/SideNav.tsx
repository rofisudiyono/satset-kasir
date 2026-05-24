import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useAtom } from "jotai";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { YStack } from "tamagui";

import { TextBodySm, TextCaption, TextH3 } from "@/components";
import { isShiftStartedAtom, shiftDataAtom } from "@/features/shift/store/shift.store";
import { ColorBase } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { AvatarBadge } from "@/components/atoms/AvatarBadge";
import { ShiftInfoBanner } from "@/components/molecules/ShiftInfoBanner";

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  segment: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Web Orders",
    icon: "globe-outline",
    iconActive: "globe",
    segment: "/",
    href: "/",
  },
  {
    label: "Input Manual",
    icon: "create-outline",
    iconActive: "create",
    segment: "/transaksi",
    href: "/transaksi",
  },
  {
    label: "Siap Antar",
    icon: "bag-check-outline",
    iconActive: "bag-check",
    segment: "/pengaturan",
    href: "/pengaturan",
  },
  {
    label: "Riwayat",
    icon: "time-outline",
    iconActive: "time",
    segment: "/pengaturan",
    href: "/pengaturan",
  },
];

export function SideNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const [shiftData] = useAtom(shiftDataAtom);
  const cashierName = shiftData?.cashierName ?? "Kasir";
  const shiftSlot = shiftData?.slot ?? "PAGI";
  const shiftStartTime = shiftData?.startTime ?? undefined;

  function isActive(item: NavItem) {
    if (item.segment === "/") return pathname === "/";
    if (
      item.segment === "/transaksi" &&
      pathname.startsWith("/transaksi-baru")
    ) {
      return true;
    }
    return pathname.startsWith(item.segment);
  }

  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Ionicons name="storefront" size={22} color={BrandColors.deep} />
        </View>
        <YStack gap={2} flex={1}>
          <TextH3 fontWeight="700" color={BrandColors.text}>Toko</TextH3>
          <TextCaption color={BrandColors.textMuted} numberOfLines={1}>
            Kasir App
          </TextCaption>
        </YStack>
      </View>

      {/* Shift info */}
      <View style={styles.shiftBannerRow}>
        <ShiftInfoBanner
          slot={shiftSlot}
          startTime={shiftStartTime}
          isActive={isShiftStarted}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.shiftBtnCompact,
            isShiftStarted ? styles.shiftBtnCompactOpen : styles.shiftBtnCompactClosed,
          ]}
          onPress={() =>
            router.push(isShiftStarted ? "/tutup-shift" : "/buka-shift")
          }
        >
          <TextBodySm
            fontWeight="700"
            color={isShiftStarted ? ColorBase.white : BrandColors.textMuted}
            fontSize={11}
          >
            {isShiftStarted ? "Tutup Shift" : "Buka Shift"}
          </TextBodySm>
        </TouchableOpacity>
      </View>

      {/* Kasir info */}
      <View style={styles.kasirRow}>
        <AvatarBadge name={cashierName} size={32} />
        <YStack gap={1} flex={1}>
          <TextBodySm fontWeight="600" color={BrandColors.text} numberOfLines={1}>
            {cashierName}
          </TextBodySm>
          <TextCaption color={BrandColors.textMuted}>Kasir</TextCaption>
        </YStack>
      </View>

      <View style={styles.separator} />

      {/* Nav items */}
      <YStack flex={1} gap={4} paddingTop={8}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <TouchableOpacity
              key={item.href}
              activeOpacity={0.7}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.href as never)}
            >
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={20}
                color={active ? BrandColors.deep : BrandColors.textMuted}
              />
              <TextBodySm
                fontWeight={active ? "700" : "400"}
                color={active ? BrandColors.deep : BrandColors.textMuted}
              >
                {item.label}
              </TextBodySm>
            </TouchableOpacity>
          );
        })}
      </YStack>

      {/* Footer: Siap Antar, Reservasi */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerRow} onPress={() => router.push("/siap-antar" as never)}>
          <Ionicons name="bag-check-outline" size={16} color={BrandColors.textMuted} />
          <TextBodySm color={BrandColors.textMuted} flex={1}>Siap Diantar</TextBodySm>
        </TouchableOpacity>
        <View style={styles.footerRow}>
          <Ionicons name="calendar-clear-outline" size={16} color={BrandColors.textMuted} />
          <YStack flex={1} gap={1}>
            <TextBodySm color={BrandColors.textMuted}>Reservasi</TextBodySm>
            <TextCaption color="rgba(23,31,27,0.35)">Segera hadir</TextCaption>
          </YStack>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: "100%",
    backgroundColor: BrandColors.surface,
    borderRightWidth: 1,
    borderRightColor: BrandColors.border,
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BrandColors.tint,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  shiftBannerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  shiftBtnCompact: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  shiftBtnCompactOpen: {
    backgroundColor: BrandColors.coral,
  },
  shiftBtnCompactClosed: {
    backgroundColor: BrandColors.tint,
  },
  kasirRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  separator: {
    height: 1,
    backgroundColor: BrandColors.border,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: BrandColors.tint,
  },
  footer: {
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    marginTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
});

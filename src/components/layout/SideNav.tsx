import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useAtom } from "jotai";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { YStack } from "tamagui";

import { TextBodySm, TextCaption, TextH3 } from "@/components";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import {
  ColorBase,
  ColorNeutral,
  ColorPrimary,
  ColorSuccess,
} from "@/themes/Colors";

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
          <Ionicons name="storefront" size={22} color={ColorBase.white} />
        </View>
        <YStack gap={2}>
          <TextH3 fontWeight="700">Toko Makmur</TextH3>
          <TextCaption color="$colorSecondary">Budi Santoso</TextCaption>
        </YStack>
      </View>

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
                color={
                  active ? ColorPrimary.primary600 : ColorNeutral.neutral500
                }
              />
              <TextBodySm
                fontWeight={active ? "700" : "400"}
                color={active ? "$primary" : "$colorSecondary"}
              >
                {item.label}
              </TextBodySm>
            </TouchableOpacity>
          );
        })}
      </YStack>

      {/* Shift button */}
      <View style={styles.footer}>
        <View style={styles.reservationBadge}>
          <Ionicons
            name="calendar-clear-outline"
            size={14}
            color={ColorNeutral.neutral500}
          />
          <TextCaption color="$colorSecondary">
            Reservasi segera hadir
          </TextCaption>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.shiftBtn,
            isShiftStarted ? styles.shiftBtnOpen : styles.shiftBtnClosed,
          ]}
          onPress={() =>
            router.push(isShiftStarted ? "/tutup-shift" : "/buka-shift")
          }
        >
          <Ionicons
            name={isShiftStarted ? "moon-outline" : "sunny-outline"}
            size={16}
            color={isShiftStarted ? ColorBase.white : ColorNeutral.neutral600}
          />
          <TextBodySm
            fontWeight="600"
            color={isShiftStarted ? ColorBase.white : "$colorSecondary"}
          >
            {isShiftStarted ? "Tutup Shift" : "Buka Shift"}
          </TextBodySm>
        </TouchableOpacity>

        {isShiftStarted && (
          <View style={styles.shiftBadge}>
            <View style={styles.shiftDot} />
            <TextCaption color={ColorSuccess.success600} fontWeight="600">
              Shift Aktif
            </TextCaption>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: "100%",
    backgroundColor: ColorBase.white,
    borderRightWidth: 1,
    borderRightColor: ColorNeutral.neutral200,
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ColorPrimary.primary600,
    alignItems: "center",
    justifyContent: "center",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: ColorPrimary.primary50,
  },
  footer: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: ColorNeutral.neutral100,
  },
  reservationBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: ColorNeutral.neutral100,
  },
  shiftBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shiftBtnOpen: {
    backgroundColor: ColorPrimary.primary600,
  },
  shiftBtnClosed: {
    backgroundColor: ColorNeutral.neutral100,
  },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  shiftDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ColorSuccess.success500,
  },
});

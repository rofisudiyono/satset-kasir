import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { IconButton, TextBodySm, TextCaption, TextH3 } from "@/components";
import {
  ensurePosSeedDataAtom,
  posOrdersAtom,
} from "@/features/pos/store/pos.store";
import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import {
  ColorBase,
  ColorDanger,
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

export function TopNavHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const [shiftData] = useAtom(shiftDataAtom);
  const [posOrders] = useAtom(posOrdersAtom);
  const ensurePosSeedData = useSetAtom(ensurePosSeedDataAtom);
  const [staffDetailVisible, setStaffDetailVisible] = useState(false);

  useEffect(() => {
    ensurePosSeedData();
  }, [ensurePosSeedData]);

  const readyOrders = useMemo(() => {
    return posOrders.filter((order) => {
      if (order.fulfillment !== "READY") return false;
      if (order.status === "CANCELLED" || order.status === "EXPIRED") {
        return false;
      }
      if (!shiftData?.openedAt) return true;
      if (order.shiftId && shiftData.shiftId) {
        return order.shiftId === shiftData.shiftId;
      }
      return order.createdAt >= shiftData.openedAt;
    });
  }, [posOrders, shiftData?.openedAt, shiftData?.shiftId]);

  const navItems: NavItem[] = [
    {
      label: "Pesanan Web",
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
      label: "Riwayat",
      icon: "time-outline",
      iconActive: "time",
      segment: "/pengaturan",
      href: "/pengaturan",
    },
  ];

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

  const cashierLabel = shiftData?.cashierName ?? "Kasir 01";
  const shiftLabel = shiftData?.slot ?? "SHIFT";
  const shellMaxWidth = width >= 1360 ? 1480 : width >= 1024 ? 1240 : width;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={[styles.shell, { maxWidth: shellMaxWidth }]}>
        <XStack style={styles.topRow}>
          <XStack alignItems="center" gap="$3" flex={1}>
            <View style={styles.brandIcon}>
              <Ionicons name="cafe-outline" size={22} color={ColorBase.white} />
            </View>

            <YStack gap={2} flex={1}>
              <TextH3 fontWeight="700" color={ColorNeutral.neutral800}>
                Kasirin Aja
              </TextH3>
              <TextCaption color={ColorNeutral.neutral500}>
                Outlet utama • {cashierLabel}
              </TextCaption>
            </YStack>
          </XStack>

          <XStack
            alignItems="center"
            gap="$3"
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            <View style={styles.shiftPill}>
              <TextCaption color={ColorNeutral.neutral500}>Shift</TextCaption>
              <TextBodySm fontWeight="700" color={ColorNeutral.neutral800}>
                {shiftLabel}
                {isShiftStarted ? " • Aktif" : " • Belum buka"}
              </TextBodySm>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.primaryAction,
                isShiftStarted
                  ? styles.primaryActionDanger
                  : styles.primaryActionNeutral,
              ]}
              onPress={() =>
                router.push(isShiftStarted ? "/tutup-shift" : "/buka-shift")
              }
            >
              <Ionicons
                name={isShiftStarted ? "log-out-outline" : "play-outline"}
                size={18}
                color={ColorBase.white}
              />
              <TextBodySm fontWeight="700" color={ColorBase.white}>
                {isShiftStarted ? "Tutup Shift" : "Buka Shift"}
              </TextBodySm>
            </TouchableOpacity>

            <View style={styles.actionGroup}>
              <View>
                <IconButton
                  iconName="notifications-outline"
                  shape="square"
                  size={42}
                  iconColor={ColorNeutral.neutral700}
                  bg={ColorNeutral.neutral50}
                />
                <View style={styles.alertDot} />
              </View>
              <IconButton
                iconName="person-outline"
                shape="square"
                size={42}
                iconColor={ColorNeutral.neutral700}
                bg={ColorNeutral.neutral50}
                onPress={() => setStaffDetailVisible(true)}
              />
            </View>
          </XStack>
        </XStack>

        <XStack style={styles.navRow} flexWrap="wrap">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.8}
                style={[styles.navChip, active && styles.navChipActive]}
                onPress={() => router.push(item.href as never)}
              >
                <Ionicons
                  name={active ? item.iconActive : item.icon}
                  size={16}
                  color={
                    active ? ColorPrimary.primary600 : ColorNeutral.neutral700
                  }
                />
                <TextBodySm
                  fontWeight="700"
                  color={
                    active ? ColorPrimary.primary600 : ColorNeutral.neutral700
                  }
                >
                  {item.label}
                </TextBodySm>
              </TouchableOpacity>
            );
          })}

          <View
            style={[
              styles.readyChip,
              readyOrders.length > 0 && styles.readyChipActive,
            ]}
          >
            <Ionicons
              name={readyOrders.length > 0 ? "bag-check" : "bag-check-outline"}
              size={16}
              color={
                readyOrders.length > 0
                  ? ColorSuccess.success600
                  : ColorNeutral.neutral500
              }
            />
            <TextBodySm
              fontWeight="700"
              color={
                readyOrders.length > 0
                  ? ColorSuccess.success600
                  : ColorNeutral.neutral700
              }
            >
              Siap Diantar
            </TextBodySm>
            <TextCaption
              color={
                readyOrders.length > 0
                  ? ColorSuccess.success600
                  : ColorNeutral.neutral500
              }
              fontWeight={readyOrders.length > 0 ? "700" : "500"}
            >
              {readyOrders.length > 0
                ? `${readyOrders.length} READY dari KDA`
                : "Belum ada READY"}
            </TextCaption>
          </View>

          <View style={styles.comingSoonChip}>
            <Ionicons
              name="calendar-clear-outline"
              size={16}
              color={ColorSuccess.success600}
            />
            <TextBodySm fontWeight="700" color={ColorNeutral.neutral700}>
              Reservasi
            </TextBodySm>
            <TextCaption color={ColorNeutral.neutral500}>
              Segera hadir
            </TextCaption>
          </View>
        </XStack>
      </View>

      <Modal
        visible={staffDetailVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStaffDetailVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setStaffDetailVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.staffPopup}>
                <XStack alignItems="center" justifyContent="space-between">
                  <TextH3 fontWeight="700">Detail Staff</TextH3>
                  <TouchableOpacity
                    onPress={() => setStaffDetailVisible(false)}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={ColorNeutral.neutral400}
                    />
                  </TouchableOpacity>
                </XStack>

                <View style={styles.staffProfile}>
                  <View style={styles.avatarLarge}>
                    <Ionicons
                      name="person"
                      size={32}
                      color={ColorPrimary.primary600}
                    />
                  </View>
                  <YStack gap={2} marginLeft="$3">
                    <TextH3 fontWeight="700">
                      {shiftData?.cashierName ?? "Kasir 01"}
                    </TextH3>
                    <TextBodySm color="$colorSecondary">
                      Staff - Kasir
                    </TextBodySm>
                  </YStack>
                </View>

                <View style={styles.infoSection}>
                  <YStack gap={10}>
                    <XStack justifyContent="space-between">
                      <TextBodySm color="$colorSecondary">Jabatan</TextBodySm>
                      <TextBodySm fontWeight="600">Kasir</TextBodySm>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <TextBodySm color="$colorSecondary">Email</TextBodySm>
                      <TextBodySm fontWeight="600">
                        budi.santoso@tokomakmur.id
                      </TextBodySm>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <TextBodySm color="$colorSecondary">Shift</TextBodySm>
                      <TextBodySm fontWeight="600">
                        {shiftData?.slot ?? "PAGI"}
                      </TextBodySm>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <TextBodySm color="$colorSecondary">
                        Status Shift
                      </TextBodySm>
                      <TextBodySm
                        fontWeight="600"
                        color={
                          isShiftStarted ? "$success" : ColorDanger.danger600
                        }
                      >
                        {isShiftStarted ? "Aktif" : "Belum mulai"}
                      </TextBodySm>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <TextBodySm color="$colorSecondary">
                        Mulai Shift
                      </TextBodySm>
                      <TextBodySm fontWeight="600">
                        {shiftData?.startTime ?? "08:00 WIB"}
                      </TextBodySm>
                    </XStack>
                  </YStack>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.logoutButton}
                  onPress={() => {
                    setStaffDetailVisible(false);
                    router.push("/login" as never);
                  }}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    color={ColorDanger.danger600}
                  />
                  <TextBodySm fontWeight="700" color={ColorDanger.danger600}>
                    Keluar
                  </TextBodySm>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: ColorBase.white,
  },
  shell: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: ColorBase.white,
    borderBottomWidth: 1,
    borderBottomColor: ColorNeutral.neutral200,
  },
  topRow: {
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 16,
  },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ColorPrimary.primary600,
    borderWidth: 1,
    borderColor: ColorPrimary.primary600,
  },
  shiftPill: {
    minWidth: 156,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: ColorNeutral.neutral50,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    gap: 2,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryActionNeutral: {
    backgroundColor: ColorPrimary.primary600,
  },
  primaryActionDanger: {
    backgroundColor: ColorDanger.danger600,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ColorDanger.danger600,
    borderWidth: 2,
    borderColor: ColorBase.white,
  },
  navRow: {
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 2,
    backgroundColor: ColorBase.white,
  },
  navChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ColorNeutral.neutral50,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  navChipActive: {
    backgroundColor: ColorPrimary.primary50,
    borderColor: ColorPrimary.primary200,
  },
  readyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ColorNeutral.neutral50,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  readyChipActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  comingSoonChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ColorNeutral.neutral50,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  // Modal / Staff popup
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 60,
    paddingRight: 18,
  },
  staffPopup: {
    width: 320,
    backgroundColor: ColorBase.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  staffProfile: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ColorPrimary.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    backgroundColor: ColorNeutral.neutral50,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ColorDanger.danger50,
    borderWidth: 1,
    borderColor: ColorDanger.danger200,
  },
});

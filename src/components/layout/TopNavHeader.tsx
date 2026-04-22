import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { XStack, YStack } from "tamagui";

import { IconButton, TextBodySm, TextCaption, TextH3 } from "@/components";
import { useAuth } from "@/lib/auth";
import { useTenantInfoQuery, useReadyOrdersQuery } from "@/hooks/api/use-kasir-api";
import { kasirKeys } from "@/hooks/api/query-keys";
import { API_BASE_URL } from "@/config/env";
import {
  getHistoryRoute,
  getHomeRoute,
  getInputManualRoute,
  getNamespaceFromPathname,
  getOpenShiftRoute,
  getSiapAntarRoute,
} from "@/lib/routing/device-routes";
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

type RefreshTarget = "web-orders" | "input-manual" | "history" | "ready-orders";

const ADMIN_HEADER_BG = ColorPrimary.primary900;
const ADMIN_HEADER_SURFACE = "rgba(238,244,239,0.1)";
const ADMIN_HEADER_BORDER = "rgba(238,244,239,0.18)";
const ADMIN_HEADER_TEXT_SECONDARY = "rgba(247,250,247,0.78)";
const ADMIN_HEADER_TEXT_MUTED = "rgba(247,250,247,0.54)";

export function TopNavHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, logout, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const [shiftData] = useAtom(shiftDataAtom);
  const [posOrders] = useAtom(posOrdersAtom);
  const ensurePosSeedData = useSetAtom(ensurePosSeedDataAtom);
  const [staffDetailVisible, setStaffDetailVisible] = useState(false);
  const isTabletNamespace = getNamespaceFromPathname(pathname) === "tablet";

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

  const readyOrdersQuery = useReadyOrdersQuery(
    Boolean(isLoggedIn && isShiftStarted),
  );

  const displayReadyCount = useMemo(() => {
    const localCount = readyOrders.length;
    if (!isLoggedIn || !isShiftStarted) return localCount;
    if (readyOrdersQuery.isSuccess && Array.isArray(readyOrdersQuery.data)) {
      return readyOrdersQuery.data.length;
    }
    return localCount;
  }, [
    isLoggedIn,
    isShiftStarted,
    readyOrders.length,
    readyOrdersQuery.isSuccess,
    readyOrdersQuery.data,
  ]);

  const navItems: NavItem[] = [
    {
      label: "Pesanan Web",
      icon: "globe-outline",
      iconActive: "globe",
      segment: getHomeRoute(isTabletNamespace),
      href: getHomeRoute(isTabletNamespace),
    },
    {
      label: "Input Manual",
      icon: "create-outline",
      iconActive: "create",
      segment: getInputManualRoute(isTabletNamespace),
      href: getInputManualRoute(isTabletNamespace),
    },
    {
      label: "Riwayat",
      icon: "time-outline",
      iconActive: "time",
      segment: getHistoryRoute(isTabletNamespace),
      href: getHistoryRoute(isTabletNamespace),
    },
  ];

  function isActive(item: NavItem) {
    if (pathname === item.segment) return true;
    if (
      item.segment === getInputManualRoute(isTabletNamespace) &&
      pathname.startsWith("/transaksi-baru")
    ) {
      return true;
    }
    return pathname.startsWith(item.segment);
  }

  const siapAntarHref = getSiapAntarRoute(isTabletNamespace);
  const isSiapAntarTabActive =
    pathname === siapAntarHref || pathname.startsWith(`${siapAntarHref}/`);
  const refreshTarget = useMemo<RefreshTarget | null>(() => {
    if (
      pathname === getHomeRoute(isTabletNamespace) ||
      pathname.startsWith(`${getHomeRoute(isTabletNamespace)}/`)
    ) {
      return "web-orders";
    }
    if (
      pathname === getInputManualRoute(isTabletNamespace) ||
      pathname.startsWith(`${getInputManualRoute(isTabletNamespace)}/`) ||
      pathname.startsWith("/transaksi-baru")
    ) {
      return "input-manual";
    }
    if (
      pathname === getHistoryRoute(isTabletNamespace) ||
      pathname.startsWith(`${getHistoryRoute(isTabletNamespace)}/`)
    ) {
      return "history";
    }
    if (isSiapAntarTabActive) {
      return "ready-orders";
    }
    return null;
  }, [isSiapAntarTabActive, isTabletNamespace, pathname]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!refreshTarget || isRefreshing) return;

    setIsRefreshing(true);
    try {
      if (refreshTarget === "web-orders") {
        await queryClient.invalidateQueries({
          queryKey: kasirKeys.pendingWebOrders(),
        });
        return;
      }

      if (refreshTarget === "input-manual") {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: kasirKeys.menus() }),
          queryClient.invalidateQueries({ queryKey: kasirKeys.tables() }),
          queryClient.invalidateQueries({ queryKey: kasirKeys.promos() }),
          queryClient.invalidateQueries({ queryKey: kasirKeys.taxSettings() }),
        ]);
        return;
      }

      if (refreshTarget === "history") {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...kasirKeys.all, "orders", "history"],
          }),
          queryClient.invalidateQueries({
            queryKey: [...kasirKeys.all, "orders", "detail"],
          }),
        ]);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: kasirKeys.readyOrders() });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, queryClient, refreshTarget]);

  const tenantInfoQuery = useTenantInfoQuery(isLoggedIn);
  const tenantInfo = tenantInfoQuery.data;
  const tenantName = tenantInfo?.tenantName ?? null;
  const branchName = tenantInfo?.branchName ?? null;
  const logoUri = tenantInfo?.logoPath ? `${API_BASE_URL}${tenantInfo.logoPath}` : null;
  const cashierLabel = shiftData?.cashierName ?? "Kasir 01";
  const shiftLabel = shiftData?.slot ?? "SHIFT";
  const shellMaxWidth = width >= 1360 ? 1480 : width >= 1024 ? 1240 : width;

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[ColorPrimary.primary700, ColorPrimary.primary900]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBg}
      />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.shell, { maxWidth: shellMaxWidth }]}>
        <XStack style={styles.topRow}>
          <XStack alignItems="center" gap="$3" flex={1}>
            <View style={styles.brandIcon}>
              {logoUri ? (
                <Image
                  source={{ uri: logoUri }}
                  style={styles.brandLogo}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="cafe-outline" size={22} color={ColorBase.white} />
              )}
            </View>

            <YStack gap={2} flex={1}>
              <TextH3 fontWeight="700" color={ColorBase.white}>
                {tenantName ?? branchName ?? "—"}
              </TextH3>
              <TextCaption color={ADMIN_HEADER_TEXT_SECONDARY}>
                {branchName && tenantName ? `${branchName} • ` : ""}{cashierLabel}
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
              <TextCaption color={ADMIN_HEADER_TEXT_SECONDARY} fontWeight="700">
                Shift
              </TextCaption>
              <TextBodySm fontWeight="700" color={ColorBase.white}>
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
                router.push(
                  (isShiftStarted
                    ? "/tutup-shift"
                    : getOpenShiftRoute(isTabletNamespace)) as never,
                )
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
                  iconColor={ColorBase.white}
                  bg={ADMIN_HEADER_SURFACE}
                />
                <View style={styles.alertDot} />
              </View>
              <IconButton
                iconName="bluetooth-outline"
                shape="square"
                size={42}
                iconColor={ColorBase.white}
                bg={ADMIN_HEADER_SURFACE}
                onPress={() => router.push("/bluetooth-printer" as never)}
              />
              <IconButton
                iconName="person-outline"
                shape="square"
                size={42}
                iconColor={ColorBase.white}
                bg={ADMIN_HEADER_SURFACE}
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
                    active ? ColorBase.white : ADMIN_HEADER_TEXT_SECONDARY
                  }
                />
                <TextBodySm
                  fontWeight="700"
                  color={
                    active ? ColorBase.white : ADMIN_HEADER_TEXT_SECONDARY
                  }
                >
                  {item.label}
                </TextBodySm>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.readyChip,
              isSiapAntarTabActive && styles.navChipActive,
              !isSiapAntarTabActive &&
                displayReadyCount > 0 &&
                styles.readyChipActive,
            ]}
            onPress={() => router.push(siapAntarHref as never)}
          >
            <Ionicons
              name={displayReadyCount > 0 ? "bag-check" : "bag-check-outline"}
              size={16}
              color={
                isSiapAntarTabActive
                  ? ColorBase.white
                  : displayReadyCount > 0
                    ? ColorSuccess.success600
                    : ADMIN_HEADER_TEXT_MUTED
              }
            />
            <TextBodySm
              fontWeight="700"
              color={
                isSiapAntarTabActive
                  ? ColorBase.white
                  : displayReadyCount > 0
                    ? ColorSuccess.success600
                    : ADMIN_HEADER_TEXT_SECONDARY
              }
            >
              Siap Diantar
            </TextBodySm>
            <TextCaption
              color={
                isSiapAntarTabActive
                  ? ColorBase.white
                  : displayReadyCount > 0
                    ? ColorSuccess.success600
                    : ADMIN_HEADER_TEXT_MUTED
              }
              fontWeight={displayReadyCount > 0 ? "700" : "500"}
            >
              {displayReadyCount > 0
                ? `${displayReadyCount} READY dari KDA`
                : "Belum ada READY"}
            </TextCaption>
          </TouchableOpacity>

          {refreshTarget ? (
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isRefreshing}
              style={[
                styles.refreshChip,
                isRefreshing && styles.refreshChipDisabled,
              ]}
              onPress={() => {
                void handleRefresh();
              }}
            >
              <Ionicons
                name={isRefreshing ? "sync" : "refresh-outline"}
                size={16}
                color={ColorBase.white}
              />
              <TextBodySm fontWeight="700" color={ColorBase.white}>
                Refresh
              </TextBodySm>
            </TouchableOpacity>
          ) : null}

          <View style={styles.comingSoonChip}>
            <Ionicons
              name="calendar-clear-outline"
              size={16}
              color={ColorSuccess.success600}
            />
            <TextBodySm fontWeight="700" color={ColorBase.white}>
              Reservasi
            </TextBodySm>
            <TextCaption color={ADMIN_HEADER_TEXT_MUTED}>
              Segera hadir
            </TextCaption>
          </View>
        </XStack>
        </View>
      </SafeAreaView>

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
                        {session?.email ?? "—"}
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
                    void logout();
                    router.replace("/login" as never);
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  shell: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_HEADER_BORDER,
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
    borderColor: "rgba(238,244,239,0.28)",
    overflow: "hidden",
  },
  brandLogo: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },
  shiftPill: {
    minWidth: 174,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: ADMIN_HEADER_SURFACE,
    borderWidth: 1,
    borderColor: ADMIN_HEADER_BORDER,
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
    backgroundColor: ColorPrimary.primary700,
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
    borderColor: ADMIN_HEADER_BG,
  },
  navRow: {
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 2,
    backgroundColor: "transparent",
  },
  navChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ADMIN_HEADER_SURFACE,
    borderWidth: 1,
    borderColor: ADMIN_HEADER_BORDER,
  },
  navChipActive: {
    backgroundColor: ColorPrimary.primary600,
    borderColor: "rgba(238,244,239,0.34)",
  },
  readyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ADMIN_HEADER_SURFACE,
    borderWidth: 1,
    borderColor: ADMIN_HEADER_BORDER,
  },
  readyChipActive: {
    backgroundColor: "rgba(216, 233, 230, 0.14)",
    borderColor: "rgba(216, 233, 230, 0.32)",
  },
  refreshChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ColorPrimary.primary700,
    borderWidth: 1,
    borderColor: "rgba(238,244,239,0.34)",
  },
  refreshChipDisabled: {
    opacity: 0.72,
  },
  comingSoonChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ADMIN_HEADER_SURFACE,
    borderWidth: 1,
    borderColor: ADMIN_HEADER_BORDER,
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

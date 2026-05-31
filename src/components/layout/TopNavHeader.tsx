import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  Alert,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AvatarBadge } from "@/components/atoms/AvatarBadge";
import { IconButton } from "@/components/atoms/IconButton";
import { TextBodySm, TextCaption, TextH3 } from "@/components/atoms/Typography";
import { ShiftInfoBanner } from "@/components/molecules/ShiftInfoBanner";
import { useAuth } from "@/lib/auth";
import { useKdsBoardQuery } from "@/hooks/api/use-kds-board-api";
import {
  usePendingWebOrdersQuery,
  useTenantInfoQuery,
} from "@/hooks/api/use-kasir-api";
import { kasirKeys, kdsKeys } from "@/hooks/api/query-keys";
import { API_BASE_URL } from "@/config/env";
import {
  getHistoryRoute,
  getHomeRoute,
  getInputManualRoute,
  getLoginRoute,
  getNamespaceFromPathname,
  getOpenShiftRoute,
  getSiapAntarRoute,
  getTagihanAktifRoute,
} from "@/lib/routing/device-routes";
import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import {
  ColorBase,
  ColorDanger,
  ColorNeutral,
  ColorPrimary,
} from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  segment: string;
  href: string;
};

type RefreshTarget = "web-orders" | "input-manual" | "history" | "ready-orders" | "tagihan-aktif";

const HEADER_TEXT_SECONDARY = BrandColors.textMuted;
const HEADER_TEXT_MUTED = "rgba(23,31,27,0.35)";

export function TopNavHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, logout, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const [shiftData] = useAtom(shiftDataAtom);
  const [staffDetailVisible, setStaffDetailVisible] = useState(false);
  const isTabletNamespace = getNamespaceFromPathname(pathname) === "tablet";

  const kdsBoardQuery = useKdsBoardQuery(Boolean(isLoggedIn && isShiftStarted));
  const pendingWebOrdersQuery = usePendingWebOrdersQuery(
    Boolean(isLoggedIn && isShiftStarted),
  );

  const displayWebOrderCount = useMemo(() => {
    if (!isLoggedIn || !isShiftStarted) return 0;
    if (
      pendingWebOrdersQuery.isSuccess &&
      Array.isArray(pendingWebOrdersQuery.data)
    ) {
      return pendingWebOrdersQuery.data.length;
    }
    return 0;
  }, [
    isLoggedIn,
    isShiftStarted,
    pendingWebOrdersQuery.data,
    pendingWebOrdersQuery.isSuccess,
  ]);

  const displayReadyCount = useMemo(() => {
    if (!isLoggedIn || !isShiftStarted) return 0;
    if (kdsBoardQuery.isSuccess && Array.isArray(kdsBoardQuery.data?.ready)) {
      return kdsBoardQuery.data.ready.length;
    }
    return 0;
  }, [
    isLoggedIn,
    isShiftStarted,
    kdsBoardQuery.isSuccess,
    kdsBoardQuery.data?.ready,
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
    if (isTagihanAktifTabActive) {
      return "tagihan-aktif";
    }
    return null;
  }, [isSiapAntarTabActive, isTabletNamespace, pathname]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSwitchUser = useCallback(() => {
    setStaffDetailVisible(false);

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
              await logout();
              router.replace(getLoginRoute(isTabletNamespace) as never);
            })();
          },
        },
      ],
    );
  }, [isShiftStarted, isTabletNamespace, logout, router]);

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

      if (refreshTarget === "tagihan-aktif") {
        await queryClient.invalidateQueries({
          queryKey: [...kasirKeys.all, "orders", "unpaid"],
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: kdsKeys.board() });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, queryClient, refreshTarget]);

  const tenantInfoQuery = useTenantInfoQuery(isLoggedIn);
  const tenantInfo = tenantInfoQuery.data;
  const tenantName = tenantInfo?.tenantName ?? null;
  const branchName = tenantInfo?.branchName ?? null;
  const logoUri = tenantInfo?.logoPath ? `${API_BASE_URL}${tenantInfo.logoPath}` : null;
  const isPostPay = tenantInfo?.defaultPaymentTiming === "POSTPAY";
  const tagihanAktifHref = getTagihanAktifRoute(isTabletNamespace);
  const isTagihanAktifTabActive =
    pathname === tagihanAktifHref || pathname.startsWith(`${tagihanAktifHref}/`);
  const cashierLabel = shiftData?.cashierName ?? "Kasir 01";
  const shiftSlot = shiftData?.slot ?? "PAGI";
  const shiftStartTime = shiftData?.startTime;
  const shellMaxWidth = width >= 1360 ? 1480 : width >= 1024 ? 1240 : width;

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.topShell, { maxWidth: shellMaxWidth }]}>
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
                <Ionicons name="cafe-outline" size={22} color={BrandColors.deep} />
              )}
            </View>

            <YStack gap={2} flex={1}>
              <TextH3 fontWeight="700" color={BrandColors.text}>
                {tenantName ?? branchName ?? "—"}
              </TextH3>
              <XStack alignItems="center" gap={4}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={HEADER_TEXT_SECONDARY}
                />
                <TextCaption color={HEADER_TEXT_SECONDARY}>
                  {branchName && tenantName ? `${branchName} • ` : ""}
                  {cashierLabel}
                </TextCaption>
              </XStack>
            </YStack>
          </XStack>

          <XStack
            alignItems="center"
            gap="$3"
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            <ShiftInfoBanner
              slot={shiftSlot}
              startTime={shiftStartTime}
              isActive={isShiftStarted}
            />

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
                name={isShiftStarted ? "flame-outline" : "play-outline"}
                size={18}
                color={isShiftStarted ? BrandColors.coral : BrandColors.deep}
              />
              <TextBodySm
                fontWeight="700"
                color={isShiftStarted ? BrandColors.coral : BrandColors.deep}
              >
                {isShiftStarted ? "Tutup Shift" : "Buka Shift"}
              </TextBodySm>
            </TouchableOpacity>

            <View style={styles.actionGroup}>
              <TouchableOpacity activeOpacity={0.85} style={styles.actionCircle}>
                <IconButton
                  iconName="notifications-outline"
                  size={34}
                  iconSize={18}
                  iconColor={BrandColors.textMuted}
                  bg={BrandColors.surface}
                />
                <View style={styles.alertDot} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.85} style={styles.actionCircle}>
                <IconButton
                  iconName="bluetooth-outline"
                  size={34}
                  iconSize={18}
                  iconColor={BrandColors.textMuted}
                  bg={BrandColors.surface}
                  onPress={() => router.push("/bluetooth-printer" as never)}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.staffChip}
                onPress={() => setStaffDetailVisible(true)}
              >
                <AvatarBadge name={cashierLabel} size={30} bg={BrandColors.buttonSolid} textColor="#fff" />
                <YStack gap={1}>
                  <TextBodySm fontWeight="700" color={BrandColors.text} numberOfLines={1}>
                    {cashierLabel}
                  </TextBodySm>
                  <TextCaption color={BrandColors.textMuted}>Kasir</TextCaption>
                </YStack>
              </TouchableOpacity>
            </View>
          </XStack>
        </XStack>
        </View>

        <View style={styles.sectionDivider} />

        <View style={[styles.navShell, { maxWidth: shellMaxWidth }]}>
        <XStack style={styles.navRow} alignItems="center">
          <XStack style={styles.navItems} flexWrap="wrap" flex={1}>
            {navItems.map((item) => {
              const active = isActive(item);
              const isWebOrders = item.label === "Pesanan Web";
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
                    color={active ? ColorBase.white : BrandColors.textMuted}
                  />
                  <TextBodySm
                    fontWeight="700"
                    color={active ? ColorBase.white : BrandColors.textMuted}
                  >
                    {item.label}
                  </TextBodySm>
                  {isWebOrders && displayWebOrderCount > 0 ? (
                    <View style={styles.navCountBadge}>
                      <TextCaption fontWeight="700" color={ColorBase.white} fontSize={10}>
                        {displayWebOrderCount}
                      </TextCaption>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.readyChip,
              isSiapAntarTabActive && styles.readyChipActive,
            ]}
            onPress={() => router.push(siapAntarHref as never)}
          >
            <Ionicons
              name="restaurant-outline"
              size={16}
              color={
                isSiapAntarTabActive
                  ? BrandColors.deep
                  : BrandColors.textMuted
              }
            />
            <TextBodySm
              fontWeight="700"
              color={
                isSiapAntarTabActive
                  ? BrandColors.deep
                  : BrandColors.textMuted
              }
            >
            Status Dapur
            </TextBodySm>
            
          </TouchableOpacity>

          {isPostPay ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.tagihanChip,
                isTagihanAktifTabActive && styles.tagihanChipActive,
              ]}
              onPress={() => router.push(tagihanAktifHref as never)}
            >
              <Ionicons
                name="receipt-outline"
                size={16}
                color={isTagihanAktifTabActive ? ColorBase.white : BrandColors.textMuted}
              />
              <TextBodySm
                fontWeight="700"
                color={isTagihanAktifTabActive ? ColorBase.white : BrandColors.textMuted}
              >
                Tagihan Aktif
              </TextBodySm>
            </TouchableOpacity>
          ) : null}

          {/* <View style={styles.comingSoonChip}>
            <Ionicons
              name="calendar-clear-outline"
              size={16}
              color={BrandColors.textMuted}
            />
            <TextBodySm fontWeight="700" color={BrandColors.textMuted}>
              Reservasi
            </TextBodySm>
            <TextCaption color={HEADER_TEXT_MUTED}>
              Segera hadir
            </TextCaption>
          </View> */}
          </XStack>

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
                color={BrandColors.deep}
              />
              <TextBodySm fontWeight="700" color={BrandColors.deep}>
                Refresh
              </TextBodySm>
            </TouchableOpacity>
          ) : null}
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
                  onPress={handleSwitchUser}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    color={ColorDanger.danger600}
                  />
                  <TextBodySm fontWeight="700" color={ColorDanger.danger600}>
                    {isShiftStarted ? "Tutup Shift & Login Ulang" : "Ganti User"}
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
    backgroundColor: BrandColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  topShell: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
  },
  navShell: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
  },
  sectionDivider: {
    height: 1,
    width: "100%",
    backgroundColor: ColorNeutral.neutral200,
  },
  topRow: {
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 12,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.tint,
    borderWidth: 1,
    borderColor: BrandColors.border,
    overflow: "hidden",
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  staffChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    maxWidth: 176,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  primaryActionNeutral: {
    backgroundColor: BrandColors.tint,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  primaryActionDanger: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "rgba(220, 80, 60, 0.22)",
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionCircle: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.surface,
  },
  alertDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: BrandColors.coral,
    borderWidth: 2,
    borderColor: BrandColors.surface,
  },
  navRow: {
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  navItems: {
    gap: 8,
    alignItems: "center",
    flex: 1,
  },
  navCountBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.coral,
  },
  navChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  navChipActive: {
    backgroundColor: BrandColors.buttonSolid,
    borderColor: BrandColors.buttonSolid,
  },
  readyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  readyChipActive: {
    backgroundColor: "rgba(4, 120, 87, 0.12)",
    borderColor: "rgba(4, 120, 87, 0.24)",
  },
  tagihanChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  tagihanChipActive: {
    backgroundColor: BrandColors.buttonSolid,
    borderColor: BrandColors.buttonSolid,
  },
  refreshChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  refreshChipDisabled: {
    opacity: 0.55,
  },
  comingSoonChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: BrandColors.surface,
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

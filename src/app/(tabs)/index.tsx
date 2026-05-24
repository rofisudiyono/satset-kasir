import { Ionicons } from "@expo/vector-icons";
import type { ListRenderItem } from "@shopify/flash-list";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, { memo, useCallback, useMemo } from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { TextBodyLg, TextBodySm, TextCaption, TextH1, TextH2 } from "@/components/atoms/Typography";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { usePendingWebOrdersQuery } from "@/hooks/api/use-kasir-api";
import type { PendingWebOrder } from "@/lib/api/types";
import { useAuth } from "@/lib/auth";
import {
  ColorBase,
  ColorNeutral,
  ColorPrimary,
  ColorSuccess,
} from "@/themes/Colors";
import { formatPrice } from "@/utils";

function formatItems(order: PendingWebOrder): string {
  return order.items
    .map(
      (i) => `${i.qty}x ${i.name}${i.variantName ? ` (${i.variantName})` : ""}`,
    )
    .join(", ");
}

const PendingOrderCard = memo(function PendingOrderCard({
  order,
  onPress,
}: {
  order: PendingWebOrder;
  onPress: () => void;
}) {
  const isOnline = order.webPaymentMode === "ONLINE";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.orderCard,
        pressed && styles.orderCardPressed,
      ]}
      onPress={onPress}
    >
      <XStack justifyContent="space-between" alignItems="flex-start">
        <XStack gap={8} alignItems="center" flexWrap="wrap" flex={1}>
          <View style={styles.orderAccent} />
          <View
            style={[
              styles.badge,
              isOnline ? styles.badgeOnline : styles.badgeManual,
            ]}
          >
            <TextCaption
              fontWeight="700"
              color={
                isOnline ? ColorSuccess.success700 : ColorPrimary.primary700
              }
            >
              {isOnline ? "QRIS/VA" : "Manual"}
            </TextCaption>
          </View>
          <TextCaption color={ColorNeutral.neutral500} fontWeight="600">
            {order.orderNumber ?? `#${order.id.slice(0, 8).toUpperCase()}`}
          </TextCaption>
        </XStack>
        <XStack alignItems="center" gap={4}>
          <TextBodyLg fontWeight="800" color={ColorPrimary.primary700}>
            {formatPrice(order.grandTotal)}
          </TextBodyLg>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={ColorNeutral.neutral400}
          />
        </XStack>
      </XStack>

      <YStack gap={2}>
        <TextBodyLg fontWeight="700">
          {[order.tableLabel, order.customerName].filter(Boolean).join(" · ") ||
            "Takeaway"}
        </TextBodyLg>
        {order.customerPhone ? (
          <TextBodySm color="$colorSecondary">{order.customerPhone}</TextBodySm>
        ) : null}
        <TextBodySm color="$colorSecondary" numberOfLines={2}>
          {formatItems(order)}
        </TextBodySm>
        {order.orderNote ? (
          <TextBodySm color="$colorSecondary" fontStyle="italic">
            Catatan: {order.orderNote}
          </TextBodySm>
        ) : null}
      </YStack>
    </Pressable>
  );
});

function ListItemSeparator() {
  return <View style={styles.rowSep} />;
}

export default function WebOrdersTabPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);

  const {
    data = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = usePendingWebOrdersQuery(Boolean(isLoggedIn && isShiftStarted));

  const onNavigate = useCallback(
    (orderId: string) => {
      router.push({
        pathname: "/konfirmasi-web-order",
        params: { pendingId: orderId },
      } as never);
    },
    [router],
  );

  const renderItem = useCallback<ListRenderItem<PendingWebOrder>>(
    ({ item }) => (
      <PendingOrderCard order={item} onPress={() => onNavigate(item.id)} />
    ),
    [onNavigate],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="sync-outline"
              size={28}
              color={ColorPrimary.primary600}
            />
          </View>
          <TextBodySm color="$colorSecondary">Memuat pesanan…</TextBodySm>
        </View>
      );
    }
    if (isError) {
      return <View style={styles.emptyWhenError} />;
    }
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="document-outline"
            size={34}
            color={ColorPrimary.primary600}
          />
        </View>
        <TextBodyLg fontWeight="700" color={ColorPrimary.primary600}>
          Belum ada pesanan
        </TextBodyLg>
        <TextBodySm
          color={ColorNeutral.neutral500}
          textAlign="center"
          style={styles.emptyText}
        >
          Tidak ada pesanan web yang menunggu konfirmasi saat ini.
        </TextBodySm>
      </View>
    );
  }, [isError, isLoading]);

  const listHeader = useMemo(
    () => (
      <YStack gap="$3" marginBottom="$2" style={styles.headerBlock}>
        <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
          <YStack flex={1} gap="$2">
            <TextH1 fontWeight="800" color={ColorPrimary.primary900}>
              Web Orders
            </TextH1>
            <TextBodyLg color={ColorNeutral.neutral600} style={styles.subtitle}>
              Pesanan dari QR/Web menunggu konfirmasi pembayaran kasir.
            </TextBodyLg>
          </YStack>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.refreshPill}
            onPress={() => void refetch()}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={ColorPrimary.primary600}
            />
            <TextBodySm fontWeight="800" color={ColorPrimary.primary600}>
              Refresh
            </TextBodySm>
          </TouchableOpacity>
        </XStack>

        <XStack alignItems="center" justifyContent="space-between">
          <TextH2 fontWeight="800" color={ColorPrimary.primary900}>
            Daftar Pending
          </TextH2>
          <View style={styles.sortPill}>
            <Ionicons
              name="filter-outline"
              size={18}
              color={ColorNeutral.neutral600}
            />
            <TextBodySm fontWeight="700" color={ColorNeutral.neutral600}>
              Terbaru
            </TextBodySm>
          </View>
        </XStack>

        {isError ? (
          <View style={styles.errorBanner}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={ColorPrimary.primary700}
            />
            <TextBodySm color={ColorPrimary.primary700}>
              Gagal memuat data. Tarik untuk coba lagi.
            </TextBodySm>
          </View>
        ) : null}
      </YStack>
    ),
    [isError, refetch],
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={ListItemSeparator}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        drawDistance={400}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={ColorPrimary.primary600}
            colors={[ColorPrimary.primary600]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 112,
  },
  headerBlock: {
    paddingBottom: 8,
  },
  subtitle: {
    lineHeight: 26,
    maxWidth: 280,
  },
  refreshPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: ColorPrimary.primary50,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 2,
  },
  rowSep: {
    height: 12,
  },
  summaryCard: {
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 27,
    marginTop: 18,
    backgroundColor: ColorPrimary.primary700,
    shadowColor: ColorPrimary.primary900,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 7,
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: ColorPrimary.primary50,
  },
  orderCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral100,
    shadowColor: ColorNeutral.neutralShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  orderAccent: {
    width: 8,
    height: 26,
    borderRadius: 999,
    backgroundColor: ColorPrimary.primary600,
  },
  orderCardPressed: {
    opacity: 0.88,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeManual: {
    backgroundColor: ColorPrimary.primary50,
  },
  badgeOnline: {
    backgroundColor: ColorSuccess.success50,
  },
  emptyCard: {
    minHeight: 300,
    backgroundColor: "rgba(255,255,255,0.54)",
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 52,
    gap: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: ColorPrimary.primary200,
  },
  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ColorPrimary.primary50,
    marginBottom: 34,
  },
  emptyText: {
    lineHeight: 25,
  },
  emptyWhenError: {
    minHeight: 8,
  },
});

import { Ionicons } from "@expo/vector-icons";
import type { ListRenderItem } from "@shopify/flash-list";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  AppInput,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH3,
} from "@/components";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { useOrderHistoryQuery } from "@/hooks/api/use-kasir-api";
import type { KasirOrder } from "@/lib/api/types";
import { useAuth } from "@/lib/auth";
import {
  ColorBase,
  ColorDanger,
  ColorNeutral,
  ColorPrimary,
  ColorSuccess,
  ColorWarning,
} from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { formatPrice } from "@/utils";

type HistoryFilter = "SEMUA" | KasirOrder["status"];

function getStatusColor(status: KasirOrder["status"]) {
  if (status === "CANCELLED") return ColorDanger.danger600;
  if (status === "REFUND") return ColorWarning.warning700;
  return ColorSuccess.success600;
}

function getStatusBg(status: KasirOrder["status"]) {
  if (status === "CANCELLED") return ColorDanger.danger50;
  if (status === "REFUND") return ColorWarning.warning50;
  return ColorSuccess.success50;
}

function formatOrderTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const FILTERS: HistoryFilter[] = ["SEMUA", "PAID", "CANCELLED", "REFUND"];

function HistoryListItemSeparator() {
  return <View style={styles.itemSeparator} />;
}

const HistoryOrderCard = memo(function HistoryOrderCard({
  item,
  onPress,
}: {
  item: KasirOrder;
  onPress: () => void;
}) {
  const statusColor = getStatusColor(item.status);
  const statusBg = getStatusBg(item.status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.orderCard,
        pressed && styles.orderCardPressed,
      ]}
    >
      <View style={[styles.statusStripe, { backgroundColor: statusColor }]} />
      <XStack
        flex={1}
        alignItems="flex-start"
        justifyContent="space-between"
        gap="$3"
        padding={16}
        paddingLeft={14}
      >
        <YStack flex={1} minWidth={0} gap={6}>
          <XStack alignItems="center" gap="$2" flexWrap="wrap">
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <TextCaption fontWeight="700" color={statusColor}>
                {item.status}
              </TextCaption>
            </View>
            <TextCaption color={ColorNeutral.neutral500}>
              {formatOrderTime(item.paidAt ?? item.createdAt)}
            </TextCaption>
          </XStack>

          <TextBodyLg fontWeight="700" numberOfLines={1}>
            {item.customerName || item.tableLabel || "Walk-in Customer"}
          </TextBodyLg>

          <TextBodySm color={ColorNeutral.neutral500} numberOfLines={1}>
            {item.items.map((i) => `${i.nameSnapshot} x${i.qty}`).join(" · ")}
          </TextBodySm>
        </YStack>

        <YStack alignItems="flex-end" gap={8}>
          <TextCaption color={ColorNeutral.neutral400}>
            #{item.id.slice(0, 8)}
          </TextCaption>
          <TextBodyLg fontWeight="800" color={BrandColors.deep}>
            {formatPrice(item.grandTotal)}
          </TextBodyLg>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={ColorNeutral.neutral400}
          />
        </YStack>
      </XStack>
    </Pressable>
  );
});

export function OrderHistoryMobileScreen() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const [filter, setFilter] = useState<HistoryFilter>("SEMUA");
  const [searchTerm, setSearchTerm] = useState("");

  const deferredSearchTerm = useDeferredValue(searchTerm.trim());
  const historyParams = useMemo(
    () => ({
      scope: "branch" as const,
      limit: 100,
      q: deferredSearchTerm || undefined,
      status: filter === "SEMUA" ? undefined : filter,
    }),
    [deferredSearchTerm, filter],
  );

  const { data: orders = [], isFetching, isLoading, refetch } = useOrderHistoryQuery(
    isLoggedIn && isShiftStarted,
    historyParams,
  );

  const summaryStats = useMemo(
    () => ({
      total: orders.length,
      paid: orders.filter((o) => o.status === "PAID").length,
      totalRevenue: orders.reduce((sum, o) => sum + o.grandTotal, 0),
    }),
    [orders],
  );

  const renderItem = useCallback<ListRenderItem<KasirOrder>>(
    ({ item }) => (
      <HistoryOrderCard
        item={item}
        onPress={() => router.push(`/mobile/order-detail/${item.id}` as never)}
      />
    ),
    [router],
  );

  const header = useMemo(
    () => (
      <YStack gap="$3">
        <AppInput
          placeholder="Cari order id, pelanggan, atau meja"
          value={searchTerm}
          onChangeText={setSearchTerm}
          leftIcon={
            <Ionicons
              name="search-outline"
              size={18}
              color={ColorNeutral.neutral500}
            />
          }
        />

        <XStack gap="$2" flexWrap="wrap">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                activeOpacity={0.85}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <TextCaption
                  color={active ? ColorBase.white : ColorNeutral.neutral700}
                  fontWeight="700"
                >
                  {f}
                </TextCaption>
              </TouchableOpacity>
            );
          })}
        </XStack>

        <XStack alignItems="center" justifyContent="space-between">
          <TextH3 fontWeight="700">Daftar Order</TextH3>
          <TextCaption color={ColorNeutral.neutral500}>
            {summaryStats.total} hasil
          </TextCaption>
        </XStack>

        {isLoading ? (
          <View style={styles.emptyCard}>
            <TextBodySm color={ColorNeutral.neutral500}>
              Memuat riwayat transaksi...
            </TextBodySm>
          </View>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <TextBodySm color={ColorNeutral.neutral500}>
              Tidak ada transaksi yang cocok dengan pencarian saat ini.
            </TextBodySm>
          </View>
        ) : null}
      </YStack>
    ),
    [filter, isLoading, orders.length, searchTerm, summaryStats.total],
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <FlashList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        ListFooterComponent={<View style={styles.listFooterSpacer} />}
        ItemSeparatorComponent={HistoryListItemSeparator}
        drawDistance={400}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={BrandColors.deep}
            colors={[BrandColors.deep]}
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
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: ColorPrimary.primary600,
    shadowColor: ColorPrimary.primary700,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  metricCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: ColorBase.white,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: ColorBase.white,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  filterChipActive: {
    backgroundColor: ColorPrimary.primary600,
    borderColor: ColorPrimary.primary600,
  },
  orderCard: {
    flexDirection: "row",
    backgroundColor: ColorBase.white,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  orderCardPressed: {
    opacity: 0.82,
  },
  statusStripe: {
    width: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  emptyCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  itemSeparator: {
    height: 12,
  },
  listFooterSpacer: {
    height: 24,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import type { ListRenderItem } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, { memo, useCallback, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  AppButton,
  PageHeader,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH3,
} from "@/components";
import { usePendingWebOrdersQuery } from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import type { PendingWebOrder } from "@/lib/api/types";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSuccess } from "@/themes/Colors";
import { formatPrice } from "@/utils";

function formatItems(order: PendingWebOrder): string {
  return order.items
    .map((i) => `${i.qty}x ${i.name}${i.variantName ? ` (${i.variantName})` : ""}`)
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
      style={({ pressed }) => [styles.orderCard, pressed && styles.orderCardPressed]}
      onPress={onPress}
    >
      <XStack justifyContent="space-between" alignItems="flex-start">
        <XStack gap={8} alignItems="center" flexWrap="wrap" flex={1}>
          <View style={[styles.badge, isOnline ? styles.badgeOnline : styles.badgeManual]}>
            <TextCaption
              fontWeight="700"
              color={isOnline ? ColorSuccess.success700 : ColorPrimary.primary700}
            >
              {isOnline ? "QRIS/VA" : "Manual"}
            </TextCaption>
          </View>
          <TextCaption color={ColorNeutral.neutral500} fontWeight="600">
            #{order.id.slice(0, 8).toUpperCase()}
          </TextCaption>
        </XStack>
        <XStack alignItems="center" gap={4}>
          <TextBodyLg fontWeight="800" color={ColorPrimary.primary700}>
            {formatPrice(order.grandTotal)}
          </TextBodyLg>
          <Ionicons name="chevron-forward" size={18} color={ColorNeutral.neutral400} />
        </XStack>
      </XStack>

      <YStack gap={2}>
        <TextBodyLg fontWeight="700">
          {[order.tableLabel, order.customerName].filter(Boolean).join(" · ") || "Takeaway"}
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

  const { data = [], isLoading, isError, refetch } = usePendingWebOrdersQuery(
    Boolean(isLoggedIn && isShiftStarted),
  );

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
          <TextBodySm color="$colorSecondary">Memuat pesanan…</TextBodySm>
        </View>
      );
    }
    if (isError) {
      return <View style={styles.emptyWhenError} />;
    }
    return (
      <View style={styles.emptyCard}>
        <TextBodySm color="$colorSecondary">
          Tidak ada pesanan web yang menunggu konfirmasi.
        </TextBodySm>
      </View>
    );
  }, [isError, isLoading]);

  const listHeader = useMemo(
    () => (
      <YStack gap="$3" marginBottom="$2">
        <View style={styles.summaryCard}>
          <TextCaption color="rgba(255,255,255,0.8)">Menunggu konfirmasi</TextCaption>
          <TextBodyLg fontWeight="700" color={ColorBase.white}>
            {data.length} pesanan
          </TextBodyLg>
        </View>

        {isError ? (
          <TextBodySm color="$colorSecondary">
            Gagal memuat data. Tarik untuk coba lagi.
          </TextBodySm>
        ) : null}

        <TextH3 fontWeight="700">Daftar Pending</TextH3>
      </YStack>
    ),
    [data.length, isError],
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Web Orders"
        subtitle="Pesanan dari QR/Web menunggu konfirmasi pembayaran kasir"
        actions={
          <AppButton variant="outline" size="sm" onPress={() => void refetch()}>
            Refresh
          </AppButton>
        }
      />

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
    paddingBottom: 32,
  },
  rowSep: {
    height: 12,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: ColorPrimary.primary600,
  },
  orderCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
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
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  emptyWhenError: {
    minHeight: 8,
  },
});

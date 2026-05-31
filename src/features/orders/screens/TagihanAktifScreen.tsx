import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useCallback } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { PageHeader } from "@/components/molecules/PageHeader";
import { TextBodyLg, TextBodySm, TextCaption } from "@/components/atoms/Typography";
import {
  useBillsQuery,
  useUnpaidOrdersQuery,
} from "@/hooks/api/use-kasir-api";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import type { KasirBill, KasirUnpaidOrder } from "@/lib/api/types";
import { ColorNeutral, ColorWarning } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { formatPrice } from "@/utils";


function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <TextCaption fontWeight="700" color={ColorNeutral.neutral500}>
        {title.toUpperCase()}
      </TextCaption>
    </View>
  );
}

function BillCard({
  bill,
  onPress,
}: {
  bill: KasirBill;
  onPress: (bill: KasirBill) => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => onPress(bill)}>
      <View style={styles.cardAccent} />
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} gap={4}>
          <TextBodyLg fontWeight="700">{bill.label}</TextBodyLg>
          {bill.tableLabel ? (
            <TextCaption color={ColorNeutral.neutral500}>{bill.tableLabel}</TextCaption>
          ) : null}
          <TextCaption color={ColorNeutral.neutral500}>{bill.orderCount} pesanan</TextCaption>
        </YStack>
        <YStack alignItems="flex-end" gap={4}>
          <TextBodyLg fontWeight="700" color={BrandColors.green}>
            {formatPrice(bill.unpaidAmount)}
          </TextBodyLg>
          <View style={styles.badgePending}>
            <TextCaption fontWeight="700" color={ColorWarning.warning800}>
              Belum Lunas
            </TextCaption>
          </View>
        </YStack>
      </XStack>
      <XStack marginTop={10} justifyContent="flex-end" alignItems="center" gap={4}>
        <TextCaption color={ColorNeutral.neutral400}>Ketuk untuk detail</TextCaption>
        <Ionicons name="chevron-forward" size={12} color={ColorNeutral.neutral400} />
      </XStack>
    </Pressable>
  );
}

function UnpaidOrderCard({
  order,
  onCollect,
}: {
  order: KasirUnpaidOrder;
  onCollect: (order: KasirUnpaidOrder) => void;
}) {
  const customerLabel = order.customerName?.trim();
  const tableLabel = order.tableLabel || "Takeaway";
  return (
    <View style={styles.card}>
      <View style={styles.cardAccent} />
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} gap={4}>
          <TextBodyLg fontWeight="700">{customerLabel || tableLabel}</TextBodyLg>
          {customerLabel ? (
            <TextCaption color={ColorNeutral.neutral500}>{tableLabel}</TextCaption>
          ) : null}
          <TextBodySm color={ColorNeutral.neutral500} numberOfLines={2}>
            {order.items
              .map(
                (i) =>
                  `${i.nameSnapshot}${i.variantNameSnapshot ? ` (${i.variantNameSnapshot})` : ""} x${i.qty}`,
              )
              .join(", ")}
          </TextBodySm>
        </YStack>
        <YStack alignItems="flex-end" gap={4}>
          <TextBodyLg fontWeight="700" color={BrandColors.green}>
            {formatPrice(order.grandTotal)}
          </TextBodyLg>
          <View style={styles.badgePending}>
            <TextCaption fontWeight="700" color={ColorWarning.warning800}>
              Belum Bayar
            </TextCaption>
          </View>
        </YStack>
      </XStack>
      <XStack marginTop={12} gap={8} justifyContent="flex-end">
        <Pressable
          style={({ pressed }) => [styles.collectButton, pressed && { opacity: 0.7 }]}
          onPress={() => onCollect(order)}
        >
          <Ionicons name="cash-outline" size={14} color={BrandColors.text} />
          <TextCaption fontWeight="700" color={BrandColors.text} marginLeft={4}>
            Tagih Sekarang
          </TextCaption>
        </Pressable>
      </XStack>
    </View>
  );
}

export function TagihanAktifScreen() {
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const router = useRouter();

  const { data: bills = [], isLoading: billsLoading, refetch: refetchBills } = useBillsQuery(isShiftStarted);
  const { data: unpaidOrders = [], isLoading: ordersLoading, refetch: refetchOrders } = useUnpaidOrdersQuery(isShiftStarted);

  const isLoading = billsLoading || ordersLoading;

  const handleRefresh = useCallback(() => {
    void refetchBills();
    void refetchOrders();
  }, [refetchBills, refetchOrders]);

  const handleOpenBill = useCallback(
    (bill: KasirBill) => {
      router.push(`/tagihan/${bill.id}` as never);
    },
    [router],
  );

  const handleCollectOrder = useCallback(
    (order: KasirUnpaidOrder) => {
      const customerLabel = order.customerName?.trim();
      const tableLabel = order.tableLabel || "Takeaway";
      Alert.alert(
        `Tagih ${customerLabel || tableLabel}`,
        `${customerLabel ? `Meja: ${tableLabel}\n` : ""}Total: ${formatPrice(order.grandTotal)}\n\nLanjut ke pembayaran?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Pilih Pembayaran",
            onPress: () =>
              router.push({
                pathname: "/pilih-pembayaran" as never,
                params: { collectOrderId: order.id, grandTotal: String(order.grandTotal) },
              }),
          },
        ],
      );
    },
    [router],
  );

  if (!isShiftStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader title="Tagihan Aktif" />
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={48} color={ColorNeutral.neutral300} />
          <TextBodySm color={ColorNeutral.neutral400} style={styles.emptyText}>
            Buka shift terlebih dahulu untuk melihat tagihan aktif.
          </TextBodySm>
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = bills.length === 0 && unpaidOrders.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Tagihan Aktif" />
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color={ColorNeutral.neutral300} />
            <TextBodySm color={ColorNeutral.neutral400} style={styles.emptyText}>
              Tidak ada tagihan yang menunggu pembayaran.
            </TextBodySm>
          </View>
        ) : null}

        {bills.length > 0 ? (
          <>
            <SectionHeader title="Tagihan Meja" />
            {bills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onPress={handleOpenBill}
              />
            ))}
          </>
        ) : null}

        {unpaidOrders.length > 0 ? (
          <>
            <SectionHeader title="Pesanan Langsung" />
            {unpaidOrders.map((order) => (
              <UnpaidOrderCard
                key={order.id}
                order={order}
                onCollect={handleCollectOrder}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.canvas },
  list: { padding: 16 },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  card: {
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: BrandColors.deep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardPressed: { opacity: 0.85 },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: ColorWarning.warning500,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  badgePending: {
    backgroundColor: ColorWarning.warning100,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.tint,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  collectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.tint,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: { textAlign: "center", marginTop: 12 },
});

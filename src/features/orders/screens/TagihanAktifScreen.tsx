import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useCallback } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  PageHeader,
  TextBodyLg,
  TextBodySm,
  TextCaption,
} from "@/components";
import {
  getApiErrorMessage,
  useUnpaidOrdersQuery,
} from "@/hooks/api/use-kasir-api";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import type { KasirUnpaidOrder } from "@/lib/api/types";
import { ColorNeutral, ColorWarning } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { formatPrice } from "@/utils";

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
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onCollect(order)}
    >
      <View style={styles.cardAccent} />
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} gap={4}>
          <TextBodyLg fontWeight="700">
            {customerLabel || tableLabel}
          </TextBodyLg>
          {customerLabel ? (
            <TextCaption color={ColorNeutral.neutral500}>
              {tableLabel}
            </TextCaption>
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
      <XStack marginTop={12} justifyContent="flex-end">
        <View style={styles.collectButton}>
          <Ionicons name="cash-outline" size={14} color={BrandColors.text} />
          <TextCaption fontWeight="700" color={BrandColors.text} marginLeft={4}>
            Tagih Sekarang
          </TextCaption>
        </View>
      </XStack>
    </Pressable>
  );
}

export function TagihanAktifScreen() {
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const router = useRouter();
  const { data: orders = [], isLoading, refetch } = useUnpaidOrdersQuery(isShiftStarted);

  const handleCollect = useCallback(
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
            onPress: () => {
              router.push({
                pathname: "/pilih-pembayaran" as never,
                params: {
                  collectOrderId: order.id,
                  grandTotal: String(order.grandTotal),
                },
              });
            },
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
          <Ionicons
            name="lock-closed-outline"
            size={48}
            color={ColorNeutral.neutral300}
          />
          <TextBodySm color={ColorNeutral.neutral400} style={styles.emptyText}>
            Buka shift terlebih dahulu untuk melihat tagihan aktif.
          </TextBodySm>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Tagihan Aktif" />
      <FlashList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <UnpaidOrderCard order={item} onCollect={handleCollect} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="checkmark-circle-outline"
              size={48}
              color={ColorNeutral.neutral300}
            />
            <TextBodySm
              color={ColorNeutral.neutral400}
              style={styles.emptyText}
            >
              Tidak ada tagihan yang menunggu pembayaran.
            </TextBodySm>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.canvas },
  list: { padding: 16 },
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

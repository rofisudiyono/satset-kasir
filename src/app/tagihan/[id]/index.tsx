import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { PageHeader } from "@/components/molecules/PageHeader";
import { TextBodyLg, TextBodySm, TextCaption } from "@/components/atoms/Typography";
import { activeBillContextAtom, activeBillIdAtom } from "@/features/cart/store/cart.store";
import { useBillDetailQuery } from "@/hooks/api/use-kasir-api";
import { ColorNeutral, ColorWarning } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { formatPrice } from "@/utils";

export default function TagihanDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setActiveBillId = useSetAtom(activeBillIdAtom);
  const setActiveBillContext = useSetAtom(activeBillContextAtom);

  const { data: bill, isLoading, refetch } = useBillDetailQuery(id ?? null);

  function handleTambahPesanan() {
    if (!bill) return;
    setActiveBillId(bill.id);
    setActiveBillContext({ tableId: bill.tableId, tableLabel: bill.tableLabel });
    router.push("/transaksi-baru" as never);
  }

  function handleTagihSekarang() {
    if (!bill) return;
    router.push({
      pathname: "/pilih-pembayaran" as never,
      params: { collectBillId: bill.id, grandTotal: String(bill.unpaidAmount) },
    });
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader title="Detail Tagihan" showBack onBack={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator color={BrandColors.green} />
        </View>
      </SafeAreaView>
    );
  }

  if (!bill) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader title="Detail Tagihan" showBack onBack={() => router.back()} />
        <View style={styles.center}>
          <TextBodySm color={ColorNeutral.neutral400}>Tagihan tidak ditemukan.</TextBodySm>
        </View>
      </SafeAreaView>
    );
  }

  const isOpen = bill.status === "OPEN";

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title={bill.label} showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refetch()} />}
      >
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack gap={4} flex={1}>
              {bill.tableLabel ? (
                <XStack alignItems="center" gap={6}>
                  <Ionicons name="restaurant-outline" size={14} color={ColorNeutral.neutral500} />
                  <TextBodySm color={ColorNeutral.neutral500}>{bill.tableLabel}</TextBodySm>
                </XStack>
              ) : null}
              <TextCaption color={ColorNeutral.neutral500}>
                {bill.orders.length} pesanan · dibuka sejak{" "}
                {new Date(bill.openedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </TextCaption>
            </YStack>
            <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
              <TextCaption fontWeight="700" color={isOpen ? ColorWarning.warning800 : ColorNeutral.neutral600}>
                {isOpen ? "Belum Lunas" : "Lunas"}
              </TextCaption>
            </View>
          </XStack>

          <View style={styles.totalRow}>
            <TextBodySm color={ColorNeutral.neutral500}>Total Tagihan</TextBodySm>
            <TextBodyLg fontWeight="800" color={BrandColors.green}>
              {formatPrice(bill.unpaidAmount)}
            </TextBodyLg>
          </View>
        </View>

        {/* Order list */}
        <TextCaption fontWeight="700" color={ColorNeutral.neutral500} style={styles.sectionLabel}>
          PESANAN
        </TextCaption>

        {bill.orders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <TextBodySm color={ColorNeutral.neutral400}>Belum ada pesanan dalam tagihan ini.</TextBodySm>
          </View>
        ) : null}

        {bill.orders.map((order, idx) => (
          <View key={order.id} style={styles.orderCard}>
            <XStack justifyContent="space-between" alignItems="center" marginBottom={8}>
              <TextBodySm fontWeight="700">
                Pesanan #{idx + 1}
                {order.orderNumber ? ` · No. ${order.orderNumber}` : ""}
              </TextBodySm>
              <TextBodySm fontWeight="700" color={BrandColors.green}>
                {formatPrice(order.grandTotal)}
              </TextBodySm>
            </XStack>
            <YStack gap={4}>
              {order.items.map((item) => (
                <XStack key={item.id} justifyContent="space-between" alignItems="flex-start">
                  <YStack flex={1} gap={2}>
                    <TextCaption color={ColorNeutral.neutral700}>
                      {item.qty}× {item.nameSnapshot}
                      {item.variantNameSnapshot ? ` (${item.variantNameSnapshot})` : ""}
                    </TextCaption>
                    {item.modifiers.length > 0 ? (
                      <TextCaption color={ColorNeutral.neutral400}>
                        + {item.modifiers.map((m) => m.labelSnapshot).join(", ")}
                      </TextCaption>
                    ) : null}
                    {item.note ? (
                      <TextCaption color={ColorNeutral.neutral400}>Catatan: {item.note}</TextCaption>
                    ) : null}
                  </YStack>
                  <TextCaption color={ColorNeutral.neutral500}>
                    {formatPrice(item.unitPriceSnapshot * item.qty)}
                  </TextCaption>
                </XStack>
              ))}
            </YStack>
          </View>
        ))}
      </ScrollView>

      {isOpen ? (
        <View style={styles.footer}>
          <XStack gap={10}>
            <Pressable
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.75 }]}
              onPress={handleTambahPesanan}
            >
              <Ionicons name="add-circle-outline" size={16} color={BrandColors.green} />
              <TextBodySm fontWeight="700" color={BrandColors.green} marginLeft={6}>
                Tambah Pesanan
              </TextBodySm>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.collectBtn, pressed && { opacity: 0.75 }]}
              onPress={handleTagihSekarang}
            >
              <Ionicons name="cash-outline" size={16} color={BrandColors.text} />
              <TextBodySm fontWeight="700" color={BrandColors.text} marginLeft={6}>
                Tagih Sekarang
              </TextBodySm>
            </Pressable>
          </XStack>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.canvas },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, paddingBottom: 120 },
  summaryCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: BrandColors.deep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statusBadge: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusOpen: { backgroundColor: ColorWarning.warning100 },
  statusClosed: { backgroundColor: ColorNeutral.neutral100 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  sectionLabel: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  orderCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  emptyOrders: {
    padding: 24,
    alignItems: "center",
  },
  footer: {
    backgroundColor: BrandColors.surface,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.tint,
  },
  collectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    backgroundColor: BrandColors.tint,
    borderWidth: 1.5,
    borderColor: BrandColors.border,
  },
});

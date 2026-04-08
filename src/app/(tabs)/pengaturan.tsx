import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { PageHeader, TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components";
import { ensurePosSeedDataAtom, posOrdersAtom } from "@/features/pos/store/pos.store";
import { buildOrderItemsSummary, calculateOrderPaidAmount } from "@/features/pos/pos.utils";
import { shiftDataAtom } from "@/features/shift/store/shift.store";
import { ColorBase, ColorDanger, ColorNeutral, ColorPrimary, ColorWarning } from "@/themes/Colors";
import { formatPrice } from "@/utils";

type HistoryFilter = "SEMUA" | "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";

export default function RiwayatOrderTabPage() {
  const router = useRouter();
  const [orders, setOrders] = useAtom(posOrdersAtom);
  const [shiftData] = useAtom(shiftDataAtom);
  const ensureSeedData = useSetAtom(ensurePosSeedDataAtom);
  const [filter, setFilter] = useState<HistoryFilter>("SEMUA");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    ensureSeedData();
  }, [ensureSeedData]);

  const shiftScopedOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!shiftData?.shiftId) return true;
      if (order.shiftId && order.shiftId === shiftData.shiftId) return true;
      return order.createdAt >= shiftData.openedAt;
    });
  }, [orders, shiftData?.openedAt, shiftData?.shiftId]);

  const filteredOrders = shiftScopedOrders.filter((order) =>
    filter === "SEMUA" ? true : order.status === filter,
  );
  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ||
    filteredOrders[0] ||
    null;

  function updateOrderStatus(orderId: string, nextStatus: "CANCELLED") {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order,
      ),
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Riwayat Order"
        subtitle="Filter default shift aktif atau order hari ini"
      />

      <XStack flex={1}>
        <ScrollView
          style={styles.listPanel}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <XStack gap="$2" flexWrap="wrap">
            {(["SEMUA", "PENDING", "PARTIALLY_PAID", "PAID", "CANCELLED"] as HistoryFilter[]).map((item) => {
              const active = filter === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <TextCaption
                    color={active ? ColorBase.white : ColorNeutral.neutral700}
                    fontWeight="700"
                  >
                    {item}
                  </TextCaption>
                </TouchableOpacity>
              );
            })}
          </XStack>

          {filteredOrders.map((order) => {
            const active = selectedOrder?.id === order.id;
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => setSelectedOrderId(order.id)}
                style={[styles.orderCard, active && styles.orderCardActive]}
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <TextBodyLg fontWeight="700">{order.id}</TextBodyLg>
                  <TextCaption color={ColorPrimary.primary600} fontWeight="700">
                    {order.status}
                  </TextCaption>
                </XStack>
                <TextBodySm color="$colorSecondary">
                  {order.customerName || order.tableLabel || "Tanpa label"}
                </TextBodySm>
                <TextCaption color="$colorSecondary">
                  {buildOrderItemsSummary(order)}
                </TextCaption>
                <XStack justifyContent="space-between">
                  <TextBodySm fontWeight="700">{formatPrice(order.grandTotal)}</TextBodySm>
                  <TextCaption color="$colorSecondary">
                    Dibayar {formatPrice(calculateOrderPaidAmount(order))}
                  </TextCaption>
                </XStack>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.divider} />

        <View style={styles.detailPanel}>
          {!selectedOrder ? (
            <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
              <Ionicons name="receipt-outline" size={28} color={ColorNeutral.neutral400} />
              <TextBodySm color="$colorSecondary">Belum ada order di filter ini.</TextBodySm>
            </YStack>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
              <TextH3 fontWeight="700">Detail Order</TextH3>
              <View style={styles.detailCard}>
                <XStack justifyContent="space-between">
                  <TextBodySm color="$colorSecondary">Order</TextBodySm>
                  <TextBodySm fontWeight="700">{selectedOrder.id}</TextBodySm>
                </XStack>
                <XStack justifyContent="space-between">
                  <TextBodySm color="$colorSecondary">Pelanggan</TextBodySm>
                  <TextBodySm fontWeight="700">
                    {selectedOrder.customerName || selectedOrder.tableLabel || "-"}
                  </TextBodySm>
                </XStack>
                <XStack justifyContent="space-between">
                  <TextBodySm color="$colorSecondary">Status</TextBodySm>
                  <TextBodySm fontWeight="700">{selectedOrder.status}</TextBodySm>
                </XStack>
                <XStack justifyContent="space-between">
                  <TextBodySm color="$colorSecondary">Fulfillment</TextBodySm>
                  <TextBodySm fontWeight="700">{selectedOrder.fulfillment}</TextBodySm>
                </XStack>
              </View>

              <View style={styles.detailCard}>
                <TextH3 fontWeight="700">Item</TextH3>
                {selectedOrder.items.map((item) => (
                  <XStack key={item.id} justifyContent="space-between" marginTop={10}>
                    <YStack flex={1}>
                      <TextBodySm fontWeight="700">
                        {item.name} x{item.qty}
                      </TextBodySm>
                      <TextCaption color="$colorSecondary">
                        {item.note || item.modifierLabels?.join(", ") || "Tanpa catatan"}
                      </TextCaption>
                    </YStack>
                    <TextBodySm fontWeight="700">
                      {formatPrice(item.qty * item.unitPrice)}
                    </TextBodySm>
                  </XStack>
                ))}
              </View>

              <View style={styles.detailCard}>
                <TextH3 fontWeight="700">Pembayaran</TextH3>
                {selectedOrder.payments.length === 0 ? (
                  <TextBodySm color="$colorSecondary" marginTop={10}>
                    Belum ada pembayaran.
                  </TextBodySm>
                ) : (
                  selectedOrder.payments.map((payment) => (
                    <XStack key={payment.id} justifyContent="space-between" marginTop={10}>
                      <YStack flex={1}>
                        <TextBodySm fontWeight="700">{payment.method.toUpperCase()}</TextBodySm>
                        <TextCaption color="$colorSecondary">
                          {payment.label || "Pembayaran"}
                        </TextCaption>
                      </YStack>
                      <TextBodySm fontWeight="700">
                        {formatPrice(payment.amountPaid)}
                      </TextBodySm>
                    </XStack>
                  ))
                )}
              </View>

              <YStack gap="$2">
                {(selectedOrder.status === "PENDING" ||
                  selectedOrder.status === "PARTIALLY_PAID") && (
                  <>
                    <TouchableOpacity
                      onPress={() => updateOrderStatus(selectedOrder.id, "CANCELLED")}
                      style={[styles.actionButton, styles.voidButton]}
                    >
                      <TextBodySm fontWeight="700" color={ColorDanger.danger600}>
                        Void Order
                      </TextBodySm>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/pilih-pembayaran",
                          params: { orderId: selectedOrder.id },
                        })
                      }
                      style={[styles.actionButton, styles.payButton]}
                    >
                      <TextBodySm fontWeight="700" color={ColorPrimary.primary600}>
                        Lunasi dari Riwayat
                      </TextBodySm>
                    </TouchableOpacity>
                  </>
                )}
                {selectedOrder.status === "PAID" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.refundButton]}
                    onPress={() => updateOrderStatus(selectedOrder.id, "CANCELLED")}
                  >
                    <TextBodySm fontWeight="700" color={ColorWarning.warning700}>
                      Refund / Batalkan
                    </TextBodySm>
                  </TouchableOpacity>
                )}
              </YStack>
            </ScrollView>
          )}
        </View>
      </XStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  listPanel: {
    flex: 0.52,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  divider: {
    width: 1,
    backgroundColor: ColorNeutral.neutral200,
  },
  detailPanel: {
    flex: 0.48,
    backgroundColor: ColorBase.white,
  },
  detailContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  filterChip: {
    paddingHorizontal: 12,
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
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  orderCardActive: {
    borderColor: ColorPrimary.primary600,
    backgroundColor: ColorPrimary.primary50,
  },
  detailCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  voidButton: {
    backgroundColor: ColorDanger.danger25,
  },
  payButton: {
    backgroundColor: ColorPrimary.primary50,
  },
  refundButton: {
    backgroundColor: ColorWarning.warning50,
  },
});

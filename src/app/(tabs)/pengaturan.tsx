import { Ionicons } from "@expo/vector-icons";
import { useAtomValue } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { PageHeader, TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components";
import {
  getApiErrorMessage,
  useCancelPaidOrderMutation,
  useDeliverOrderMutation,
  useOrderHistoryQuery,
  useRefundPaidOrderMutation,
} from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import type { KasirOrder } from "@/lib/api/types";
import { ColorBase, ColorDanger, ColorNeutral, ColorPrimary, ColorWarning } from "@/themes/Colors";
import { formatPrice } from "@/utils";

type HistoryFilter = "SEMUA" | KasirOrder["status"];

function getStatusTone(status: KasirOrder["status"]) {
  if (status === "CANCELLED") return ColorDanger.danger600;
  if (status === "REFUND") return ColorWarning.warning700;
  return ColorPrimary.primary600;
}

export default function RiwayatOrderTabPage() {
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const { data: orders = [], isLoading } = useOrderHistoryQuery(isLoggedIn && isShiftStarted);
  const cancelMutation = useCancelPaidOrderMutation();
  const refundMutation = useRefundPaidOrderMutation();
  const deliverMutation = useDeliverOrderMutation();
  const [filter, setFilter] = useState<HistoryFilter>("SEMUA");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(
    () => orders.filter((order) => (filter === "SEMUA" ? true : order.status === filter)),
    [orders, filter],
  );

  useEffect(() => {
    if (filteredOrders.length === 0) {
      setSelectedOrderId(null);
      return;
    }

    if (!selectedOrderId || !filteredOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(filteredOrders[0]?.id ?? null);
    }
  }, [filteredOrders, selectedOrderId]);

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0] ?? null;

  async function handleCancel(orderId: string) {
    try {
      await cancelMutation.mutateAsync({
        orderId,
        reason: "Order dibatalkan dari aplikasi kasir.",
      });
    } catch (error) {
      Alert.alert(
        "Gagal membatalkan order",
        getApiErrorMessage(error, "Order tidak berhasil dibatalkan."),
      );
    }
  }

  async function handleRefund(orderId: string) {
    try {
      await refundMutation.mutateAsync({
        orderId,
        reason: "Refund diproses dari aplikasi kasir.",
      });
    } catch (error) {
      Alert.alert(
        "Gagal refund order",
        getApiErrorMessage(error, "Refund tidak berhasil diproses."),
      );
    }
  }

  async function handleDeliver(orderId: string) {
    try {
      await deliverMutation.mutateAsync(orderId);
    } catch (error) {
      Alert.alert(
        "Gagal menandai diantar",
        getApiErrorMessage(error, "Status pengantaran tidak berhasil diperbarui."),
      );
    }
  }

  function canMarkDelivered(order: KasirOrder) {
    if (order.status !== "PAID") return false;
    const fs = order.fulfillmentStatus ?? "READY";
    return fs !== "DELIVERED";
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Riwayat Order"
        subtitle="Data transaksi shift aktif langsung dari API kasir"
      />

      <XStack flex={1}>
        <ScrollView
          style={styles.listPanel}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <XStack gap="$2" flexWrap="wrap">
            {(["SEMUA", "PAID", "CANCELLED", "REFUND"] as HistoryFilter[]).map((item) => {
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

          {isLoading ? (
            <View style={styles.emptyCard}>
              <TextBodySm color="$colorSecondary">Memuat riwayat transaksi...</TextBodySm>
            </View>
          ) : null}

          {!isLoading && filteredOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <TextBodySm color="$colorSecondary">
                Belum ada transaksi untuk filter ini.
              </TextBodySm>
            </View>
          ) : null}

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
                  <TextCaption color={getStatusTone(order.status)} fontWeight="700">
                    {order.status}
                  </TextCaption>
                </XStack>
                <TextBodySm color="$colorSecondary">
                  {order.customerName || order.tableLabel || "Tanpa label"}
                </TextBodySm>
                <TextCaption color="$colorSecondary" numberOfLines={2}>
                  {order.items
                    .map((item) => `${item.nameSnapshot} x${item.qty}`)
                    .join(", ")}
                </TextCaption>
                <XStack justifyContent="space-between">
                  <TextBodySm fontWeight="700">{formatPrice(order.grandTotal)}</TextBodySm>
                  <TextCaption color="$colorSecondary">
                    {order.paidAt
                      ? new Date(order.paidAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Belum dibayar"}
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
                <XStack justifyContent="space-between" marginTop={8}>
                  <TextBodySm color="$colorSecondary">Sumber</TextBodySm>
                  <TextBodySm fontWeight="700">{selectedOrder.source}</TextBodySm>
                </XStack>
                <XStack justifyContent="space-between" marginTop={8}>
                  <TextBodySm color="$colorSecondary">Pengantaran</TextBodySm>
                  <TextBodySm fontWeight="700">
                    {selectedOrder.fulfillmentStatus === "DELIVERED"
                      ? "Sudah diantar"
                      : selectedOrder.fulfillmentStatus ?? "Siap / belum diantar"}
                  </TextBodySm>
                </XStack>
                <XStack justifyContent="space-between">
                  <TextBodySm color="$colorSecondary">Subtotal</TextBodySm>
                  <TextBodySm fontWeight="700">{formatPrice(selectedOrder.subtotal)}</TextBodySm>
                </XStack>
                <XStack justifyContent="space-between">
                  <TextBodySm color="$colorSecondary">Diskon</TextBodySm>
                  <TextBodySm fontWeight="700">{formatPrice(selectedOrder.discountAmount)}</TextBodySm>
                </XStack>
                <XStack justifyContent="space-between">
                  <TextBodySm color="$colorSecondary">Grand Total</TextBodySm>
                  <TextBodySm fontWeight="700">{formatPrice(selectedOrder.grandTotal)}</TextBodySm>
                </XStack>
              </View>

              <View style={styles.detailCard}>
                <TextH3 fontWeight="700">Item</TextH3>
                {selectedOrder.items.map((item) => (
                  <XStack key={item.id} justifyContent="space-between" marginTop={10}>
                    <YStack flex={1}>
                      <TextBodySm fontWeight="700">
                        {item.nameSnapshot}
                        {item.variantNameSnapshot ? ` (${item.variantNameSnapshot})` : ""} x{item.qty}
                      </TextBodySm>
                      <TextCaption color="$colorSecondary">
                        {item.note || "Tanpa catatan"}
                      </TextCaption>
                    </YStack>
                    <TextBodySm fontWeight="700">
                      {formatPrice(item.qty * item.unitPriceSnapshot)}
                    </TextBodySm>
                  </XStack>
                ))}
              </View>

              <View style={styles.detailCard}>
                <TextH3 fontWeight="700">Pembayaran</TextH3>
                {selectedOrder.payments.map((payment) => (
                  <XStack key={payment.id} justifyContent="space-between" marginTop={10}>
                    <YStack flex={1}>
                      <TextBodySm fontWeight="700">{payment.method}</TextBodySm>
                      <TextCaption color="$colorSecondary">
                        {payment.label || "Pembayaran"}
                      </TextCaption>
                    </YStack>
                    <TextBodySm fontWeight="700">
                      {formatPrice(payment.amountPaid)}
                    </TextBodySm>
                  </XStack>
                ))}
              </View>

              <YStack gap="$2">
                {selectedOrder.status === "PAID" ? (
                  <>
                    {canMarkDelivered(selectedOrder) ? (
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            "Tandai diantar",
                            "Konfirmasi pesanan sudah diserahkan ke pelanggan?",
                            [
                              { text: "Batal", style: "cancel" },
                              {
                                text: "Sudah diantar",
                                onPress: () => void handleDeliver(selectedOrder.id),
                              },
                            ],
                          )
                        }
                        disabled={deliverMutation.isPending}
                        style={[styles.actionButton, styles.deliverButton]}
                      >
                        <TextBodySm fontWeight="700" color={ColorPrimary.primary700}>
                          {deliverMutation.isPending ? "Memproses…" : "Tandai sudah diantar"}
                        </TextBodySm>
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          "Void order",
                          `Batalkan order ${selectedOrder.id}?`,
                          [
                            { text: "Batal", style: "cancel" },
                            {
                              text: "Void",
                              style: "destructive",
                              onPress: () => void handleCancel(selectedOrder.id),
                            },
                          ],
                        )
                      }
                      style={[styles.actionButton, styles.voidButton]}
                    >
                      <TextBodySm fontWeight="700" color={ColorDanger.danger600}>
                        Void Order
                      </TextBodySm>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          "Refund order",
                          `Proses refund untuk ${selectedOrder.id}?`,
                          [
                            { text: "Batal", style: "cancel" },
                            {
                              text: "Refund",
                              onPress: () => void handleRefund(selectedOrder.id),
                            },
                          ],
                        )
                      }
                      style={[styles.actionButton, styles.refundButton]}
                    >
                      <TextBodySm fontWeight="700" color={ColorWarning.warning700}>
                        Refund Order
                      </TextBodySm>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TextCaption color="$colorSecondary" textAlign="center">
                    Status order sudah final dan tidak ada aksi lanjutan.
                  </TextCaption>
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
  deliverButton: {
    backgroundColor: ColorPrimary.primary50,
  },
  refundButton: {
    backgroundColor: ColorWarning.warning50,
  },
  emptyCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
});

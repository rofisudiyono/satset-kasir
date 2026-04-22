import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useAtomValue } from "jotai";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  AppButton,
  PageHeader,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH3,
} from "@/components";
import {
  buildPrintableReceiptOrderFromKasirOrder,
  buildReceiptHtml,
  getReceiptPrintHeightPx,
  getKasirPaymentMethodLabel,
} from "@/features/payment/utils/receipt.utils";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import {
  getApiErrorMessage,
  useCancelPaidOrderMutation,
  useDeliverOrderMutation,
  useOrderDetailQuery,
  useRefundPaidOrderMutation,
  useTenantInfoQuery,
} from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import type { KasirOrder } from "@/lib/api/types";
import {
  ColorBase,
  ColorDanger,
  ColorNeutral,
  ColorPrimary,
  ColorSuccess,
  ColorWarning,
} from "@/themes/Colors";
import { formatPrice } from "@/utils";
import type { PrinterState } from "@/utils/bluetooth-printer";
import { bluetoothPrinterManager } from "@/utils/bluetooth-printer";

function getStatusStyle(status: KasirOrder["status"]) {
  switch (status) {
    case "CANCELLED":
      return {
        bg: ColorDanger.danger50,
        text: ColorDanger.danger700,
        border: ColorDanger.danger100,
        pillBg: ColorDanger.danger600,
      };
    case "REFUND":
      return {
        bg: ColorWarning.warning50,
        text: ColorWarning.warning800,
        border: ColorWarning.warning200,
        pillBg: ColorWarning.warning600,
      };
    default:
      return {
        bg: ColorSuccess.success50,
        text: ColorSuccess.success700,
        border: ColorSuccess.success200,
        pillBg: ColorSuccess.success600,
      };
  }
}

function formatFullDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderDetailMobileScreen({ orderId }: { orderId: string }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);

  const cancelMutation = useCancelPaidOrderMutation();
  const refundMutation = useRefundPaidOrderMutation();
  const deliverMutation = useDeliverOrderMutation();

  const [printerState, setPrinterState] = useState<PrinterState>({
    connected: false,
    printer: null,
    printing: false,
    reconnecting: false,
  });

  useEffect(() => {
    const unsubscribe = bluetoothPrinterManager.subscribe((state) => {
      setPrinterState(state);
    });
    return unsubscribe;
  }, []);

  const { data: order, isLoading } = useOrderDetailQuery(
    isLoggedIn && isShiftStarted,
    orderId,
  );
  const { data: tenantInfo } = useTenantInfoQuery(isLoggedIn && isShiftStarted);

  const printableReceipt = order
    ? buildPrintableReceiptOrderFromKasirOrder(order)
    : null;

  const handlePrintPdf = useCallback(async () => {
    if (!printableReceipt) return;
    try {
      const { uri } = await Print.printToFileAsync({
        html: buildReceiptHtml(printableReceipt, 384, tenantInfo),
        width: 384,
        height: getReceiptPrintHeightPx(printableReceipt),
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        base64: false,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Cetak / Bagikan Invoice",
        });
      } else {
        await Print.printAsync({ uri });
      }
    } catch {
      Alert.alert("Gagal", "Tidak dapat membuka invoice PDF.");
    }
  }, [printableReceipt, tenantInfo]);

  const handleBluetoothPrint = useCallback(async () => {
    const connected =
      printerState.connected ||
      (await bluetoothPrinterManager.autoReconnectLastPrinter());

    if (!connected) {
      router.push("/bluetooth-printer" as never);
      return;
    }
    if (!printableReceipt) return;
    try {
      const currentPrinter = bluetoothPrinterManager.getState().printer;
      const widthPx = currentPrinter?.type === "thermal_80mm" ? 576 : 384;
      const success = await bluetoothPrinterManager.printReceiptHtml(
        buildReceiptHtml(printableReceipt, widthPx, tenantInfo),
      );
      if (success) {
        Alert.alert("Berhasil", "Invoice berhasil dicetak via Bluetooth.");
      }
    } catch (error) {
      console.error("Bluetooth print error:", error);
      Alert.alert("Cetak gagal", "Terjadi kesalahan saat mencetak invoice.");
    }
  }, [printableReceipt, printerState.connected, printerState.printer?.type, router, tenantInfo]);

  const handleCancel = useCallback(() => {
    Alert.alert("Void Order", `Batalkan order #${orderId.slice(0, 8)}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Void",
        style: "destructive",
        onPress: () => {
          void cancelMutation
            .mutateAsync({
              orderId,
              reason: "Order dibatalkan dari aplikasi kasir.",
            })
            .then(() => router.back())
            .catch((error: unknown) => {
              Alert.alert(
                "Gagal membatalkan",
                getApiErrorMessage(error, "Order tidak berhasil dibatalkan."),
              );
            });
        },
      },
    ]);
  }, [cancelMutation, orderId, router]);

  const handleRefund = useCallback(() => {
    Alert.alert("Refund Order", `Proses refund untuk #${orderId.slice(0, 8)}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Refund",
        onPress: () => {
          void refundMutation
            .mutateAsync({
              orderId,
              reason: "Refund diproses dari aplikasi kasir.",
            })
            .catch((error: unknown) => {
              Alert.alert(
                "Gagal refund",
                getApiErrorMessage(error, "Refund tidak berhasil diproses."),
              );
            });
        },
      },
    ]);
  }, [refundMutation, orderId]);

  const handleDeliver = useCallback(() => {
    Alert.alert(
      "Tandai Diantar",
      "Konfirmasi pesanan sudah diserahkan ke pelanggan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Sudah Diantar",
          onPress: () => {
            void deliverMutation.mutateAsync(orderId).catch((error: unknown) => {
              Alert.alert(
                "Gagal",
                getApiErrorMessage(
                  error,
                  "Status pengantaran tidak berhasil diperbarui.",
                ),
              );
            });
          },
        },
      ],
    );
  }, [deliverMutation, orderId]);

  const canMarkDelivered =
    order?.status === "PAID" &&
    (order.fulfillmentStatus ?? "READY") !== "DELIVERED";

  // Bottom bar height — 2 print buttons + optional action rows
  const bottomBarPaddingBottom = insets.bottom + 16;

  if (isLoading || !order) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <PageHeader
          title="Detail Order"
          showBack
          onBack={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ColorPrimary.primary600} />
          <TextBodySm
            color={ColorNeutral.neutral500}
            style={{ marginTop: 12 }}
          >
            Memuat detail order...
          </TextBodySm>
        </View>
      </SafeAreaView>
    );
  }

  const ss = getStatusStyle(order.status);
  const totalPaid = order.payments.reduce((s, p) => s + p.amountPaid, 0);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <PageHeader
        title="Detail Order"
        showBack
        onBack={() => router.back()}
        actions={
          <View style={[styles.orderIdChip]}>
            <TextCaption fontWeight="700" color={ColorPrimary.primary700}>
              #{order.id.slice(0, 8)}
            </TextCaption>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Status Hero ── */}
        <View
          style={[
            styles.statusHero,
            { backgroundColor: ss.bg, borderColor: ss.border },
          ]}
        >
          <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
            <YStack flex={1} gap={6}>
              <View style={[styles.statusPill, { backgroundColor: ss.pillBg }]}>
                <TextCaption
                  fontWeight="800"
                  color={ColorBase.white}
                  style={styles.statusPillText}
                >
                  {order.status}
                </TextCaption>
              </View>
              <TextBodyLg fontWeight="800" color={ss.text}>
                {order.customerName || order.tableLabel || "Walk-in Customer"}
              </TextBodyLg>
              <TextBodySm color={ss.text} style={{ opacity: 0.7 }}>
                {formatFullDate(order.paidAt ?? order.createdAt)}
              </TextBodySm>
              <TextCaption color={ss.text} style={{ opacity: 0.6 }}>
                {order.source === "WEB" ? "Pesanan Web" : "Walk-in"}{" "}
                {order.paymentStatus ? `· ${order.paymentStatus}` : ""}
              </TextCaption>
            </YStack>

            <YStack alignItems="flex-end" gap={4}>
              <Text style={[styles.heroPrice, { color: ss.text }]}>
                {formatPrice(order.grandTotal)}
              </Text>
              {order.voidReason ? (
                <TextCaption
                  color={ss.text}
                  style={{ opacity: 0.65, maxWidth: 120 }}
                  numberOfLines={2}
                >
                  {order.voidReason}
                </TextCaption>
              ) : null}
            </YStack>
          </XStack>
        </View>

        {/* ── Items ── */}
        <View style={styles.section}>
          <TextH3 fontWeight="700" style={styles.sectionHeading}>
            Item Pesanan
          </TextH3>
          {order.items.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx > 0 && <View style={styles.rowDivider} />}
              <XStack
                justifyContent="space-between"
                alignItems="flex-start"
                gap="$3"
                paddingVertical={11}
              >
                <YStack flex={1} gap={3}>
                  <TextBodyLg fontWeight="700">
                    {item.nameSnapshot}
                    {item.variantNameSnapshot
                      ? ` (${item.variantNameSnapshot})`
                      : ""}
                  </TextBodyLg>
                  {item.modifiers?.length ? (
                    <TextCaption color={ColorNeutral.neutral500}>
                      +{" "}
                      {item.modifiers
                        .map((m) => m.labelSnapshot)
                        .join(", ")}
                    </TextCaption>
                  ) : null}
                  {item.note ? (
                    <TextCaption
                      color={ColorNeutral.neutral500}
                      style={{ fontStyle: "italic" }}
                    >
                      "{item.note}"
                    </TextCaption>
                  ) : null}
                  <TextCaption color={ColorNeutral.neutral400}>
                    {formatPrice(item.unitPriceSnapshot)} × {item.qty}
                  </TextCaption>
                </YStack>
                <Text style={styles.monoAmt}>
                  {formatPrice(item.qty * item.unitPriceSnapshot)}
                </Text>
              </XStack>
            </React.Fragment>
          ))}
        </View>

        {/* ── Summary ── */}
        <View style={styles.section}>
          <TextH3 fontWeight="700" style={styles.sectionHeading}>
            Ringkasan
          </TextH3>

          <XStack justifyContent="space-between" paddingVertical={9}>
            <TextBodySm color={ColorNeutral.neutral500}>Subtotal</TextBodySm>
            <Text style={styles.monoAmt}>{formatPrice(order.subtotal)}</Text>
          </XStack>

          {order.discountAmount > 0 ? (
            <>
              <View style={styles.rowDivider} />
              <XStack justifyContent="space-between" paddingVertical={9}>
                <TextBodySm color={ColorNeutral.neutral500}>Diskon</TextBodySm>
                <Text style={[styles.monoAmt, { color: ColorSuccess.success600 }]}>
                  -{formatPrice(order.discountAmount)}
                </Text>
              </XStack>
            </>
          ) : null}

          <View style={styles.rowDivider} />
          <XStack justifyContent="space-between" paddingVertical={9}>
            <TextBodySm color={ColorNeutral.neutral500}>Pajak</TextBodySm>
            <Text style={styles.monoAmt}>{formatPrice(order.taxAmount)}</Text>
          </XStack>

          <View style={styles.totalDivider} />
          <XStack justifyContent="space-between" paddingVertical={10}>
            <TextBodyLg fontWeight="800">TOTAL</TextBodyLg>
            <Text
              style={[
                styles.monoAmt,
                {
                  fontSize: 15,
                  fontWeight: "800",
                  color: ColorPrimary.primary700,
                },
              ]}
            >
              {formatPrice(order.grandTotal)}
            </Text>
          </XStack>
        </View>

        {/* ── Payment ── */}
        <View style={styles.section}>
          <TextH3 fontWeight="700" style={styles.sectionHeading}>
            Pembayaran
          </TextH3>
          {order.payments.map((payment, idx) => {
            const change =
              payment.method === "CASH" && payment.amountReceived != null
                ? Math.max(0, payment.amountReceived - payment.amountPaid)
                : null;
            return (
              <React.Fragment key={payment.id}>
                {idx > 0 && <View style={styles.rowDivider} />}
                <YStack gap={4} paddingVertical={10}>
                  <XStack justifyContent="space-between" alignItems="center">
                    <TextBodySm fontWeight="700">
                      {getKasirPaymentMethodLabel(payment.method)}
                    </TextBodySm>
                    <Text style={styles.monoAmt}>
                      {formatPrice(payment.amountPaid)}
                    </Text>
                  </XStack>
                  {payment.label ? (
                    <TextCaption color={ColorNeutral.neutral500}>
                      {payment.label}
                    </TextCaption>
                  ) : null}
                  {payment.amountReceived != null &&
                  payment.method === "CASH" ? (
                    <XStack justifyContent="space-between">
                      <TextCaption color={ColorNeutral.neutral400}>
                        Uang diterima
                      </TextCaption>
                      <TextCaption
                        fontWeight="600"
                        color={ColorNeutral.neutral700}
                      >
                        {formatPrice(payment.amountReceived)}
                      </TextCaption>
                    </XStack>
                  ) : null}
                  {change != null ? (
                    <XStack justifyContent="space-between">
                      <TextCaption color={ColorNeutral.neutral400}>
                        Kembalian
                      </TextCaption>
                      <TextCaption
                        fontWeight="600"
                        color={ColorNeutral.neutral700}
                      >
                        {formatPrice(change)}
                      </TextCaption>
                    </XStack>
                  ) : null}
                </YStack>
              </React.Fragment>
            );
          })}

          {order.payments.length > 1 ? (
            <>
              <View style={styles.totalDivider} />
              <XStack justifyContent="space-between" paddingVertical={9}>
                <TextBodySm fontWeight="700">Total Dibayar</TextBodySm>
                <Text
                  style={[
                    styles.monoAmt,
                    { fontWeight: "700", color: ColorPrimary.primary700 },
                  ]}
                >
                  {formatPrice(totalPaid)}
                </Text>
              </XStack>
            </>
          ) : null}
        </View>

        {/* spacer untuk bottom bar */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: bottomBarPaddingBottom },
        ]}
      >
        <XStack gap="$2" marginBottom="$2">
          <View style={{ flex: 1 }}>
            <AppButton
              title="Print PDF"
              variant="primary"
              disabled={!printableReceipt}
              onPress={() => void handlePrintPdf()}
              icon={
                <Ionicons
                  name="print-outline"
                  size={16}
                  color={ColorBase.white}
                />
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              title={
                printerState.reconnecting
                  ? "Menyambung..."
                  : printerState.connected
                    ? "Print BT"
                    : "Hubungkan BT"
              }
              variant="outline"
              disabled={printerState.connected && !printableReceipt}
              onPress={() => void handleBluetoothPrint()}
              icon={
                <Ionicons
                  name="radio-outline"
                  size={16}
                  color={ColorPrimary.primary600}
                />
              }
            />
          </View>
        </XStack>

        {order.status === "PAID" ? (
          <YStack gap="$2">
            {canMarkDelivered ? (
              <TouchableOpacity
                onPress={handleDeliver}
                disabled={deliverMutation.isPending}
                style={[styles.actionBtn, styles.deliverBtn]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={ColorPrimary.primary700}
                />
                <TextBodySm fontWeight="700" color={ColorPrimary.primary700}>
                  {deliverMutation.isPending
                    ? "Memproses…"
                    : "Tandai sudah diantar"}
                </TextBodySm>
              </TouchableOpacity>
            ) : null}

            <XStack gap="$2">
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.actionBtn, styles.voidBtn, { flex: 1 }]}
              >
                <TextBodySm fontWeight="700" color={ColorDanger.danger600}>
                  Void Order
                </TextBodySm>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRefund}
                style={[styles.actionBtn, styles.refundBtn, { flex: 1 }]}
              >
                <TextBodySm fontWeight="700" color={ColorWarning.warning700}>
                  Refund Order
                </TextBodySm>
              </TouchableOpacity>
            </XStack>
          </YStack>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
  },
  orderIdChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: ColorPrimary.primary50,
    borderWidth: 1,
    borderColor: ColorPrimary.primary100,
  },
  statusHero: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    letterSpacing: 0.8,
  },
  heroPrice: {
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  section: {
    backgroundColor: ColorBase.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  sectionHeading: {
    marginBottom: 6,
  },
  rowDivider: {
    height: 1,
    backgroundColor: ColorNeutral.neutral100,
  },
  totalDivider: {
    height: 1,
    backgroundColor: ColorNeutral.neutral300,
    marginVertical: 2,
  },
  monoAmt: {
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "600",
    color: ColorNeutral.neutral800,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ColorBase.white,
    paddingTop: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: ColorNeutral.neutral200,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  deliverBtn: {
    backgroundColor: ColorPrimary.primary50,
    borderColor: ColorPrimary.primary100,
  },
  voidBtn: {
    backgroundColor: ColorDanger.danger25,
    borderColor: ColorDanger.danger100,
  },
  refundBtn: {
    backgroundColor: ColorWarning.warning50,
    borderColor: ColorWarning.warning100,
  },
});

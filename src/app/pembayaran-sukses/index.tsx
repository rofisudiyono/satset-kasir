import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH2,
  TextH3,
} from "@/components";
import { cartAtom } from "@/features/cart/store/cart.store";
import {
  buildReceiptHtml,
  getReceiptPrintHeightPx,
} from "@/features/payment/utils/receipt.utils";
import {
  buildOrderItemsSummary,
  calculateOrderPaidAmount,
  getPaymentMethodLabel,
} from "@/features/pos/pos.utils";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import { useTenantInfoQuery } from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { useAuth } from "@/lib/auth";
import {
  getHistoryRoute,
  getInputManualRoute,
} from "@/lib/routing/device-routes";
import {
  ColorBase,
  ColorDanger,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
  ColorSuccess,
  ColorWarning,
} from "@/themes/Colors";
import { formatPrice } from "@/utils";
import type { PrinterState } from "@/utils/bluetooth-printer";
import { bluetoothPrinterManager } from "@/utils/bluetooth-printer";

export default function PembayaranSuksesPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [orders] = useAtom(posOrdersAtom);
  const [, setCart] = useAtom(cartAtom);
  const { isTablet } = useResponsiveLayout();
  const { data: tenantInfo } = useTenantInfoQuery(isLoggedIn);
  const [printerState, setPrinterState] = useState<PrinterState>({
    connected: false,
    printer: null,
    printing: false,
  });

  const params = useLocalSearchParams<{ orderId: string; paymentId?: string }>();

  useEffect(() => {
    const unsubscribe = bluetoothPrinterManager.subscribe((state) => {
      setPrinterState(state);
    });
    return unsubscribe;
  }, []);

  const order = orders.find((item) => item.id === params.orderId);
  const payment = order?.payments.find((item) => item.id === params.paymentId);

  if (!order) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.missingState}>
          <TextBodySm color={ColorNeutral.neutral500}>
            Order tidak ditemukan.
          </TextBodySm>
        </View>
      </SafeAreaView>
    );
  }

  const receiptItems = order.items.map((item) => ({
    name: item.modifierLabels?.[0]
      ? `${item.name} (${item.modifierLabels[0]})`
      : item.name,
    qty: item.qty,
    price: item.unitPrice * item.qty,
  }));

  const subtotal = order.subtotal;
  const discount = order.discountAmount;
  const ppn = order.taxAmount;
  const totalPaid = calculateOrderPaidAmount(order);
  const remaining = Math.max(0, order.grandTotal - totalPaid);
  const paymentAmount = payment?.amountPaid ?? 0;
  const received = payment?.amountReceived ?? paymentAmount;
  const change = payment?.amountReceived
    ? Math.max(0, payment.amountReceived - payment.amountPaid)
    : 0;
  const methodLabel = payment
    ? getPaymentMethodLabel(payment.method)
    : "Pembayaran";

  const receiptPayload = React.useMemo(
    () => ({
      orderNumber: order.id,
      dateTime: new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(new Date(payment?.paidAt ?? order.createdAt)),
      items: receiptItems,
      subtotal,
      discount,
      tax: ppn,
      grandTotal: order.grandTotal,
      paymentMethod: methodLabel,
      amountPaid: paymentAmount,
      totalPaid,
      remaining,
      cashReceived: payment?.method === "tunai" ? received : undefined,
      change: payment?.method === "tunai" ? change : undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [order.id],
  );

  const dateStr = new Date(
    payment?.paidAt ?? order.createdAt,
  ).toLocaleString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  function handleNewTransaction() {
    setCart([]);
    router.replace(getInputManualRoute(isTablet) as never);
  }

  function handleGoRiwayat() {
    setCart([]);
    router.replace(getHistoryRoute(isTablet) as never);
  }

  async function handlePrintPdf() {
    try {
      const { uri } = await Print.printToFileAsync({
        html: buildReceiptHtml(receiptPayload, 384, tenantInfo),
        width: 384,
        height: getReceiptPrintHeightPx(receiptPayload),
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        base64: false,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Cetak / Bagikan Struk",
        });
      } else {
        await Print.printAsync({ uri });
      }
    } catch {
      Alert.alert("Gagal", "Tidak dapat membuka struk PDF.");
    }
  }

  async function handleBluetoothPrint() {
    if (!printerState.connected) {
      router.push("/bluetooth-printer" as never);
      return;
    }
    try {
      const widthPx =
        printerState.printer?.type === "thermal_80mm" ? 576 : 384;
      const success = await bluetoothPrinterManager.printReceiptHtml(
        buildReceiptHtml(receiptPayload, widthPx, tenantInfo),
      );
      if (success) {
        Alert.alert("Berhasil", "Struk berhasil dicetak via Bluetooth.");
      }
    } catch (error) {
      console.error("Bluetooth print error:", error);
      Alert.alert("Cetak Gagal", "Terjadi kesalahan saat mencetak.");
    }
  }

  const isPaid = remaining === 0;

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Success Header ── */}
        <View style={[styles.successCard, isPaid ? styles.successCardPaid : styles.successCardPartial]}>
          <XStack alignItems="center" gap={14}>
            <View style={[styles.checkCircle, isPaid ? styles.checkCirclePaid : styles.checkCirclePartial]}>
              <Ionicons name="checkmark" size={22} color={ColorBase.white} />
            </View>
            <YStack flex={1} gap={2}>
              <TextH3 fontWeight="800" color={isPaid ? ColorSuccess.success700 : ColorWarning.warning800}>
                {isPaid ? "Pembayaran Berhasil" : "Pembayaran Tercatat"}
              </TextH3>
              <TextBodySm color={isPaid ? ColorSuccess.success600 : ColorWarning.warning700} style={{ opacity: 0.85 }}>
                {order.customerName || order.tableLabel || "Walk-in"} · {methodLabel}
              </TextBodySm>
              <TextCaption color={isPaid ? ColorSuccess.success600 : ColorWarning.warning700} style={{ opacity: 0.65 }}>
                {dateStr} WIB
              </TextCaption>
            </YStack>
            <YStack alignItems="flex-end" gap={2}>
              <Text style={[styles.bigAmount, { color: isPaid ? ColorSuccess.success700 : ColorWarning.warning800 }]}>
                {formatPrice(paymentAmount)}
              </Text>
              {remaining > 0 && (
                <TextCaption color={ColorDanger.danger600} fontWeight="700">
                  Sisa {formatPrice(remaining)}
                </TextCaption>
              )}
            </YStack>
          </XStack>
        </View>

        {/* ── Print Actions ── */}
        <View style={styles.printRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.printBtnPrimary}
            onPress={() => void handlePrintPdf()}
          >
            <Ionicons name="print-outline" size={17} color={ColorBase.white} />
            <TextBodySm fontWeight="700" color={ColorBase.white}>
              Cetak PDF
            </TextBodySm>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.printBtnBt,
              printerState.connected && styles.printBtnBtConnected,
              printerState.printing && styles.printBtnDisabled,
            ]}
            onPress={() => void handleBluetoothPrint()}
            disabled={printerState.printing}
          >
            {printerState.printing ? (
              <ActivityIndicator size="small" color={ColorBase.white} />
            ) : (
              <>
                <Ionicons
                  name={printerState.connected ? "bluetooth" : "bluetooth-outline"}
                  size={17}
                  color={printerState.connected ? ColorBase.white : ColorPrimary.primary600}
                />
                <TextBodySm
                  fontWeight="700"
                  color={printerState.connected ? ColorBase.white : ColorPrimary.primary600}
                >
                  {printerState.connected ? "Cetak BT" : "Hubungkan BT"}
                </TextBodySm>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Item List ── */}
        <View style={styles.section}>
          <TextBodySm fontWeight="700" color={ColorNeutral.neutral500} style={styles.sectionLabel}>
            ITEM PESANAN
          </TextBodySm>
          {receiptItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <View style={styles.divider} />}
              <XStack
                justifyContent="space-between"
                alignItems="center"
                paddingVertical={10}
                gap="$3"
              >
                <YStack flex={1} gap={2}>
                  <TextBodySm fontWeight="600">{item.name}</TextBodySm>
                  <TextCaption color={ColorNeutral.neutral400}>× {item.qty}</TextCaption>
                </YStack>
                <Text style={styles.monoAmt}>{formatPrice(item.price)}</Text>
              </XStack>
            </React.Fragment>
          ))}
        </View>

        {/* ── Summary ── */}
        <View style={styles.section}>
          <TextBodySm fontWeight="700" color={ColorNeutral.neutral500} style={styles.sectionLabel}>
            RINGKASAN
          </TextBodySm>

          <XStack justifyContent="space-between" paddingVertical={9}>
            <TextBodySm color={ColorNeutral.neutral500}>Subtotal</TextBodySm>
            <Text style={styles.monoAmt}>{formatPrice(subtotal)}</Text>
          </XStack>

          {discount > 0 && (
            <>
              <View style={styles.divider} />
              <XStack justifyContent="space-between" paddingVertical={9}>
                <TextBodySm color={ColorNeutral.neutral500}>Diskon</TextBodySm>
                <Text style={[styles.monoAmt, { color: ColorSuccess.success600 }]}>
                  -{formatPrice(discount)}
                </Text>
              </XStack>
            </>
          )}

          <View style={styles.divider} />
          <XStack justifyContent="space-between" paddingVertical={9}>
            <TextBodySm color={ColorNeutral.neutral500}>Pajak</TextBodySm>
            <Text style={styles.monoAmt}>{formatPrice(ppn)}</Text>
          </XStack>

          <View style={styles.totalDivider} />
          <XStack justifyContent="space-between" paddingVertical={11}>
            <TextBodyLg fontWeight="800">Total</TextBodyLg>
            <Text style={[styles.monoAmt, { fontSize: 15, fontWeight: "800", color: ColorNeutral.neutral900 }]}>
              {formatPrice(order.grandTotal)}
            </Text>
          </XStack>

          <View style={styles.divider} />
          <XStack justifyContent="space-between" paddingVertical={9}>
            <TextBodySm color={ColorNeutral.neutral500}>Metode</TextBodySm>
            <TextBodySm fontWeight="700">{methodLabel}</TextBodySm>
          </XStack>

          <View style={styles.divider} />
          <XStack justifyContent="space-between" paddingVertical={9}>
            <TextBodySm color={ColorNeutral.neutral500}>Pembayaran ini</TextBodySm>
            <Text style={[styles.monoAmt, { color: ColorPrimary.primary700, fontWeight: "700" }]}>
              {formatPrice(paymentAmount)}
            </Text>
          </XStack>

          {payment?.method === "tunai" && received > 0 && (
            <>
              <View style={styles.divider} />
              <XStack justifyContent="space-between" paddingVertical={9}>
                <TextBodySm color={ColorNeutral.neutral500}>Uang diterima</TextBodySm>
                <Text style={styles.monoAmt}>{formatPrice(received)}</Text>
              </XStack>
              <View style={styles.divider} />
              <XStack justifyContent="space-between" paddingVertical={9}>
                <TextBodySm color={ColorNeutral.neutral500}>Kembalian</TextBodySm>
                <Text style={[styles.monoAmt, { color: ColorGreen.green600, fontWeight: "700" }]}>
                  {formatPrice(change)}
                </Text>
              </XStack>
            </>
          )}

          {remaining > 0 && (
            <>
              <View style={styles.divider} />
              <XStack justifyContent="space-between" paddingVertical={9}>
                <TextBodySm color={ColorNeutral.neutral500}>Sisa tagihan</TextBodySm>
                <Text style={[styles.monoAmt, { color: ColorDanger.danger600, fontWeight: "700" }]}>
                  {formatPrice(remaining)}
                </Text>
              </XStack>
            </>
          )}
        </View>

        {/* ── Next Actions ── */}
        <YStack gap="$2">
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.btnPrimary}
            onPress={handleNewTransaction}
          >
            <Ionicons name="add-circle-outline" size={18} color={ColorBase.white} />
            <TextBodyLg fontWeight="700" color={ColorBase.white}>
              Input Manual Baru
            </TextBodyLg>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.btnSecondary}
            onPress={handleGoRiwayat}
          >
            <TextBodySm fontWeight="700" color={ColorPrimary.primary600}>
              Lihat Riwayat Order
            </TextBodySm>
          </TouchableOpacity>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  missingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    padding: 16,
    paddingBottom: 36,
    gap: 12,
  },

  // Success header
  successCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  successCardPaid: {
    backgroundColor: ColorSuccess.success50,
    borderColor: ColorSuccess.success200,
  },
  successCardPartial: {
    backgroundColor: ColorWarning.warning50,
    borderColor: ColorWarning.warning200,
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCirclePaid: {
    backgroundColor: ColorSuccess.success600,
  },
  checkCirclePartial: {
    backgroundColor: ColorWarning.warning600,
  },
  bigAmount: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "monospace",
  },

  // Print row
  printRow: {
    flexDirection: "row",
    gap: 10,
  },
  printBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: ColorPrimary.primary600,
  },
  printBtnBt: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ColorPrimary.primary200,
    backgroundColor: ColorBase.white,
  },
  printBtnBtConnected: {
    backgroundColor: ColorSuccess.success600,
    borderColor: ColorSuccess.success600,
  },
  printBtnDisabled: {
    opacity: 0.6,
  },

  // Sections
  section: {
    backgroundColor: ColorBase.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  sectionLabel: {
    letterSpacing: 0.6,
    paddingTop: 14,
    paddingBottom: 2,
  },
  divider: {
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

  // Next actions
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: ColorGreen.green600,
  },
  btnSecondary: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: ColorBase.white,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
});

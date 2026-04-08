import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useAtom } from "jotai";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  BarcodePlaceholder,
  DottedSeparator,
  PageHeader,
  TextBody,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH2,
  TextH3,
} from "@/components";
import { cartAtom } from "@/features/cart/store/cart.store";
import { storeInfo } from "@/features/payment/api/receipt.data";
import {
  buildOrderItemsSummary,
  calculateOrderPaidAmount,
  getPaymentMethodLabel,
} from "@/features/pos/pos.utils";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import {
  ColorBase,
  ColorDanger,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
} from "@/themes/Colors";
import { formatPrice, getCurrentDateTime } from "@/utils";

type ReceiptView = "summary" | "receipt";

export default function PembayaranSuksesPage() {
  const router = useRouter();
  const [orders] = useAtom(posOrdersAtom);
  const [, setCart] = useAtom(cartAtom);
  const { isTablet, contentMaxWidth, horizontalPadding } =
    useResponsiveLayout();
  const [activeView, setActiveView] = useState<ReceiptView>("summary");
  const params = useLocalSearchParams<{
    orderId: string;
    paymentId?: string;
  }>();

  const order = orders.find((item) => item.id === params.orderId);
  const payment = order?.payments.find((item) => item.id === params.paymentId);
  const dateTime = React.useMemo(() => getCurrentDateTime(), []);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.missingState}>
          <YStack alignItems="center" gap="$3">
            <TextBodySm color="$colorSecondary">
              Order tidak ditemukan.
            </TextBodySm>
          </YStack>
        </ScrollView>
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
    ? payment.amountReceived - payment.amountPaid
    : 0;
  const methodLabel = payment
    ? getPaymentMethodLabel(payment.method)
    : "Pembayaran";

  function handleNewTransaction() {
    setCart([]);
    router.replace("/(tabs)/transaksi" as never);
  }

  function handleGoRiwayat() {
    setCart([]);
    router.replace("/(tabs)/pengaturan" as never);
  }

  function buildReceiptHtml() {
    const itemsHtml = receiptItems
      .map(
        (item) =>
          `<tr><td>${item.name} x${item.qty}</td><td style="text-align:right">${formatPrice(item.price)}</td></tr>`,
      )
      .join("");
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            body { font-family: monospace; width: 280px; margin: 0 auto; font-size: 12px; }
            h2 { text-align: center; margin: 4px 0; font-size: 14px; }
            p { text-align: center; margin: 2px 0; font-size: 11px; }
            hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; }
            .total { font-weight: bold; font-size: 13px; }
          </style>
        </head>
        <body>
          <h2>${storeInfo.name}</h2>
          <p>${storeInfo.address}</p>
          <p>${storeInfo.phone}</p>
          <hr/>
          <p>No. Order: ${order.id}</p>
          <p>${dateTime}</p>
          <hr/>
          <table>${itemsHtml}</table>
          <hr/>
          <table>
            <tr><td>Subtotal</td><td style="text-align:right">${formatPrice(subtotal)}</td></tr>
            ${discount > 0 ? `<tr><td>Diskon</td><td style="text-align:right">-${formatPrice(discount)}</td></tr>` : ""}
            <tr><td>PPN 11%</td><td style="text-align:right">${formatPrice(ppn)}</td></tr>
            <tr class="total"><td>TOTAL</td><td style="text-align:right">${formatPrice(order.grandTotal)}</td></tr>
            <tr><td>Dibayar</td><td style="text-align:right">${formatPrice(paymentAmount)}</td></tr>
            <tr><td>Sisa</td><td style="text-align:right">${formatPrice(remaining)}</td></tr>
          </table>
        </body>
      </html>
    `;
  }

  async function handlePrint() {
    try {
      const { uri } = await Print.printToFileAsync({
        html: buildReceiptHtml(),
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

  async function handleShare() {
    const text = `Order ${order.id}\n${buildOrderItemsSummary(order)}\nDibayar: ${formatPrice(paymentAmount)}\nSisa: ${formatPrice(remaining)}`;
    await Share.share({ message: text, title: "Ringkasan Pembayaran" });
  }

  const summaryPanel = (
    <YStack gap="$4">
      <View style={styles.actionPanel}>
        <TextH3 fontWeight="700">Langkah berikutnya</TextH3>
        <YStack gap="$3" marginTop={14}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.primaryButton}
            onPress={handleNewTransaction}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={ColorBase.white}
            />
            <TextBodyLg fontWeight="700" color={ColorBase.white}>
              Input Manual Baru
            </TextBodyLg>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.secondaryLink}
            onPress={handleGoRiwayat}
          >
            <TextBody fontWeight="700" color={ColorPrimary.primary600}>
              Buka Riwayat Order
            </TextBody>
          </TouchableOpacity>
        </YStack>
      </View>

      <View style={styles.heroPanel}>
        <YStack alignItems="center" gap="$3">
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color={ColorBase.white} />
          </View>
          <YStack alignItems="center" gap={8}>
            <TextH2 fontWeight="700" textAlign="center">
              {remaining === 0 ? "Pembayaran Berhasil!" : "Pembayaran Tercatat"}
            </TextH2>
            <TextBody color="$colorSecondary" textAlign="center">
              {formatPrice(paymentAmount)} dicatat ke {order.id}
            </TextBody>
            <TextBodySm color="$colorSecondary" textAlign="center">
              {dateTime}
            </TextBodySm>
          </YStack>
        </YStack>
      </View>

      <View style={styles.metricPanel}>
        <XStack gap="$3" flexWrap="wrap">
          <View style={[styles.metricCard, styles.metricCardPrimary]}>
            <TextCaption color="rgba(255,255,255,0.82)">Pembayaran Ini</TextCaption>
            <TextH3 fontWeight="700" color={ColorBase.white}>
              {formatPrice(paymentAmount)}
            </TextH3>
          </View>
          <View style={styles.metricCard}>
            <TextCaption color="$colorSecondary">Sisa Tagihan</TextCaption>
            <TextH3
              fontWeight="700"
              color={remaining === 0 ? ColorGreen.green600 : ColorDanger.danger600}
            >
              {formatPrice(remaining)}
            </TextH3>
          </View>
        </XStack>
      </View>

      <View style={styles.infoBlock}>
        <TextH3 fontWeight="700">Ringkasan transaksi</TextH3>
        <YStack gap={12} marginTop={14}>
          <XStack justifyContent="space-between">
            <TextBodySm color="$colorSecondary">Order</TextBodySm>
            <TextBodySm fontWeight="700">{order.id}</TextBodySm>
          </XStack>
          <XStack justifyContent="space-between">
            <TextBodySm color="$colorSecondary">Pelanggan</TextBodySm>
            <TextBodySm fontWeight="700">
              {order.customerName || order.tableLabel || "-"}
            </TextBodySm>
          </XStack>
          <XStack justifyContent="space-between">
            <TextBodySm color="$colorSecondary">Metode</TextBodySm>
            <TextBodySm fontWeight="700">{methodLabel}</TextBodySm>
          </XStack>
          <XStack justifyContent="space-between">
            <TextBodySm color="$colorSecondary">Status</TextBodySm>
            <TextBodySm fontWeight="700">{order.status}</TextBodySm>
          </XStack>
          {payment?.method === "tunai" && (
            <>
              <XStack justifyContent="space-between">
                <TextBodySm color="$colorSecondary">Uang Diterima</TextBodySm>
                <TextBodySm fontWeight="700">{formatPrice(received)}</TextBodySm>
              </XStack>
              <XStack justifyContent="space-between">
                <TextBodySm color="$colorSecondary">Kembalian</TextBodySm>
                <TextBodySm fontWeight="700" color={ColorGreen.green600}>
                  {formatPrice(change)}
                </TextBodySm>
              </XStack>
            </>
          )}
        </YStack>
      </View>
    </YStack>
  );

  const receiptPanel = (
    <YStack gap="$4" flex={1}>
      <View style={styles.receiptStage}>
        <YStack gap="$3" marginBottom={16}>
          <XStack justifyContent="space-between" alignItems="center">
            <YStack gap={4}>
              <TextH3 fontWeight="700">Preview resi</TextH3>
              <TextBodySm color="$colorSecondary">
                Area cetak dipisah supaya aksi resi langsung terlihat.
              </TextBodySm>
            </YStack>
            <View style={styles.previewBadge}>
              <TextCaption color={ColorPrimary.primary600} fontWeight="700">
                SIAP CETAK
              </TextCaption>
            </View>
          </XStack>

          <XStack gap="$3" flexDirection={isTablet ? "row" : "column"}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.receiptActionPrimary}
              onPress={handlePrint}
            >
              <Ionicons
                name="print-outline"
                size={18}
                color={ColorBase.white}
                style={styles.buttonIcon}
              />
              <TextBodyLg fontWeight="700" color={ColorBase.white}>
                Cetak Resi
              </TextBodyLg>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.receiptActionSecondary}
              onPress={handleShare}
            >
              <Ionicons
                name="share-outline"
                size={18}
                color={ColorNeutral.neutral700}
                style={styles.buttonIcon}
              />
              <TextBodyLg fontWeight="700" color={ColorNeutral.neutral700}>
                Bagikan Ringkasan
              </TextBodyLg>
            </TouchableOpacity>
          </XStack>
        </YStack>

        <View style={styles.receiptCard}>
          <YStack alignItems="center" gap={4} paddingVertical={16}>
            <View style={styles.storeIcon}>
              <Ionicons
                name="storefront"
                size={24}
                color={ColorPrimary.primary600}
              />
            </View>
            <TextBodyLg fontWeight="700">{storeInfo.name}</TextBodyLg>
            <TextCaption color="$colorSecondary" textAlign="center">
              {storeInfo.address}
            </TextCaption>
          </YStack>

          <DottedSeparator />

          <YStack gap={8}>
            <XStack justifyContent="space-between">
              <TextBodySm color="$colorSecondary">No. Order</TextBodySm>
              <TextBodySm fontWeight="700">{order.id}</TextBodySm>
            </XStack>
            <XStack justifyContent="space-between">
              <TextBodySm color="$colorSecondary">Pelanggan</TextBodySm>
              <TextBodySm fontWeight="700">
                {order.customerName || order.tableLabel || "-"}
              </TextBodySm>
            </XStack>
            <XStack justifyContent="space-between">
              <TextBodySm color="$colorSecondary">Status</TextBodySm>
              <TextBodySm fontWeight="700">{order.status}</TextBodySm>
            </XStack>
          </YStack>

          <DottedSeparator />

          <YStack gap={8}>
            {receiptItems.map((item, index) => (
              <XStack key={index} justifyContent="space-between" gap="$3">
                <TextBodySm color="$colorSecondary" flex={1}>
                  {item.name} x{item.qty}
                </TextBodySm>
                <TextBodySm fontWeight="600">{formatPrice(item.price)}</TextBodySm>
              </XStack>
            ))}
          </YStack>

          <DottedSeparator />

          <YStack gap={8}>
            <XStack justifyContent="space-between">
              <TextBodySm color="$colorSecondary">Subtotal</TextBodySm>
              <TextBodySm fontWeight="600">{formatPrice(subtotal)}</TextBodySm>
            </XStack>
            {discount > 0 && (
              <XStack justifyContent="space-between">
                <TextBodySm color="$colorSecondary">Diskon</TextBodySm>
                <TextBodySm fontWeight="600" color={ColorDanger.danger600}>
                  -{formatPrice(discount)}
                </TextBodySm>
              </XStack>
            )}
            <XStack justifyContent="space-between">
              <TextBodySm color="$colorSecondary">PPN 11%</TextBodySm>
              <TextBodySm fontWeight="600">{formatPrice(ppn)}</TextBodySm>
            </XStack>
            <XStack justifyContent="space-between">
              <TextBodyLg fontWeight="700">TOTAL</TextBodyLg>
              <TextBodyLg fontWeight="700" color={ColorGreen.green600}>
                {formatPrice(order.grandTotal)}
              </TextBodyLg>
            </XStack>
          </YStack>

          <DottedSeparator />

          <YStack gap={8}>
            <XStack justifyContent="space-between">
              <TextBodySm color="$colorSecondary">Metode</TextBodySm>
              <TextBodySm fontWeight="700">{methodLabel}</TextBodySm>
            </XStack>
            <XStack justifyContent="space-between">
              <TextBodySm color="$colorSecondary">Pembayaran Ini</TextBodySm>
              <TextBodySm fontWeight="700">{formatPrice(paymentAmount)}</TextBodySm>
            </XStack>
            <XStack justifyContent="space-between">
              <TextBodySm color="$colorSecondary">Total Dibayar</TextBodySm>
              <TextBodySm fontWeight="700">{formatPrice(totalPaid)}</TextBodySm>
            </XStack>
            <XStack justifyContent="space-between">
              <TextBodySm color="$colorSecondary">Sisa</TextBodySm>
              <TextBodySm
                fontWeight="700"
                color={
                  remaining === 0 ? ColorGreen.green600 : ColorDanger.danger600
                }
              >
                {formatPrice(remaining)}
              </TextBodySm>
            </XStack>
          </YStack>

          <YStack alignItems="center" gap={8} marginTop={20}>
            <BarcodePlaceholder />
            <TextCaption color="$colorSecondary">{order.id}</TextCaption>
          </YStack>
        </View>
      </View>
    </YStack>
  );

  const shellDirection = isTablet ? "row" : "column";
  const showSummary = isTablet || activeView === "summary";
  const showReceipt = isTablet || activeView === "receipt";

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Pembayaran Selesai"
        subtitle="Ringkasan transaksi dan resi kini dipisah supaya aksi cetak lebih cepat."
        showBack
        onBack={handleGoRiwayat}
        maxWidth={contentMaxWidth}
      />

      {!isTablet ? (
        <View style={[styles.viewSwitcher, { paddingHorizontal: horizontalPadding }]}>
          {[
            { id: "summary", label: "Ringkasan" },
            { id: "receipt", label: "Resi" },
          ].map((item) => {
            const active = activeView === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.switchChip, active && styles.switchChipActive]}
                activeOpacity={0.82}
                onPress={() => setActiveView(item.id as ReceiptView)}
              >
                <TextBodySm
                  fontWeight="700"
                  color={active ? ColorBase.white : ColorNeutral.neutral700}
                >
                  {item.label}
                </TextBodySm>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      <View
        style={[
          styles.shell,
          {
            maxWidth: contentMaxWidth,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <XStack flex={1} gap="$4" flexDirection={shellDirection} alignItems="stretch">
          {showSummary ? (
            <ScrollView
              style={styles.panel}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.panelContent}
            >
              {summaryPanel}
            </ScrollView>
          ) : null}

          {showReceipt ? (
            <ScrollView
              style={styles.panel}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.panelContent}
            >
              {receiptPanel}
            </ScrollView>
          ) : null}
        </XStack>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },
  missingState: {
    flexGrow: 1,
    justifyContent: "center",
  },
  shell: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    paddingTop: 18,
    paddingBottom: 24,
  },
  panel: {
    flex: 1,
  },
  panelContent: {
    paddingBottom: 24,
  },
  heroPanel: {
    backgroundColor: ColorBase.white,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5EBF5",
    shadowColor: "#10213A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  successIcon: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: ColorGreen.green600,
    alignItems: "center",
    justifyContent: "center",
  },
  metricPanel: {
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 190,
    borderRadius: 24,
    padding: 20,
    backgroundColor: ColorBase.white,
    borderWidth: 1,
    borderColor: "#E5EBF5",
  },
  metricCardPrimary: {
    backgroundColor: ColorPrimary.primary600,
    borderColor: ColorPrimary.primary600,
  },
  infoBlock: {
    backgroundColor: ColorBase.white,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5EBF5",
  },
  actionPanel: {
    backgroundColor: "#F7FAFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#D9E5F8",
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: ColorGreen.green600,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  secondaryLink: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: ColorBase.white,
    borderWidth: 1,
    borderColor: "#D9E5F8",
    alignItems: "center",
    justifyContent: "center",
  },
  receiptStage: {
    backgroundColor: "#EEF4FF",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DBE6F8",
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: ColorPrimary.primary50,
  },
  receiptCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: ColorBase.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: ColorPrimary.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  receiptActionPrimary: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: ColorPrimary.primary600,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  receiptActionSecondary: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: ColorBase.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonIcon: {
    marginRight: 8,
  },
  viewSwitcher: {
    paddingTop: 14,
  },
  switchChip: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: ColorBase.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCE5F3",
  },
  switchChipActive: {
    backgroundColor: ColorPrimary.primary600,
    borderColor: ColorPrimary.primary600,
  },
});

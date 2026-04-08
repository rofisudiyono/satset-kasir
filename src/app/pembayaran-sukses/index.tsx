import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useAtom } from "jotai";
import React from "react";
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
  TextBody,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH2,
} from "@/components";
import { cartAtom } from "@/features/cart/store/cart.store";
import { storeInfo } from "@/features/payment/api/receipt.data";
import {
  buildOrderItemsSummary,
  calculateOrderPaidAmount,
  getPaymentMethodLabel,
} from "@/features/pos/pos.utils";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import {
  ColorBase,
  ColorDanger,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
} from "@/themes/Colors";
import { formatPrice, getCurrentDateTime } from "@/utils";

export default function PembayaranSuksesPage() {
  const router = useRouter();
  const [orders] = useAtom(posOrdersAtom);
  const [, setCart] = useAtom(cartAtom);
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 32,
          alignItems: "center",
        }}
      >
        <YStack paddingHorizontal={16} gap={16} paddingTop={24} width={480}>
          <YStack alignItems="center" gap={12}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color={ColorBase.white} />
            </View>
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
                <XStack key={index} justifyContent="space-between">
                  <TextBodySm color="$colorSecondary" flex={1}>
                    {item.name} x{item.qty}
                  </TextBodySm>
                  <TextBodySm fontWeight="600">
                    {formatPrice(item.price)}
                  </TextBodySm>
                </XStack>
              ))}
            </YStack>

            <DottedSeparator />

            <YStack gap={8}>
              <XStack justifyContent="space-between">
                <TextBodySm color="$colorSecondary">Subtotal</TextBodySm>
                <TextBodySm fontWeight="600">
                  {formatPrice(subtotal)}
                </TextBodySm>
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
                <TextBodySm fontWeight="700">
                  {formatPrice(paymentAmount)}
                </TextBodySm>
              </XStack>
              <XStack justifyContent="space-between">
                <TextBodySm color="$colorSecondary">Total Dibayar</TextBodySm>
                <TextBodySm fontWeight="700">
                  {formatPrice(totalPaid)}
                </TextBodySm>
              </XStack>
              <XStack justifyContent="space-between">
                <TextBodySm color="$colorSecondary">Sisa</TextBodySm>
                <TextBodySm
                  fontWeight="700"
                  color={
                    remaining === 0
                      ? ColorGreen.green600
                      : ColorDanger.danger600
                  }
                >
                  {formatPrice(remaining)}
                </TextBodySm>
              </XStack>
              {payment?.method === "tunai" && (
                <>
                  <XStack justifyContent="space-between">
                    <TextBodySm color="$colorSecondary">
                      Uang Diterima
                    </TextBodySm>
                    <TextBodySm fontWeight="700">
                      {formatPrice(received)}
                    </TextBodySm>
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

            <YStack alignItems="center" gap={8} marginTop={20}>
              <BarcodePlaceholder />
              <TextCaption color="$colorSecondary">{order.id}</TextCaption>
            </YStack>
          </View>

          <XStack gap={12}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.outlineBtn}
              onPress={handlePrint}
            >
              <Ionicons
                name="print-outline"
                size={18}
                color={ColorNeutral.neutral700}
                style={{ marginRight: 6 }}
              />
              <TextBodyLg fontWeight="700" color={ColorNeutral.neutral700}>
                Cetak
              </TextBodyLg>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.outlineBtn}
              onPress={handleShare}
            >
              <Ionicons
                name="share-outline"
                size={18}
                color={ColorNeutral.neutral700}
                style={{ marginRight: 6 }}
              />
              <TextBodyLg fontWeight="700" color={ColorNeutral.neutral700}>
                Bagikan
              </TextBodyLg>
            </TouchableOpacity>
          </XStack>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.newTransBtn}
            onPress={handleNewTransaction}
          >
            <TextBodyLg fontWeight="700" color={ColorBase.white}>
              Input Manual Baru
            </TextBodyLg>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={handleGoRiwayat}>
            <TextBody
              fontWeight="600"
              color={ColorPrimary.primary600}
              textAlign="center"
              paddingVertical={8}
            >
              Buka Riwayat Order
            </TextBody>
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
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ColorGreen.green600,
    alignItems: "center",
    justifyContent: "center",
  },
  receiptCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: ColorBase.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  storeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: ColorPrimary.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: ColorBase.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  newTransBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: ColorGreen.green600,
    alignItems: "center",
    justifyContent: "center",
  },
});

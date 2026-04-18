import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  AppButton,
  PageHeader,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH2,
  TextH3,
} from "@/components";
import { cartAtom, cartSnapshotAtom } from "@/features/cart/store/cart.store";
import { catalogStockAtom } from "@/features/catalog/store/catalog.store";
import { paymentMethodOptions } from "@/features/payment/api/payment.data";
import { PaymentMethodCard } from "@/features/payment/components/PaymentMethodCard";
import {
  appendPaymentToOrder,
  buildOrderItemsSummary,
  buildCheckoutOrderBody,
  calculateOrderPaidAmount,
  calculateOrderRemainingAmount,
  getPaymentMethodLabel,
  getSelectedItemsAmount,
} from "@/features/pos/pos.utils";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { getApiErrorMessage, useCheckoutMutation } from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { ColorBase, ColorNeutral, ColorPrimary } from "@/themes/Colors";
import type { PaymentMethod } from "@/types";
import { formatPrice } from "@/utils";

type PaymentFlowMode = "full" | "partial" | "split_nominal" | "split_item";
type MobilePaymentStep = "summary" | "method";

export default function PilihPembayaranPage() {
  const router = useRouter();
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const [orders, setOrders] = useAtom(posOrdersAtom);
  const [, setCart] = useAtom(cartAtom);
  const [cartSnapshot, setCartSnapshot] = useAtom(cartSnapshotAtom);
  const [, setCatalogStock] = useAtom(catalogStockAtom);
  const { isTablet, contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const params = useLocalSearchParams<{ orderId: string }>();
  const checkoutMutation = useCheckoutMutation();

  const order = useMemo(
    () => orders.find((item) => item.id === params.orderId),
    [orders, params.orderId],
  );

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("qris");
  const [mode, setMode] = useState<PaymentFlowMode>("full");
  const [amountInput, setAmountInput] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [mobileStep, setMobileStep] = useState<MobilePaymentStep>("summary");

  useEffect(() => {
    if (isShiftStarted) return;
    router.replace("/buka-shift" as never);
  }, [isShiftStarted, router]);

  useEffect(() => {
    if (!order) return;
    setAmountInput(String(calculateOrderRemainingAmount(order)));
    setSelectedItemIds(order.items.map((item) => item.id));
  }, [order]);

  const isDirectCheckoutFlow = cartSnapshot.length > 0 && (order?.payments.length ?? 0) === 0;

  useEffect(() => {
    if (isDirectCheckoutFlow && mode !== "full") {
      setMode("full");
    }
  }, [isDirectCheckoutFlow, mode]);

  if (!order) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        <PageHeader
          title="Pilih Pembayaran"
          showBack
          onBack={() => router.back()}
        />
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$3"
          padding="$4"
        >
          <Ionicons
            name="receipt-outline"
            size={32}
            color={ColorNeutral.neutral400}
          />
          <TextBodySm color="$colorSecondary" textAlign="center">
            Order tidak ditemukan atau sudah dihapus.
          </TextBodySm>
        </YStack>
      </SafeAreaView>
    );
  }

  const currentOrder = order;

  useEffect(() => {
    if (isTablet) return;
    setMobileStep("summary");
  }, [isTablet, currentOrder.id]);

  const paidAmount = calculateOrderPaidAmount(currentOrder);
  const remaining = calculateOrderRemainingAmount(currentOrder);
  const selectedItemsAmount = getSelectedItemsAmount(currentOrder, selectedItemIds);
  const typedAmount = Number(amountInput || 0);

  const paymentAmount =
    mode === "full"
      ? remaining
      : mode === "split_item"
        ? Math.min(remaining, selectedItemsAmount)
        : Math.min(remaining, typedAmount);

  const canProcess =
    remaining > 0 &&
    paymentAmount > 0 &&
    (mode !== "split_item" || selectedItemIds.length > 0) &&
    (!isDirectCheckoutFlow || paymentAmount >= remaining);

  function toggleItem(itemId: string) {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  }

  function getPaymentLabel() {
    if (mode === "partial") return "Bayar Sebagian";
    if (mode === "split_nominal") return "Split Nominal";
    if (mode === "split_item") return "Split per Item";
    return remaining === currentOrder.grandTotal ? "Bayar Penuh" : "Pelunasan";
  }

  function applyNonCashPayment() {
    const paymentId = `pay-${Date.now()}`;
    const updatedOrder = appendPaymentToOrder(currentOrder, {
      id: paymentId,
      method: selectedMethod,
      amountPaid: paymentAmount,
      label: getPaymentLabel(),
      paidAt: Date.now(),
    });

    setOrders((prev) =>
      prev.map((item) => (item.id === currentOrder.id ? updatedOrder : item)),
    );

    if (cartSnapshot.length > 0) {
      setCatalogStock((prev) => {
        const updated = { ...prev };
        for (const item of cartSnapshot) {
          const current = updated[item.productId] ?? 0;
          updated[item.productId] = Math.max(0, current - item.quantity);
        }
        return updated;
      });
      setCartSnapshot([]);
      setCart([]);
    }

    router.push({
      pathname: "/pembayaran-sukses",
      params: {
        orderId: currentOrder.id,
        paymentId,
      },
    });
  }

  async function handleDirectCheckout() {
    if (!canProcess || cartSnapshot.length === 0) return;

    try {
      await checkoutMutation.mutateAsync(
        buildCheckoutOrderBody({
          cart: cartSnapshot,
          orderType: currentOrder.serviceMode ?? "DINE_IN",
          tableId: currentOrder.tableId,
          customerName: currentOrder.customerName,
          tableLabel: currentOrder.tableLabel,
          promoCode: currentOrder.promoCode,
          promoId: currentOrder.promoId,
          payment: {
            method: selectedMethod,
            amountPaid: paymentAmount,
            label: getPaymentLabel(),
          },
        }),
      );
      applyNonCashPayment();
    } catch (error) {
      Alert.alert(
        "Checkout gagal",
        getApiErrorMessage(error, "Transaksi tidak berhasil dikirim ke server."),
      );
    }
  }

  function handleProcess() {
    if (!canProcess) return;

    if (selectedMethod === "tunai") {
      router.push({
        pathname: "/pembayaran-tunai",
        params: {
          orderId: currentOrder.id,
          amountToPay: String(paymentAmount),
          paymentLabel: getPaymentLabel(),
        },
      });
      return;
    }

    const methodLabel = getPaymentMethodLabel(selectedMethod);

    Alert.alert(
      "Konfirmasi Pembayaran",
      `${methodLabel} sebesar ${formatPrice(paymentAmount)} akan dicatat ke order ${currentOrder.id}.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Konfirmasi",
          onPress: isDirectCheckoutFlow ? handleDirectCheckout : applyNonCashPayment,
        },
      ],
    );
  }

  function handleBack() {
    if (!isTablet && mobileStep === "method") {
      setMobileStep("summary");
      return;
    }

    router.back();
  }

  const totalCard = (
    <View style={styles.totalCard}>
      <TextCaption color="rgba(255,255,255,0.85)">Total Order</TextCaption>
      <TextH2 fontWeight="700" color={ColorBase.white}>
        {formatPrice(currentOrder.grandTotal)}
      </TextH2>
      <XStack gap={8} marginTop={8}>
        <TextBodySm color="rgba(255,255,255,0.85)">
          Dibayar {formatPrice(paidAmount)}
        </TextBodySm>
        <View style={styles.dotSeparator} />
        <TextBodySm color="rgba(255,255,255,0.85)">
          Sisa {formatPrice(remaining)}
        </TextBodySm>
      </XStack>
    </View>
  );

  const modeSelector = (
    <YStack gap="$2">
      <TextCaption color="$colorSecondary" fontWeight="700" letterSpacing={0.8}>
        MODE PEMBAYARAN
      </TextCaption>
      <XStack flexWrap="wrap" gap="$2">
        {(isDirectCheckoutFlow
          ? [{ id: "full", label: "Bayar Penuh" }]
          : [
          { id: "full", label: "Bayar Penuh" },
          { id: "partial", label: "Bayar Sebagian" },
          { id: "split_nominal", label: "Split Nominal" },
          { id: "split_item", label: "Split per Item" },
        ]).map((item) => {
          const active = mode === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setMode(item.id as PaymentFlowMode)}
              style={[styles.modeChip, active && styles.modeChipActive]}
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
      </XStack>
    </YStack>
  );

  const amountPanel =
    mode === "split_item" ? (
      <YStack gap="$2">
        <TextH3 fontWeight="700">Pilih item yang dibayar</TextH3>
          {currentOrder.items.map((item) => {
          const active = selectedItemIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleItem(item.id)}
              style={[styles.itemCard, active && styles.itemCardActive]}
            >
              <XStack
                alignItems="center"
                justifyContent="space-between"
                gap="$3"
              >
                <YStack flex={1} minWidth={0}>
                  <TextBodyLg fontWeight="700">
                    {item.name} x{item.qty}
                  </TextBodyLg>
                  <TextCaption color="$colorSecondary">
                    {item.note ||
                      item.modifierLabels?.join(", ") ||
                      "Tanpa catatan"}
                  </TextCaption>
                </YStack>
                <YStack alignItems="flex-end" gap={4}>
                  <TextBodySm fontWeight="700">
                    {formatPrice(item.unitPrice * item.qty)}
                  </TextBodySm>
                  <Ionicons
                    name={active ? "checkbox" : "square-outline"}
                    size={20}
                    color={
                      active ? ColorPrimary.primary600 : ColorNeutral.neutral400
                    }
                  />
                </YStack>
              </XStack>
            </TouchableOpacity>
          );
        })}
        <View style={styles.summaryBox}>
          <TextBodySm color="$colorSecondary">Total item terpilih</TextBodySm>
          <TextBodyLg fontWeight="700">{formatPrice(paymentAmount)}</TextBodyLg>
        </View>
      </YStack>
    ) : (
      <YStack gap="$2">
        <TextH3 fontWeight="700">
          {mode === "full" ? "Pembayaran penuh" : "Nominal dibayar"}
        </TextH3>
        <TextInput
          editable={mode !== "full"}
          value={mode === "full" ? String(remaining) : amountInput}
          onChangeText={setAmountInput}
          keyboardType="number-pad"
          placeholder="Masukkan nominal"
          placeholderTextColor={ColorNeutral.neutral400}
          style={[
            styles.amountInput,
            mode === "full" && styles.amountInputDisabled,
          ]}
        />
        {(mode === "partial" || mode === "split_nominal") && (
          <XStack gap="$2" flexWrap="wrap">
            {[remaining / 2, remaining / 3, remaining].map((value, index) => (
              <TouchableOpacity
                key={`${value}-${index}`}
                onPress={() => setAmountInput(String(Math.round(value)))}
                style={styles.quickAmountChip}
              >
                <TextBodySm fontWeight="700" color={ColorPrimary.primary600}>
                  {index === 2 ? "Sisa Penuh" : formatPrice(Math.round(value))}
                </TextBodySm>
              </TouchableOpacity>
            ))}
          </XStack>
        )}
      </YStack>
    );

  const paymentHistory = (
    <YStack gap="$2">
      <TextH3 fontWeight="700">Riwayat pembayaran</TextH3>
      {currentOrder.payments.length === 0 ? (
        <TextBodySm color="$colorSecondary">
          Belum ada pembayaran tercatat.
        </TextBodySm>
      ) : (
        currentOrder.payments.map((payment) => (
          <View key={payment.id} style={styles.historyRow}>
            <YStack flex={1}>
              <TextBodySm fontWeight="700">
                {getPaymentMethodLabel(payment.method)}
              </TextBodySm>
              <TextCaption color="$colorSecondary">
                {payment.label || "Pembayaran"}
              </TextCaption>
            </YStack>
            <TextBodySm fontWeight="700">
              {formatPrice(payment.amountPaid)}
            </TextBodySm>
          </View>
        ))
      )}
    </YStack>
  );

  const orderInfo = (
    <YStack gap="$3">
      {totalCard}
      <View style={styles.infoPanel}>
        <TextCaption color="$colorSecondary">ORDER</TextCaption>
        <TextBodyLg fontWeight="700">{currentOrder.id}</TextBodyLg>
        <TextBodySm color="$colorSecondary" marginTop={6}>
          {currentOrder.customerName || currentOrder.tableLabel || "Tanpa label pelanggan"}
        </TextBodySm>
        <TextBodySm color="$colorSecondary" marginTop={8}>
          {buildOrderItemsSummary(currentOrder)}
        </TextBodySm>
      </View>
      {modeSelector}
      {amountPanel}
      {paymentHistory}
    </YStack>
  );

  const processButton = (
    <View style={styles.bottomBar}>
      <AppButton
        variant="primary"
        size="lg"
        fullWidth
        title={`Catat ${getPaymentLabel()} ${formatPrice(paymentAmount)}`}
        onPress={handleProcess}
        disabled={!canProcess || checkoutMutation.isPending}
      />
      <TextCaption color="$colorSecondary" textAlign="center" marginTop={8}>
        {isDirectCheckoutFlow
          ? "Checkout kasir via API hanya mendukung pembayaran penuh."
          : `Status order akan otomatis menjadi ${
              paymentAmount >= remaining ? "PAID" : "PARTIALLY_PAID"
            }.`}
      </TextCaption>
    </View>
  );

  const summaryButton = (
    <View style={styles.bottomBar}>
      <AppButton
        variant="primary"
        size="lg"
        fullWidth
        title="Lanjut ke Metode Pembayaran"
        onPress={() => setMobileStep("method")}
        disabled={!canProcess}
      />
      <TextCaption color="$colorSecondary" textAlign="center" marginTop={8}>
        Lanjut setelah nominal pembayaran sudah sesuai.
      </TextCaption>
    </View>
  );

  const methodSelection = (
    <>
      <TextCaption
        color="$colorSecondary"
        fontWeight="700"
        letterSpacing={0.8}
      >
        METODE PEMBAYARAN
      </TextCaption>
      {paymentMethodOptions.map((method) => (
        <PaymentMethodCard
          key={method.id}
          {...method}
          selected={selectedMethod === method.id}
          onPress={() => setSelectedMethod(method.id)}
        />
      ))}
    </>
  );

  const methodSummaryCard = (
    <View style={styles.methodSummaryCard}>
      <TextCaption color={ColorPrimary.primary700} fontWeight="700">
        SIAP DICATAT
      </TextCaption>
      <TextH3 fontWeight="700" marginTop={6}>
        {getPaymentMethodLabel(selectedMethod)}
      </TextH3>
      <TextBodySm color="$colorSecondary" marginTop={4}>
        {getPaymentLabel()}
      </TextBodySm>
      <TextH2 fontWeight="700" marginTop={12}>
        {formatPrice(paymentAmount)}
      </TextH2>
      <TextBodySm color="$colorSecondary" marginTop={8}>
        Order {currentOrder.id} • sisa {formatPrice(remaining)}
      </TextBodySm>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <PageHeader
        title={
          !isTablet && mobileStep === "summary"
            ? "Ringkasan Order"
            : "Pilih Pembayaran"
        }
        showBack
        onBack={handleBack}
        maxWidth={contentMaxWidth}
      />
      {isTablet ? (
        <XStack
          flex={1}
          flexDirection="row"
          style={[
            styles.shell,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <ScrollView
            style={styles.tabletLeft}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
          >
            {orderInfo}
          </ScrollView>
          <View style={styles.tabletDivider} />
          <View style={styles.tabletRight}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 120,
                gap: 12,
              }}
            >
              {methodSelection}
            </ScrollView>
            {processButton}
          </View>
        </XStack>
      ) : (
        <View
          style={[
            styles.mobileShell,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <ScrollView
            style={styles.mobileContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 132, gap: 12 }}
          >
            {mobileStep === "summary" ? orderInfo : (
              <YStack gap="$3">
                {methodSummaryCard}
                {methodSelection}
              </YStack>
            )}
          </ScrollView>
          {mobileStep === "summary" ? summaryButton : processButton}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  shell: {
    width: "100%",
    alignSelf: "center",
    flex: 1,
  },
  mobileShell: {
    width: "100%",
    alignSelf: "center",
    flex: 1,
  },
  mobileContent: {
    flex: 1,
  },
  totalCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: ColorPrimary.primary700,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  infoPanel: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: ColorBase.white,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  modeChipActive: {
    backgroundColor: ColorPrimary.primary600,
    borderColor: ColorPrimary.primary600,
  },
  amountInput: {
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
    color: ColorNeutral.neutral900,
  },
  amountInputDisabled: {
    backgroundColor: ColorNeutral.neutral100,
    color: ColorNeutral.neutral500,
  },
  quickAmountChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: ColorPrimary.primary50,
  },
  itemCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  itemCardActive: {
    borderColor: ColorPrimary.primary600,
    backgroundColor: ColorPrimary.primary50,
  },
  summaryBox: {
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  bottomBar: {
    backgroundColor: ColorBase.white,
    borderTopWidth: 1,
    borderTopColor: ColorNeutral.neutral200,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  methodSummaryCard: {
    backgroundColor: ColorPrimary.primary50,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: ColorPrimary.primary100,
  },
  tabletLeft: {
    flex: 0.56,
  },
  tabletDivider: {
    width: 1,
    backgroundColor: ColorNeutral.neutral200,
  },
  tabletRight: {
    flex: 0.44,
    backgroundColor: ColorBase.white,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
});

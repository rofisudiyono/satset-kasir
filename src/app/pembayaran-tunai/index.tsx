import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  AppButton,
  NumpadGrid,
  PageHeader,
  SuggestionChip,
  TextBody,
  TextBodySm,
  TextCaption,
  TextH1,
} from "@/components";
import { cartAtom, cartSnapshotAtom } from "@/features/cart/store/cart.store";
import { catalogStockAtom } from "@/features/catalog/store/catalog.store";
import {
  appendPaymentToOrder,
  buildCheckoutOrderBody,
  calculateOrderRemainingAmount,
} from "@/features/pos/pos.utils";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import {
  getApiErrorMessage,
  useCheckoutMutation,
} from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import {
  ColorBase,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
} from "@/themes/Colors";
import { formatPrice, getCashSuggestions } from "@/utils";

export default function PembayaranTunaiPage() {
  const router = useRouter();
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const [orders, setOrders] = useAtom(posOrdersAtom);
  const [, setCart] = useAtom(cartAtom);
  const [cartSnapshot, setCartSnapshot] = useAtom(cartSnapshotAtom);
  const [, setCatalogStock] = useAtom(catalogStockAtom);
  const { isTablet, contentMaxWidth, horizontalPadding } =
    useResponsiveLayout();
  const checkoutMutation = useCheckoutMutation();
  const params = useLocalSearchParams<{
    orderId: string;
    amountToPay: string;
    paymentLabel?: string;
  }>();

  const order = useMemo(
    () => orders.find((item) => item.id === params.orderId),
    [orders, params.orderId],
  );

  const amountToPay = Number(params.amountToPay ?? 0);
  const [inputValue, setInputValue] = useState("0");

  useEffect(() => {
    if (isShiftStarted) return;
    router.replace("/buka-shift" as never);
  }, [isShiftStarted, router]);

  if (!order) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        <PageHeader
          title="Pembayaran Tunai"
          showBack
          onBack={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const currentOrder = order;

  const receivedAmount = Number(inputValue);
  const change = receivedAmount - amountToPay;
  const isEnough = receivedAmount >= amountToPay;
  const remainingBeforePayment = calculateOrderRemainingAmount(currentOrder);
  const suggestions = getCashSuggestions(amountToPay);
  const isCompactMobile = !isTablet;

  function handleNumpad(key: string) {
    setInputValue((prev) => {
      if (key === "DEL") {
        const next = prev.slice(0, -1);
        return next.length === 0 ? "0" : next;
      }
      if (key === "000") {
        if (prev === "0") return prev;
        if (prev.length >= 10) return prev;
        return prev + "000";
      }
      if (prev === "0") return key;
      if (prev.length >= 12) return prev;
      return prev + key;
    });
  }

  function handleSuggestion(amount: number) {
    setInputValue(String(amount));
  }

  async function handleConfirm() {
    if (cartSnapshot.length === 0) {
      applyLocalPayment();
      return;
    }

    try {
      await checkoutMutation.mutateAsync(
        buildCheckoutOrderBody({
          cart: cartSnapshot,
          orderType: currentOrder.serviceMode ?? "DINE_IN",
          tableId: currentOrder.tableId,
          customerName: currentOrder.customerName,
          customerPhone: currentOrder.customerPhone,
          orderNote: currentOrder.orderNote,
          tableLabel: currentOrder.tableLabel,
          promoCode: currentOrder.promoCode,
          promoId: currentOrder.promoId,
          payment: {
            method: "tunai",
            amountPaid: amountToPay,
            amountReceived: receivedAmount,
            label: params.paymentLabel || "Tunai",
          },
        }),
      );
      applyLocalPayment();
    } catch (error) {
      Alert.alert(
        "Checkout gagal",
        getApiErrorMessage(error, "Pembayaran tunai gagal dikirim ke server."),
      );
    }
  }

  function applyLocalPayment() {
    const paymentId = `pay-${Date.now()}`;
    const updatedOrder = appendPaymentToOrder(currentOrder, {
      id: paymentId,
      method: "tunai",
      amountPaid: amountToPay,
      amountReceived: receivedAmount,
      label: params.paymentLabel || "Tunai",
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

  const infoSection = (
    <YStack gap={isCompactMobile ? 12 : 16}>
      <YStack alignItems="center" gap={isCompactMobile ? 0 : 2}>
        <TextBodySm
          color={ColorNeutral.neutral500}
          fontWeight="600"
          letterSpacing={0.5}
        >
          NOMINAL DIBAYAR SEKARANG
        </TextBodySm>
        <TextH1
          fontWeight="700"
          color={ColorPrimary.primary600}
          fontSize={isCompactMobile ? 22 : 26}
        >
          {formatPrice(amountToPay)}
        </TextH1>
        <TextCaption color="$colorSecondary">
          Sisa sebelum pembayaran: {formatPrice(remainingBeforePayment)}
        </TextCaption>
      </YStack>

      <YStack alignItems="center" gap={isCompactMobile ? 2 : 0}>
        <TextBodySm color={ColorNeutral.neutral500} fontWeight="500">
          Uang Diterima
        </TextBodySm>
        <TextH1
          fontWeight="800"
          marginTop={isCompactMobile ? 0 : 2}
          color={ColorNeutral.neutral900}
          fontSize={isCompactMobile ? 24 : undefined}
        >
          {formatPrice(receivedAmount)}
        </TextH1>
        <View
          style={[
            styles.inputUnderline,
            isCompactMobile && styles.inputUnderlineCompact,
          ]}
        />
      </YStack>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.chipsContainer,
          isCompactMobile && styles.chipsContainerCompact,
        ]}
      >
        {suggestions.map((amount) => (
          <SuggestionChip
            key={amount}
            amount={amount}
            selected={receivedAmount === amount}
            onPress={() => handleSuggestion(amount)}
          />
        ))}
      </ScrollView>

      <View
        style={[styles.infoCard, isCompactMobile && styles.infoCardCompact]}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <TextBodySm color={ColorNeutral.neutral700}>
            Tagihan Dibayar
          </TextBodySm>
          <TextBodySm fontWeight="600" color={ColorNeutral.neutral700}>
            {formatPrice(amountToPay)}
          </TextBodySm>
        </XStack>
        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginTop={6}
        >
          <TextBodySm color={ColorNeutral.neutral700}>Uang Diterima</TextBodySm>
          <TextBodySm fontWeight="600" color={ColorNeutral.neutral700}>
            {formatPrice(receivedAmount)}
          </TextBodySm>
        </XStack>
        <View style={styles.divider} />
        <XStack justifyContent="space-between" alignItems="center">
          <TextBody fontWeight="700" color={ColorGreen.green600}>
            Kembalian
          </TextBody>
          <XStack alignItems="center" gap={6}>
            {isEnough && (
              <View style={styles.checkBadge}>
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={ColorGreen.green600}
                />
              </View>
            )}
            <TextBody fontWeight="800" color={ColorGreen.green600}>
              {isEnough ? formatPrice(change) : "Rp 0"}
            </TextBody>
          </XStack>
        </XStack>
      </View>
    </YStack>
  );

  const bottomAction = (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <View style={{ flex: 1, marginRight: 8 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.batalBtn}
          activeOpacity={0.7}
        >
          <TextBody
            fontWeight="700"
            color={ColorNeutral.neutral700}
            letterSpacing={1}
          >
            BATAL
          </TextBody>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, marginLeft: 8 }}>
        <AppButton
          title="Konfirmasi Pembayaran Tunai"
          variant="success"
          onPress={handleConfirm}
          disabled={!isEnough || checkoutMutation.isPending}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <PageHeader
        title="Pembayaran Tunai"
        showBack
        onBack={() => router.back()}
        maxWidth={contentMaxWidth}
      />
      <XStack
        flex={1}
        flexDirection={isTablet ? "row" : "column"}
        style={[
          styles.shell,
          {
            maxWidth: contentMaxWidth,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <ScrollView
          style={[styles.tabletInfoPanel, !isTablet && styles.stackPanel]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: isCompactMobile ? 16 : 24,
            paddingBottom: isCompactMobile ? 20 : 32,
          }}
        >
          {infoSection}
        </ScrollView>
        {isTablet ? <View style={styles.tabletDivider} /> : null}
        <View
          style={[styles.tabletNumpadPanel, !isTablet && styles.stackPanel]}
        >
          <View style={styles.tabletNumpadContent}>
            <NumpadGrid onPress={handleNumpad} />
          </View>
          <View style={styles.bottomBar}>{bottomAction}</View>
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
  shell: {
    width: "100%",
    alignSelf: "center",
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  inputUnderline: {
    width: 220,
    height: 2,
    backgroundColor: ColorPrimary.primary200,
    marginTop: 6,
  },
  inputUnderlineCompact: {
    width: 180,
    marginTop: 2,
  },
  chipsContainer: {
    paddingHorizontal: 4,
    gap: 10,
    flexDirection: "row",
  },
  chipsContainerCompact: {
    gap: 8,
  },
  infoCard: {
    backgroundColor: ColorGreen.green75,
    borderRadius: 16,
    padding: 12,
  },
  infoCardCompact: {
    borderRadius: 14,
    padding: 10,
  },
  divider: {
    height: 1,
    backgroundColor: ColorGreen.green150,
    marginVertical: 8,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ColorGreen.green125,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: ColorGreen.green600,
  },
  bottomBar: {
    backgroundColor: ColorBase.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ColorNeutral.neutral200,
    flexDirection: "row",
  },
  batalBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  tabletNumpadPanel: {
    flex: 0.5,
    backgroundColor: ColorBase.bgScreen,
  },
  tabletNumpadContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabletDivider: {
    width: 1,
    backgroundColor: ColorNeutral.neutral200,
  },
  tabletInfoPanel: {
    flex: 0.5,
    backgroundColor: ColorBase.white,
  },
  stackPanel: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
});

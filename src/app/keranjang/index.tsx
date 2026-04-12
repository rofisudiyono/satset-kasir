import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AppButton, PageHeader } from "@/components";
import {
  CartItemsCard,
  CustomerInfoCard,
  PriceSummaryCard,
  PromoCard,
  cartAtom,
} from "@/features/cart";
import {
  cartSnapshotAtom,
  heldOrdersAtom,
} from "@/features/cart/store/cart.store";
import { promoDefinitions } from "@/features/payment/api/payment.data";
import { buildPosOrderFromCart } from "@/features/pos/pos.utils";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { ColorBase, ColorDanger, ColorPrimary } from "@/themes/Colors";
import type { AppliedPromo, OrderType } from "@/types";

const PPN_RATE = 0.11;

export default function KeranjangPage() {
  const router = useRouter();
  const [cart, setCart] = useAtom(cartAtom);
  const [, setHeldOrders] = useAtom(heldOrdersAtom);
  const [, setCartSnapshot] = useAtom(cartSnapshotAtom);
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const [shiftData] = useAtom(shiftDataAtom);
  const [posOrders, setPosOrders] = useAtom(posOrdersAtom);
  const { isTablet, contentMaxWidth, horizontalPadding } = useResponsiveLayout();

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("Dine In");

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoEnabled, setPromoEnabled] = useState(false);

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0);
  const discount = appliedPromo && promoEnabled ? appliedPromo.discount : 0;
  const afterDiscount = subtotal - discount;
  const ppn = Math.round(afterDiscount * PPN_RATE);
  const total = afterDiscount + ppn;

  // Enforce open shift before checkout.
  useEffect(() => {
    if (isShiftStarted) return;
    router.replace("/buka-shift" as never);
  }, [isShiftStarted, router]);

  function handleUpdateQty(cartId: string, qty: number) {
    setCart((prev) =>
      prev.map((c) => (c.cartId === cartId ? { ...c, quantity: qty } : c)),
    );
  }

  function handleRemove(cartId: string) {
    setCart((prev) => prev.filter((c) => c.cartId !== cartId));
  }

  function handleUpdateNote(cartId: string, note: string) {
    setCart((prev) =>
      prev.map((c) => (c.cartId === cartId ? { ...c, note } : c)),
    );
  }

  function handleClearCart() {
    Alert.alert(
      "Hapus Semua Item",
      "Apakah kamu yakin ingin menghapus semua item di keranjang?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            setCart([]);
            router.back();
          },
        },
      ],
    );
  }

  function handleApplyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (promoDefinitions[code]) {
      setAppliedPromo({ code, ...promoDefinitions[code] });
      setPromoEnabled(true);
      setPromoCode("");
    } else {
      Alert.alert("Kode Promo Tidak Valid", "Kode promo tidak ditemukan.");
    }
  }

  function handleHoldOrder() {
    if (cart.length === 0) return;
    const label = customerName || tableNumber || orderType;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const held = {
      id: `hold-${Date.now()}`,
      items: [...cart],
      customerName,
      tableNumber,
      orderType,
      createdAt: timeStr,
      label,
    };
    setHeldOrders((prev) => [held, ...prev]);
    setCart([]);
    Alert.alert("Pesanan Ditahan", `Pesanan "${label}" telah ditahan.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  function handlePay() {
    if (cart.length === 0) return;

    setCartSnapshot([...cart]);
    const orderId = `#ORD-${String(posOrders.length + 1).padStart(4, "0")}`;
    const tableLabel =
      tableNumber.trim() ||
      (orderType === "Dine In"
        ? "Dine In"
        : orderType === "Take Away"
          ? "Takeaway"
          : "Delivery");

    const order = buildPosOrderFromCart({
      orderId,
      shiftId: shiftData?.shiftId,
      cart,
      customerName,
      tableLabel,
      orderType,
      discountAmount: discount,
      taxAmount: ppn,
      grandTotal: total,
      promoCode: promoEnabled ? appliedPromo?.code : undefined,
    });

    setPosOrders((prev) => [order, ...prev]);

    router.push({
      pathname: "/pilih-pembayaran",
      params: {
        orderId,
      },
    });
  }

  const trashBtn = (
    <TouchableOpacity activeOpacity={0.7} onPress={handleClearCart}>
      <View style={styles.trashBtn}>
        <Ionicons
          name="trash-outline"
          size={18}
          color={ColorDanger.danger600}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Keranjang"
        subtitle={`${totalItems} item`}
        showBack
        onBack={() => router.back()}
        actions={trashBtn}
        maxWidth={contentMaxWidth}
      />

      <XStack
        flex={1}
        gap={0}
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
          style={[styles.tabletLeft, !isTablet && styles.stackPanel]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          <CartItemsCard
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            onUpdateNote={handleUpdateNote}
          />
        </ScrollView>

        {isTablet ? <View style={styles.tabletDivider} /> : null}

        <ScrollView
          style={[styles.tabletRight, !isTablet && styles.stackPanel]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          <YStack gap={12}>
            <CustomerInfoCard
              customerName={customerName}
              onCustomerNameChange={setCustomerName}
              tableNumber={tableNumber}
              onTableNumberChange={setTableNumber}
              orderType={orderType}
              onOrderTypeChange={setOrderType}
            />

            <PromoCard
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
              onApplyPromo={handleApplyPromo}
              appliedPromo={appliedPromo}
              promoEnabled={promoEnabled}
              onTogglePromo={() => setPromoEnabled((v) => !v)}
            />

            <PriceSummaryCard
              subtotal={subtotal}
              discount={discount}
              ppn={ppn}
              total={total}
            />

            {/* Action buttons inline on tablet */}
            <YStack gap={8}>
              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                title="Bayar Sekarang"
                disabled={cart.length === 0}
                onPress={handlePay}
                icon={
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color={ColorBase.white}
                  />
                }
              />
              <AppButton
                variant="outline"
                size="md"
                fullWidth
                title="Tahan Pesanan"
                disabled={cart.length === 0}
                onPress={handleHoldOrder}
                icon={
                  <Ionicons
                    name="pause-circle-outline"
                    size={16}
                    color={ColorPrimary.primary600}
                  />
                }
              />
            </YStack>
          </YStack>
        </ScrollView>
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
  trashBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ColorDanger.danger50,
    alignItems: "center",
    justifyContent: "center",
  },
  tabletLeft: {
    flex: 0.55,
    backgroundColor: ColorBase.bgScreen,
  },
  tabletDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  tabletRight: {
    flex: 0.45,
    backgroundColor: ColorBase.white,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  stackPanel: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
});

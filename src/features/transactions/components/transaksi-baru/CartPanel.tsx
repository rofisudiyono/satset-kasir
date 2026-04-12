import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { YStack } from "tamagui";

import { TextH3 } from "@/components";
import {
  BottomActionBar,
  CartItemsCard,
  CustomerInfoCard,
  PriceSummaryCard,
  PromoCard,
} from "@/features/cart";
import {
  cartAtom,
  cartSnapshotAtom,
  heldOrdersAtom,
} from "@/features/cart/store/cart.store";
import { promoDefinitions } from "@/features/payment/api/payment.data";
import { buildPosOrderFromCart } from "@/features/pos/pos.utils";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import { shiftDataAtom } from "@/features/shift/store/shift.store";
import { ColorBase, ColorDanger, ColorNeutral } from "@/themes/Colors";
import type { AppliedPromo, OrderType } from "@/types";

const PPN_RATE = 0.11;

export function CartPanel() {
  const router = useRouter();
  const [cart, setCart] = useAtom(cartAtom);
  const [, setHeldOrders] = useAtom(heldOrdersAtom);
  const [, setCartSnapshot] = useAtom(cartSnapshotAtom);
  const [posOrders, setPosOrders] = useAtom(posOrdersAtom);
  const [shiftData] = useAtom(shiftDataAtom);

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("Dine In");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoEnabled, setPromoEnabled] = useState(false);

  const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0);
  const discount = appliedPromo && promoEnabled ? appliedPromo.discount : 0;
  const afterDiscount = subtotal - discount;
  const ppn = Math.round(afterDiscount * PPN_RATE);
  const total = afterDiscount + ppn;

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
        { text: "Hapus", style: "destructive", onPress: () => setCart([]) },
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
    Alert.alert("Pesanan Ditahan", `Pesanan "${label}" telah ditahan.`);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextH3 fontWeight="700">Keranjang</TextH3>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClearCart}
          style={styles.trashBtn}
        >
          <Ionicons
            name="trash-outline"
            size={16}
            color={ColorDanger.danger600}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <YStack gap={12} paddingHorizontal={16} paddingTop={12}>
          <CartItemsCard
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            onUpdateNote={handleUpdateNote}
          />
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
        </YStack>
      </ScrollView>

      <BottomActionBar
        cartLength={cart.length}
        onHoldOrder={handleHoldOrder}
        onPay={handlePay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: ColorNeutral.neutral100,
    backgroundColor: ColorBase.white,
  },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ColorDanger.danger50,
    alignItems: "center",
    justifyContent: "center",
  },
});

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
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  BottomActionBar,
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
import { AppButton, PageHeader } from "@/components";
import { useDeviceLayout } from "@/hooks/useDeviceLayout";
import { ColorBase, ColorDanger, ColorPrimary } from "@/themes/Colors";
import type { AppliedPromo, OrderType } from "@/types";

const PPN_RATE = 0.11;

export default function KeranjangPage() {
  const router = useRouter();
  const [cart, setCart] = useAtom(cartAtom);
  const [, setHeldOrders] = useAtom(heldOrdersAtom);
  const [, setCartSnapshot] = useAtom(cartSnapshotAtom);
  const { useTwoPaneLayout } = useDeviceLayout();

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
    setCartSnapshot([...cart]);
    const itemsSummary = cart
      .map(
        (c) =>
          `${c.productName}${c.variantLabel ? ` (${c.variantLabel})` : ""} x${c.quantity}`,
      )
      .join(", ");
    const label = customerName || tableNumber || orderType;
    router.push({
      pathname: "/pilih-pembayaran",
      params: {
        total: String(total),
        totalItems: String(totalItems),
        discount: String(discount),
        items: itemsSummary,
        customerLabel: label,
      },
    });
  }

  const trashBtn = (
    <TouchableOpacity activeOpacity={0.7} onPress={handleClearCart}>
      <View style={styles.trashBtn}>
        <Ionicons name="trash-outline" size={18} color={ColorDanger.danger600} />
      </View>
    </TouchableOpacity>
  );

  // ── Tablet: 2-column layout ────────────────────────────────────────────────
  if (useTwoPaneLayout) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="Keranjang"
          subtitle={`${totalItems} item`}
          showBack
          onBack={() => router.back()}
          actions={trashBtn}
        />

        <XStack flex={1} gap={0}>
          {/* Left: cart items */}
          <ScrollView
            style={styles.tabletLeft}
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

          {/* Divider */}
          <View style={styles.tabletDivider} />

          {/* Right: summary + actions */}
          <ScrollView
            style={styles.tabletRight}
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
                    <Ionicons name="card-outline" size={18} color={ColorBase.white} />
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
                    <Ionicons name="pause-circle-outline" size={16} color={ColorPrimary.primary600} />
                  }
                />
              </YStack>
            </YStack>
          </ScrollView>
        </XStack>
      </SafeAreaView>
    );
  }

  // ── Phone layout ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Keranjang"
        subtitle={`${totalItems} item`}
        showBack
        onBack={() => router.back()}
        actions={trashBtn}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <YStack paddingHorizontal={16} gap={12} paddingTop={8}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
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
  },
});

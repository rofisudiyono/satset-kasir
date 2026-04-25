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
  cartOrderDraftAtom,
  cartSnapshotAtom,
  heldOrdersAtom,
} from "@/features/cart/store/cart.store";
import {
  useTablesQuery,
  useTaxSettingsQuery,
  useValidatePromoMutation,
} from "@/hooks/api/use-kasir-api";
import { buildPosOrderFromCart } from "@/features/pos/pos.utils";
import { getApiErrorMessage } from "@/lib/api/client";
import { calculateTaxBreakdown } from "@/lib/tax";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import { shiftDataAtom } from "@/features/shift/store/shift.store";
import type { KasirTable } from "@/lib/api/types";
import { ColorBase, ColorDanger, ColorNeutral, ColorSurface } from "@/themes/Colors";
import type { AppliedPromo, OrderType } from "@/types";

type CartPanelProps = {
  compact?: boolean;
};

export function CartPanel({ compact = false }: CartPanelProps) {
  const router = useRouter();
  const [cart, setCart] = useAtom(cartAtom);
  const [orderDraft, setOrderDraft] = useAtom(cartOrderDraftAtom);
  const [, setHeldOrders] = useAtom(heldOrdersAtom);
  const [, setCartSnapshot] = useAtom(cartSnapshotAtom);
  const [posOrders, setPosOrders] = useAtom(posOrdersAtom);
  const [shiftData] = useAtom(shiftDataAtom);

  const [customerName, setCustomerName] = useState(orderDraft.customerName);
  const [selectedTable, setSelectedTable] = useState<KasirTable | null>(null);
  const [orderType, setOrderType] = useState<OrderType>(orderDraft.orderType);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const { data: tables = [], isLoading: isTablesLoading } = useTablesQuery(true);
  const { data: taxSettings } = useTaxSettingsQuery(Boolean(shiftData?.shiftId));
  const validatePromoMutation = useValidatePromoMutation();

  const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0);
  const discount = appliedPromo && promoEnabled ? appliedPromo.discount : 0;
  const afterDiscount = subtotal - discount;
  const taxBreakdown = calculateTaxBreakdown(taxSettings, afterDiscount);
  const ppn = taxBreakdown.taxAmount;
  const total = taxBreakdown.grandTotal;

  React.useEffect(() => {
    if (!orderDraft.tableId) return;
    const restored = tables.find((table) => table.id === orderDraft.tableId);
    if (restored) setSelectedTable(restored);
  }, [orderDraft.tableId, tables]);

  React.useEffect(() => {
    if (orderType !== "Dine In") {
      setSelectedTable(null);
    }
  }, [orderType]);

  React.useEffect(() => {
    setOrderDraft({
      customerName,
      orderType,
      tableId: selectedTable?.id,
      tableLabel: selectedTable?.label,
    });
  }, [customerName, orderType, selectedTable, setOrderDraft]);

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

  async function handleApplyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    const menuIds = cart.map((item) => item.productId);
    setPromoLoading(true);
    try {
      const result = await validatePromoMutation.mutateAsync({ code, subtotal, menuIds });
      setAppliedPromo({
        promoId: result.promoId,
        code: result.code ?? code,
        name: result.name,
        type: result.type,
        value: result.value,
        discount: result.discount,
        label:
          result.type === "percent"
            ? `${result.code} — Diskon ${result.value}%`
            : `${result.code} — Hemat Rp ${result.discount.toLocaleString("id-ID")}`,
      });
      setPromoEnabled(true);
      setPromoCode("");
    } catch (err) {
      Alert.alert(
        "Kode Promo Tidak Valid",
        getApiErrorMessage(err) ?? "Kode promo tidak ditemukan atau tidak berlaku.",
      );
    } finally {
      setPromoLoading(false);
    }
  }

  function handleHoldOrder() {
    if (cart.length === 0) return;
    if (orderType === "Dine In" && !selectedTable) {
      Alert.alert("Pilih meja dulu", "Order dine-in wajib memilih meja aktif sebelum ditahan.");
      return;
    }

    const label = customerName || selectedTable?.label || orderType;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const held = {
      id: `hold-${Date.now()}`,
      items: [...cart],
      customerName,
      tableId: selectedTable?.id,
      tableLabel: selectedTable?.label,
      tableNumber: selectedTable?.label ?? "",
      orderType,
      createdAt: timeStr,
      label,
    };
    setHeldOrders((prev) => [held, ...prev]);
    setCart([]);
    setOrderDraft({
      customerName: "",
      orderType: "Dine In",
      tableId: undefined,
      tableLabel: undefined,
    });
    Alert.alert("Pesanan Ditahan", `Pesanan "${label}" telah ditahan.`);
  }

  function handlePay() {
    if (cart.length === 0) return;
    if (orderType === "Dine In" && !selectedTable) {
      Alert.alert("Pilih meja dulu", "Order dine-in wajib memilih meja aktif sebelum pembayaran.");
      return;
    }

    setCartSnapshot([...cart]);
    const orderId = `#ORD-${String(posOrders.length + 1).padStart(4, "0")}`;
    const tableLabel =
      selectedTable?.label ||
      (orderType === "Dine In"
        ? "Dine In"
        : orderType === "Take Away"
          ? "Takeaway"
          : "Delivery");

    const order = buildPosOrderFromCart({
      orderId,
      shiftId: shiftData?.shiftId,
      cart,
      tableId: selectedTable?.id,
      customerName,
      tableLabel,
      orderType,
      discountAmount: discount,
      taxAmount: ppn,
      grandTotal: total,
      promoCode: promoEnabled ? appliedPromo?.code : undefined,
      promoId: promoEnabled ? appliedPromo?.promoId : undefined,
    });

    setPosOrders((prev) => [order, ...prev]);
    setOrderDraft({
      customerName,
      orderType,
      tableId: selectedTable?.id,
      tableLabel: selectedTable?.label,
    });

    router.push({
      pathname: "/pilih-pembayaran",
      params: {
        orderId,
      },
    });
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <TextH3
          fontWeight="800"
          color={compact ? ColorNeutral.neutral900 : undefined}
        >
          Keranjang
        </TextH3>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClearCart}
          style={[styles.trashBtn, compact && styles.trashBtnCompact]}
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
        contentContainerStyle={{ paddingBottom: compact ? 92 : 100 }}
      >
        <YStack
          gap={compact ? 10 : 12}
          paddingHorizontal={compact ? 12 : 16}
          paddingTop={compact ? 10 : 12}
        >
          <CartItemsCard
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            onUpdateNote={handleUpdateNote}
          />
          <CustomerInfoCard
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            selectedTableId={selectedTable?.id}
            selectedTableLabel={selectedTable?.label}
            tables={tables}
            isTablesLoading={isTablesLoading}
            onSelectTable={setSelectedTable}
          />
          <PromoCard
            promoCode={promoCode}
            onPromoCodeChange={setPromoCode}
            onApplyPromo={() => { void handleApplyPromo(); }}
            appliedPromo={appliedPromo}
            promoEnabled={promoEnabled}
            onTogglePromo={() => setPromoEnabled((v) => !v)}
            isLoading={promoLoading}
          />
          <PriceSummaryCard
            subtotal={subtotal}
            discount={discount}
            ppn={ppn}
            total={total}
            taxLabel={taxSettings?.label ?? "PPN"}
            taxRate={taxBreakdown.rate}
          />
        </YStack>
      </ScrollView>

      <BottomActionBar
        cartLength={cart.length}
        onHoldOrder={handleHoldOrder}
        onPay={handlePay}
        compact={compact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorSurface.surfaceMuted,
  },
  containerCompact: {
    backgroundColor: "#FDFFFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: ColorSurface.border,
    backgroundColor: ColorBase.white,
  },
  headerCompact: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#FDFFFA",
    borderBottomColor: "rgba(65, 184, 58, 0.1)",
  },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ColorDanger.danger50,
    alignItems: "center",
    justifyContent: "center",
  },
  trashBtnCompact: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#FFF1EE",
  },
});
